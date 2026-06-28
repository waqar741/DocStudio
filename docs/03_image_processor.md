# 03 Image Processor

The Image Processor is a client-server module designed for adjusting and exporting documents. 
All heavy image processing occurs in the Python/FastAPI backend to ensure maximum performance and reliable format conversions.

## Core Features
1. **Upload**: Supports standard image formats.
2. **Manual Crop**: Frontend allows visual cropping using `react-easy-crop`.
3. **Settings Selection**: Users select output format, resolution, target KB size, and naming rules.
4. **Backend Processing**: The frontend sends the image, crop coordinates, and settings to the FastAPI backend via a `multipart/form-data` POST request.
5. **Download**: The backend returns the processed `Blob` and correct filename, which is safely downloaded by the browser.

## Backend Responsibilities
The Python backend (`/api/process-image`) uses Pillow to perform:
- Coordinate-based cropping.
- Exact dimension resizing.
- Iterative compression to hit target KB limits.
- Format conversion (JPG, PNG, WEBP).
- Standardized, lowercase smart naming generation.

*Note: Automatic document detection and local client-side processing have been explicitly removed to streamline the architecture and improve reliability.*
