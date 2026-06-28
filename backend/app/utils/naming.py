import re

def generate_filename(relationship: str, document_type: str, suffix: str, format: str) -> str:
    # 1. Base names
    rel = relationship.strip().lower()
    doc = document_type.strip().lower()
    
    base = f"{rel}_{doc}"
    
    # 2. Add suffix if exists
    if suffix and suffix.strip():
        suf = suffix.strip().lower()
        base = f"{base}_{suf}"
        
    # 3. Replace spaces and invalid chars with underscores
    base = re.sub(r'[\s\-]+', '_', base)
    base = re.sub(r'[^a-z0-9_]', '', base)
    
    # 4. Attach extension
    ext = format.lower()
    if ext == 'jpeg':
        ext = 'jpg'
        
    return f"{base}.{ext}"
