# 11 Image Processing Engine (Backend)

The core image processing algorithms have been moved to the FastAPI backend to ensure performance and avoid browser resource exhaustion.

## Technologies Used
- **Python**: Primary execution language.
- **Pillow (PIL)**: Used for robust loading, cropping, resizing, compressing, and encoding.

## Processing Pipeline (`/api/process-image`)

The frontend sends a `multipart/form-data` POST request. The backend executes the following steps sequentially:

1. **Memory Allocation**: The uploaded image bytes are loaded into an in-memory Pillow `Image` object. If the format requires JPEG encoding but the image has an Alpha channel (e.g. RGBA PNGs), it is safely converted to `RGB`.
2. **Cropping**: If manual crop coordinates (`crop_x`, `crop_y`, `crop_width`, `crop_height`) are supplied, the exact bounding box is extracted using `img.crop()`.
3. **Resizing**: If a resolution adjustment is requested (either a preset like `160x200` or a custom dimension), Pillow uses the high-quality `LANCZOS` resampling filter to perfectly scale the image to the target dimensions.
4. **Compression (Iterative Algorithm)**: 
   - If a `Target KB` size is provided (e.g., `< 50 KB`), the engine utilizes a binary-search algorithm. 
   - It performs up to 7 iterative memory passes, adjusting the JPEG/WEBP `quality` metric on each pass. 
   - It continually compares the output byte size until it successfully hits the maximum possible quality that remains strictly under the Target KB limit.
5. **Format Encoding**: The final optimized pixel array is encoded directly into bytes (JPG, PNG, WEBP).
6. **Delivery**: The bytes are streamed back to the client as a direct `Response`, embedded with a strongly-typed `Content-Disposition` header forcing the browser to securely download the exact smart filename.

*Note: Automated AI border detection and OpenCV capabilities have been removed to prioritize speed, simplicity, and architectural stability.*
