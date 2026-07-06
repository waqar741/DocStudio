import re

def generate_filename(relationship: str, document_type: str, suffix: str, format: str) -> str:
    # 1. Base names
    parts = []
    if relationship and relationship.strip() and relationship.strip().lower() != "none":
        parts.append(relationship.strip().lower())
    if document_type and document_type.strip() and document_type.strip().lower() != "none":
        parts.append(document_type.strip().lower())
    if suffix and suffix.strip():
        parts.append(suffix.strip().lower())
        
    base = "_".join(parts) if parts else "document"
        
    # 3. Replace spaces and invalid chars with underscores
    base = re.sub(r'[\s\-]+', '_', base)
    base = re.sub(r'[^a-z0-9_]', '', base)
    
    # 4. Attach extension
    ext = format.lower()
    if ext == 'jpeg':
        ext = 'jpg'
        
    return f"{base}.{ext}"


def generate_image_filename(base_name: str, document_type: str, format: str) -> str:
    parts = []

    if base_name and base_name.strip():
        parts.append(base_name.strip())
    else:
        parts.append("document")

    if document_type and document_type.strip() and document_type.strip().lower() != "none":
        parts.append(document_type.strip())

    base = "".join(parts)
    base = re.sub(r'[\s\-]+', '', base)
    base = re.sub(r'[^A-Za-z0-9_]', '', base)

    ext = format.lower()
    if ext in ('jpg', 'jpeg'):
        ext = 'jpeg'

    return f"{base}.{ext}"
