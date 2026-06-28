from fastapi import FastAPI, UploadFile, Form, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
import uvicorn

from .services.image_service import process_image
from .services.pdf_service import (
    compress_pdf, split_pdf, rotate_pages, rearrange_pages,
    delete_pages, add_blank_page
)
from .utils.naming import generate_filename

app = FastAPI(title="DocStudio Image API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/process-image")
async def api_process_image(
    image: UploadFile = File(...),
    # Crop & Transform
    crop_x: int = Form(0),
    crop_y: int = Form(0),
    crop_width: int = Form(0),
    crop_height: int = Form(0),
    rotate: float = Form(0.0),
    # Settings
    resolution: str = Form("original"), # "original", "160x200", "300x300", "600x600"
    custom_width: int = Form(0),
    custom_height: int = Form(0),
    target_kb: str = Form("none"), # "none", "19", "50", "100", "custom"
    custom_kb: int = Form(0),
    format: str = Form("jpg"), # "jpg", "png", "webp"
    # Naming
    relationship: str = Form("Self"),
    document_type: str = Form("Document"),
    suffix: str = Form(""),
):
    try:
        # Generate final filename
        filename = generate_filename(relationship, document_type, suffix, format)

        # Parse crop
        crop_box = None
        if crop_width > 0 and crop_height > 0:
            crop_box = (crop_x, crop_y, crop_x + crop_width, crop_y + crop_height)

        # Parse resize
        resize_dim = None
        if resolution != "original":
            if resolution == "custom" and custom_width > 0 and custom_height > 0:
                resize_dim = (custom_width, custom_height)
            else:
                parts = resolution.split('x')
                if len(parts) == 2:
                    resize_dim = (int(parts[0]), int(parts[1]))

        # Parse target KB
        target_size_kb = None
        if target_kb != "none":
            if target_kb == "custom" and custom_kb > 0:
                target_size_kb = custom_kb
            else:
                try:
                    target_size_kb = int(target_kb)
                except ValueError:
                    pass

        # Process image
        processed_bytes, mime_type = await process_image(
            file=image,
            crop_box=crop_box,
            rotate=rotate,
            resize_dim=resize_dim,
            target_kb=target_size_kb,
            format=format
        )

        return Response(
            content=processed_bytes,
            media_type=mime_type,
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
                "Access-Control-Expose-Headers": "Content-Disposition"
            }
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==========================================
# PDF ENDPOINTS
# ==========================================

import json

@app.post("/api/pdf/compress")
async def api_compress_pdf(
    file: UploadFile = File(...),
    level: str = Form("balanced"),
    filename: str = Form("compressed.pdf")
):
    try:
        content = await file.read()
        processed = compress_pdf(content, level)
        return Response(
            content=processed,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
                "Access-Control-Expose-Headers": "Content-Disposition"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/pdf/split")
async def api_split_pdf(
    file: UploadFile = File(...),
    split_type: str = Form("every_page"),
    ranges: str = Form(""),
    original_name: str = Form("document.pdf")
):
    try:
        content = await file.read()
        processed, mime, out_name = split_pdf(content, split_type, ranges, original_name)
        return Response(
            content=processed,
            media_type=mime,
            headers={
                "Content-Disposition": f'attachment; filename="{out_name}"',
                "Access-Control-Expose-Headers": "Content-Disposition"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/pdf/rotate")
async def api_rotate_pdf(
    file: UploadFile = File(...),
    rotations_json: str = Form("{}"), # e.g. '{"0": 90, "2": -90}'
    filename: str = Form("rotated.pdf")
):
    try:
        content = await file.read()
        rotations = {int(k): int(v) for k, v in json.loads(rotations_json).items()}
        processed = rotate_pages(content, rotations)
        return Response(
            content=processed,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
                "Access-Control-Expose-Headers": "Content-Disposition"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/pdf/rearrange")
async def api_rearrange_pdf(
    file: UploadFile = File(...),
    order_json: str = Form("[]"), # e.g. '[3, 0, 1, 2]'
    filename: str = Form("rearranged.pdf")
):
    try:
        content = await file.read()
        order = json.loads(order_json)
        processed = rearrange_pages(content, order)
        return Response(
            content=processed,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
                "Access-Control-Expose-Headers": "Content-Disposition"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/pdf/delete-pages")
async def api_delete_pages(
    file: UploadFile = File(...),
    delete_json: str = Form("[]"), # e.g. '[0, 2]'
    filename: str = Form("deleted.pdf")
):
    try:
        content = await file.read()
        to_delete = json.loads(delete_json)
        processed = delete_pages(content, to_delete)
        return Response(
            content=processed,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
                "Access-Control-Expose-Headers": "Content-Disposition"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/pdf/extract-pages")
async def api_extract_pages(
    file: UploadFile = File(...),
    ranges: str = Form(""), # e.g. "1-5, 8"
    original_name: str = Form("extracted.pdf")
):
    try:
        content = await file.read()
        processed, mime, out_name = split_pdf(content, "extract", ranges, original_name)
        return Response(
            content=processed,
            media_type=mime,
            headers={
                "Content-Disposition": f'attachment; filename="{out_name}"',
                "Access-Control-Expose-Headers": "Content-Disposition"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/pdf/add-blank-page")
async def api_add_blank_page(
    file: UploadFile = File(...),
    position: int = Form(0),
    size: str = Form("A4"),
    filename: str = Form("blank_added.pdf")
):
    try:
        content = await file.read()
        processed = add_blank_page(content, position, size)
        return Response(
            content=processed,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
                "Access-Control-Expose-Headers": "Content-Disposition"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
