import fitz
from PIL import Image
import io

def compress_pdf_images(file_bytes, quality=50):
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    # For every page
    for i in range(len(doc)):
        page = doc[i]
        image_list = page.get_images(full=True)
        for img_index, img in enumerate(image_list):
            xref = img[0]
            base_image = doc.extract_image(xref)
            image_bytes = base_image["image"]
            ext = base_image["ext"]
            
            # Open with PIL
            try:
                image = Image.open(io.BytesIO(image_bytes))
                if image.mode in ("RGBA", "P"): 
                    image = image.convert("RGB")
                
                # Save with new quality
                out_bytes = io.BytesIO()
                image.save(out_bytes, format="JPEG", quality=quality, optimize=True)
                new_image_bytes = out_bytes.getvalue()
                
                # If it's smaller, replace it
                if len(new_image_bytes) < len(image_bytes):
                    print(f"Replacing xref {xref}: {len(image_bytes)} -> {len(new_image_bytes)}")
                    # PyMuPDF doesn't have a direct 'replace_image' without creating a new xref and redrawing, 
                    # but wait! doc.update_stream(xref, new_image_bytes) only works if we update the image dictionary too, or maybe just:
                    # doc.update_stream(xref, new_image_bytes) might fail for images.
                    # PyMuPDF 1.21+ has `page.replace_image(xref, stream=new_image_bytes)` !
                    page.replace_image(xref, stream=new_image_bytes)
            except Exception as e:
                print(f"Failed to compress image xref {xref}: {e}")
                
    return doc.tobytes(garbage=3, deflate=True)

print("Script parsed successfully.")
