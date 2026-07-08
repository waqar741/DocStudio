import fitz  # PyMuPDF
import io
import zipfile
from PIL import Image

def _compress_pdf_images(doc, quality: int, max_dim: int = None):
    for i in range(len(doc)):
        page = doc[i]
        image_list = page.get_images(full=True)
        for img in image_list:
            xref = img[0]
            try:
                base_image = doc.extract_image(xref)
                if not base_image: continue
                image_bytes = base_image["image"]
                
                img_pil = Image.open(io.BytesIO(image_bytes))
                if img_pil.mode in ("RGBA", "P"): 
                    img_pil = img_pil.convert("RGB")
                
                if max_dim:
                    w, h = img_pil.size
                    if w > max_dim or h > max_dim:
                        ratio = min(max_dim/w, max_dim/h)
                        img_pil = img_pil.resize((int(w*ratio), int(h*ratio)), Image.Resampling.LANCZOS)
                
                out_bytes = io.BytesIO()
                img_pil.save(out_bytes, format="JPEG", quality=quality, optimize=True)
                new_image_bytes = out_bytes.getvalue()
                
                if len(new_image_bytes) < len(image_bytes):
                    page.replace_image(xref, stream=new_image_bytes)
            except Exception:
                pass

def compress_pdf(file_bytes: bytes, level: str = "balanced", target_kb: int = 0) -> bytes:
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    
    if target_kb > 0:
        target_bytes = target_kb * 1024
        current_bytes = len(file_bytes)
        
        if current_bytes <= target_bytes:
            return file_bytes
            
        low, high = 5, 90
        best_bytes = None
        
        for _ in range(6):
            mid = (low + high) // 2
            test_doc = fitz.open(stream=file_bytes, filetype="pdf")
            _compress_pdf_images(test_doc, mid)
            test_bytes = test_doc.tobytes(garbage=3, deflate=True)
            
            if not best_bytes or len(test_bytes) < len(best_bytes):
                best_bytes = test_bytes
            
            if len(test_bytes) <= target_bytes:
                low = mid + 1
            else:
                high = mid - 1
                
        if best_bytes and len(best_bytes) <= target_bytes:
            return best_bytes
        else:
            _compress_pdf_images(doc, 5, max_dim=800)
            fallback_bytes = doc.tobytes(garbage=4, deflate=True, clean=True)
            if best_bytes and len(best_bytes) < len(fallback_bytes):
                return best_bytes
            return fallback_bytes
    else:
        if level == "max":
            _compress_pdf_images(doc, 40)
            return doc.tobytes(garbage=4, deflate=True, clean=True)
        elif level == "balanced":
            _compress_pdf_images(doc, 70)
            return doc.tobytes(garbage=3, deflate=True)
        else: # high quality
            return doc.tobytes(garbage=1, deflate=True)

def split_pdf(file_bytes: bytes, split_type: str, ranges: str, original_name: str) -> tuple[bytes, str, str]:
    """
    Returns (content_bytes, mime_type, filename)
    split_type: 'every_page', 'ranges', 'extract'
    ranges: e.g. "1-5,8,11-13" (1-indexed)
    """
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    base_name = original_name.rsplit('.', 1)[0]
    
    if split_type == "every_page":
        # Create a ZIP containing every page as a single PDF
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, "a", zipfile.ZIP_DEFLATED, False) as zip_file:
            for i in range(len(doc)):
                new_doc = fitz.open()
                new_doc.insert_pdf(doc, from_page=i, to_page=i)
                pdf_bytes = new_doc.tobytes(garbage=3, deflate=True)
                zip_file.writestr(f"{base_name}_page_{i+1}.pdf", pdf_bytes)
                new_doc.close()
        return zip_buffer.getvalue(), "application/zip", f"{base_name}_split.zip"
        
    elif split_type == "extract":
        # Create a single PDF with only the extracted ranges
        new_doc = fitz.open()
        pages = _parse_ranges(ranges, len(doc))
        for p in pages:
            new_doc.insert_pdf(doc, from_page=p, to_page=p)
        result = new_doc.tobytes(garbage=3, deflate=True)
        new_doc.close()
        return result, "application/pdf", f"{base_name}_extracted.pdf"
        
    elif split_type == "ranges":
        # Create a ZIP containing one PDF per range
        zip_buffer = io.BytesIO()
        range_list = ranges.split(',')
        with zipfile.ZipFile(zip_buffer, "a", zipfile.ZIP_DEFLATED, False) as zip_file:
            for idx, r in enumerate(range_list):
                r = r.strip()
                if not r: continue
                new_doc = fitz.open()
                if '-' in r:
                    start, end = r.split('-')
                    s = max(0, int(start)-1)
                    e = min(len(doc)-1, int(end)-1)
                    new_doc.insert_pdf(doc, from_page=s, to_page=e)
                else:
                    p = max(0, min(len(doc)-1, int(r)-1))
                    new_doc.insert_pdf(doc, from_page=p, to_page=p)
                
                pdf_bytes = new_doc.tobytes(garbage=3, deflate=True)
                zip_file.writestr(f"{base_name}_part_{idx+1}.pdf", pdf_bytes)
                new_doc.close()
        return zip_buffer.getvalue(), "application/zip", f"{base_name}_ranges.zip"
        
    return b'', 'application/pdf', 'error.pdf'

def rotate_pages(file_bytes: bytes, rotations: dict[int, int]) -> bytes:
    # rotations mapping: page_index (0-indexed) -> angle (90, 180, 270)
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    for page_idx, angle in rotations.items():
        if 0 <= page_idx < len(doc):
            page = doc[page_idx]
            page.set_rotation(page.rotation + angle)
    return doc.tobytes(garbage=3, deflate=True)

def rearrange_pages(file_bytes: bytes, new_order: list[int]) -> bytes:
    # new_order is a list of 0-indexed page numbers
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    new_doc = fitz.open()
    for p in new_order:
        if 0 <= p < len(doc):
            new_doc.insert_pdf(doc, from_page=p, to_page=p)
    res = new_doc.tobytes(garbage=3, deflate=True)
    new_doc.close()
    return res

def delete_pages(file_bytes: bytes, pages_to_delete: list[int]) -> bytes:
    # pages_to_delete: 0-indexed indices
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    # We must delete in reverse order to avoid shifting indices!
    pages_to_delete = sorted(list(set(pages_to_delete)), reverse=True)
    for p in pages_to_delete:
        if 0 <= p < len(doc):
            doc.delete_page(p)
    return doc.tobytes(garbage=3, deflate=True)

def add_blank_page(file_bytes: bytes, position: int, size: str = "A4") -> bytes:
    # position: 0-indexed index to insert BEFORE. If position == len(doc), insert at end.
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    
    width, height = fitz.paper_size("A4")
    if size.lower() == "letter":
        width, height = fitz.paper_size("letter")
    elif size.lower() == "legal":
        width, height = fitz.paper_size("legal")
        
    doc.insert_page(position, width=width, height=height)
    return doc.tobytes(garbage=3, deflate=True)


def _parse_ranges(ranges: str, max_len: int) -> list[int]:
    pages = set()
    for r in ranges.split(','):
        r = r.strip()
        if not r: continue
        if '-' in r:
            start, end = r.split('-')
            s = max(0, int(start)-1)
            e = min(max_len-1, int(end)-1)
            for i in range(s, e+1):
                pages.add(i)
        else:
            pages.add(max(0, min(max_len-1, int(r)-1)))
    return sorted(list(pages))
