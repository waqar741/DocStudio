# 08 Architecture

DocStudio implements a lightweight, modular Client-Server Architecture.

## System Components

### 1. Frontend (Client)
- **Framework**: React 19 + Vite
- **Styling**: TailwindCSS
- **State Management**: Zustand for global state, React Context/Hooks for local state.
- **Responsibilities**: 
  - Provide a responsive, accessible user interface.
  - Render visual tools (e.g., `react-easy-crop` for manual image bounding boxes).
  - Collect user settings (resize, compress, formatting, naming).
  - Communicate with the backend API via standard multipart forms.

### 2. Backend (Server)
- **Framework**: Python + FastAPI
- **Image Processing**: Pillow (PIL)
- **Responsibilities**:
  - Accept heavy file uploads securely.
  - Perform actual byte-level file modifications (Crop, Resize, Compress, Format Conversion).
  - Enforce smart-naming rules on the final exported file.
  - Stream the final processed bytes back to the frontend with correct MIME types and `Content-Disposition` headers.

## API Integration

The Vite development server proxies all `/api` requests to the local FastAPI backend (typically running on `localhost:8000`). 
This guarantees no CORS issues and a single unified origin during development and production deployments.

## Directory Structure

```text
DocStudio/
├── backend/                  # Python FastAPI Application
│   ├── app/                  
│   │   ├── main.py           # FastAPI entrypoint
│   │   ├── services/         # Pillow processing logic
│   │   └── utils/            # Helper functions (e.g., smart naming)
│   └── requirements.txt      
├── src/                      # React Frontend Application
│   ├── components/           # Reusable UI library
│   ├── features/             # Feature-based modules (image, pdf, merge)
│   ├── store/                # Zustand global state
│   └── utils/                # General utility functions
```

*Note: All client-side image processing algorithms (OpenCV/Canvas) have been removed in favor of this dedicated, reliable Python backend.*
