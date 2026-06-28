import fitz  # PyMuPDF
import io
from fastapi import UploadFile
from PIL import Image

async def merge_documents(
    files: list[UploadFile],
    page_size: str = "A4",
    orientation: str = "portrait",
    margin: str = "none",
    output_format: str = "pdf",
    image_layout: str = "vertical"
) -> tuple[bytes, str]:
    """
    Merges a list of files (PDFs and Images) into a single PDF, or stitches images into a single image.
    """
    if output_format == "image":
        images = []
        for file in files:
            content = await file.read()
            try:
                img = Image.open(io.BytesIO(content))
                # Ensure image is in RGB mode for saving as JPEG
                if img.mode != "RGB":
                    img = img.convert("RGB")
                images.append(img)
            except Exception as e:
                print(f"Error opening image {file.filename}: {e}")
                
        if not images:
            raise ValueError("No valid images found to merge.")

        if image_layout == "horizontal":
            total_width = sum(img.width for img in images)
            max_height = max(img.height for img in images)
            merged_img = Image.new("RGB", (total_width, max_height), (255, 255, 255))
            x_offset = 0
            for img in images:
                merged_img.paste(img, (x_offset, 0))
                x_offset += img.width
        else: # vertical
            total_height = sum(img.height for img in images)
            max_width = max(img.width for img in images)
            merged_img = Image.new("RGB", (max_width, total_height), (255, 255, 255))
            y_offset = 0
            for img in images:
                merged_img.paste(img, (0, y_offset))
                y_offset += img.height

        img_byte_arr = io.BytesIO()
        merged_img.save(img_byte_arr, format='JPEG', quality=95)
        return img_byte_arr.getvalue(), "image/jpeg"

    merged_doc = fitz.open()

    for file in files:
        content = await file.read()
        mime = file.content_type or ""
        ext = file.filename.split('.')[-1].lower() if file.filename else ""

        if mime == "application/pdf" or ext == "pdf":
            # Append PDF
            try:
                sub_doc = fitz.open(stream=content, filetype="pdf")
                merged_doc.insert_pdf(sub_doc)
                sub_doc.close()
            except Exception as e:
                print(f"Error parsing PDF {file.filename}: {e}")
        else:
            # Assume Image (jpg, png, webp)
            try:
                # Open image with PyMuPDF
                img_doc = fitz.open(stream=content, filetype=ext if ext in ['png', 'jpg', 'jpeg', 'webp'] else None)
                
                # Convert image to a PDF byte stream
                pdf_bytes = img_doc.convert_to_pdf()
                img_doc.close()
                
                # Open the newly generated PDF and insert it
                sub_doc = fitz.open(stream=pdf_bytes, filetype="pdf")
                merged_doc.insert_pdf(sub_doc)
                sub_doc.close()
            except Exception as e:
                print(f"Error parsing Image {file.filename}: {e}")

    # Output generation
    res = merged_doc.tobytes(garbage=3, deflate=True)
    merged_doc.close()
    
    return res, "application/pdf"
