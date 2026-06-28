import io
from fastapi import UploadFile
from PIL import Image

async def process_image(
    file: UploadFile,
    crop_box: tuple[int, int, int, int] | None = None,
    rotate: float = 0.0,
    resize_dim: tuple[int, int] | None = None,
    target_kb: int | None = None,
    format: str = "jpg"
) -> tuple[bytes, str]:
    
    # Read image
    content = await file.read()
    img = Image.open(io.BytesIO(content))
    
    # Convert RGBA to RGB if saving as JPEG
    if format.lower() in ['jpg', 'jpeg'] and img.mode in ('RGBA', 'P'):
        img = img.convert('RGB')

    # 0. Apply Rotation
    if rotate != 0.0:
        # Cropper.js rotates clockwise, Pillow rotates counter-clockwise.
        # expand=True ensures corners aren't cut off.
        img = img.rotate(-rotate, expand=True, resample=Image.Resampling.BICUBIC)

    # 1. Apply Crop
    if crop_box:
        img = img.crop(crop_box)

    # 2. Resize
    if resize_dim:
        # Exact resize as requested
        img = img.resize(resize_dim, Image.Resampling.LANCZOS)

    # Determine Pillow format and MIME
    pil_format = "JPEG"
    mime_type = "image/jpeg"
    if format.lower() == "png":
        pil_format = "PNG"
        mime_type = "image/png"
    elif format.lower() == "webp":
        pil_format = "WEBP"
        mime_type = "image/webp"

    # 3. Compress / Format
    if format.lower() == "png":
        # PNG compression is lossless, so we can't tune "quality" exactly like JPG.
        # We will apply max optimization. If they want a tiny file, they should use JPG/WEBP.
        output = io.BytesIO()
        img.save(output, format=pil_format, optimize=True)
        current_bytes = output.getvalue()
        if target_kb and len(current_bytes) > target_kb * 1024:
            # If PNG is too big, the best we can do without resizing is convert to 8-bit palette
            img = img.convert('P', palette=Image.ADAPTIVE, colors=256)
            output = io.BytesIO()
            img.save(output, format=pil_format, optimize=True)
        return output.getvalue(), mime_type

    if not target_kb:
        output = io.BytesIO()
        img.save(output, format=pil_format, quality=95, optimize=True)
        return output.getvalue(), mime_type

    # Target strict size constraint. E.g., if target is 19KB, we target 95% of that (~18KB)
    # to account for any filesystem or metadata overhead.
    target_bytes = int(target_kb * 1024 * 0.95)
    
    min_quality = 1
    max_quality = 100
    best_bytes = None
    
    # Try 100 quality first
    output = io.BytesIO()
    img.save(output, format=pil_format, quality=100, optimize=True)
    if len(output.getvalue()) <= target_bytes:
        return output.getvalue(), mime_type

    # Binary search for the best quality that fits under target_bytes
    for _ in range(8):
        quality = (min_quality + max_quality) // 2
        
        output = io.BytesIO()
        img.save(output, format=pil_format, quality=quality, optimize=True)
        current_bytes = output.getvalue()
        current_size = len(current_bytes)
        
        if current_size <= target_bytes:
            best_bytes = current_bytes
            min_quality = quality + 1
        else:
            max_quality = quality - 1

    # If it's still too big even at quality 1, just return the lowest possible quality
    if best_bytes is None:
        output = io.BytesIO()
        img.save(output, format=pil_format, quality=1, optimize=True)
        best_bytes = output.getvalue()

    return best_bytes, mime_type
