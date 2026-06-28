import fitz  # PyMuPDF
import io
import zipfile
from fastapi import UploadFile
from PIL import Image

async def convert_documents(
    files: list[UploadFile],
    target_format: str
) -> tuple[bytes, str, str]:
    """
    Converts a list of files to the target format (pdf, jpg, png, webp).
    If multiple files are generated, returns a zip archive.
    Returns: (bytes, mime_type, suggested_filename)
    """
    target_format = target_format.lower()
    if target_format not in ['pdf', 'jpg', 'png', 'webp']:
        raise ValueError(f"Unsupported target format: {target_format}")

    results = []  # List of tuples: (filename, bytes)

    for idx, file in enumerate(files):
        content = await file.read()
        mime = file.content_type or ""
        base_name = file.filename.rsplit('.', 1)[0] if file.filename else f"file_{idx+1}"
        
        is_pdf = mime == "application/pdf" or file.filename.lower().endswith(".pdf")
        
        if target_format == "pdf":
            if is_pdf:
                # Already a PDF, just return it
                results.append((f"{base_name}.pdf", content))
            else:
                # Assume image, convert to PDF
                try:
                    img = Image.open(io.BytesIO(content))
                    if img.mode != "RGB":
                        img = img.convert("RGB")
                    pdf_bytes = io.BytesIO()
                    img.save(pdf_bytes, format="PDF", resolution=100.0)
                    results.append((f"{base_name}.pdf", pdf_bytes.getvalue()))
                except Exception as e:
                    print(f"Error converting image to PDF {file.filename}: {e}")
        else:
            # Target is an image format (jpg, png, webp)
            ext = 'jpeg' if target_format == 'jpg' else target_format
            
            if is_pdf:
                # Convert PDF to images
                try:
                    doc = fitz.open(stream=content, filetype="pdf")
                    for page_num in range(len(doc)):
                        page = doc.load_page(page_num)
                        pix = page.get_pixmap(dpi=300)
                        img_bytes = pix.tobytes(ext)
                        
                        suffix = f"_page{page_num+1}" if len(doc) > 1 else ""
                        results.append((f"{base_name}{suffix}.{target_format}", img_bytes))
                    doc.close()
                except Exception as e:
                    print(f"Error converting PDF to image {file.filename}: {e}")
            else:
                # Convert Image to Image
                try:
                    img = Image.open(io.BytesIO(content))
                    if target_format == 'jpg' and img.mode in ("RGBA", "P"):
                        img = img.convert("RGB")
                    
                    img_byte_arr = io.BytesIO()
                    img.save(img_byte_arr, format=ext.upper(), quality=95)
                    results.append((f"{base_name}.{target_format}", img_byte_arr.getvalue()))
                except Exception as e:
                    print(f"Error converting image to {target_format} {file.filename}: {e}")

    if not results:
        raise ValueError("No files were successfully converted.")

    if len(results) == 1:
        # Return single file
        filename, data = results[0]
        mime_type = "application/pdf" if target_format == "pdf" else f"image/{'jpeg' if target_format == 'jpg' else target_format}"
        return data, mime_type, filename
    else:
        # Return ZIP archive
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
            for filename, data in results:
                zip_file.writestr(filename, data)
        return zip_buffer.getvalue(), "application/zip", "converted_files.zip"
