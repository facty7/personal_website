# SR3 & 3DGS Processing Platform

A full-stack platform for image super-resolution (SR3) and 3D reconstruction (3D Gaussian Splatting) with Vercel frontend and Hugging Face Spaces backend.

## Architecture

- **Frontend**: Next.js application deployed on Vercel
- **Backend**: FastAPI + Gradio application deployed on Hugging Face Spaces
- **Communication**: REST API between frontend and backend

## Project Structure

```
project-root/
├── frontend/                 # Next.js frontend for Vercel
│   ├── app/                 # Next.js app router pages
│   ├── components/          # React components
│   ├── lib/
│   │   └── api.ts          # API client for backend communication
│   ├── public/              # Static assets
│   └── package.json
├── backend/                 # FastAPI + Gradio backend for HF Spaces
│   ├── app.py              # Main application with API endpoints
│   ├── requirements.txt    # Python dependencies
│   └── README.md           # Backend-specific documentation
└── README.md               # This file
```

## API Communication Format

### SR3 (Super-Resolution) Endpoint

**Request:**
- Method: `POST /api/sr3/`
- Content-Type: `multipart/form-data`
- Body: `image` field containing an image file

**Response:**
```json
{
  "status": "success",
  "message": "Processing status message",
  "image_url": "URL to download enhanced image",
  "filename": "sr3_output.png"
}
```

### 3DGS (3D Gaussian Splatting) Endpoint

**Request:**
- Method: `POST /api/3dgs/`
- Content-Type: `multipart/form-data`
- Body: Multiple `image` fields containing image files

**Response:**
```json
{
  "status": "success",
  "message": "Processing status message",
  "ply_url": "URL to download .ply file",
  "request_id": "unique-id-for-download",
  "filename": "reconstruction.ply"
}
```

**File Download:**
- `.ply` files can be downloaded via `GET /api/3dgs/download/{request_id}`

## Setup Instructions

### Backend (Hugging Face Spaces)

1. Create a new Space on Hugging Face
2. Select "Docker" as SDK
3. Copy `backend/` contents to the Space
4. The Space will automatically install dependencies and run `app.py`

### Frontend (Vercel)

1. Deploy the `frontend/` directory to Vercel
2. Set environment variable:
   ```
   NEXT_PUBLIC_BACKEND_URL=https://your-username-spaces.hf.space
   ```
3. The frontend will use the API client from `lib/api.ts`

## Development

### Backend Local Development
```bash
cd backend
pip install -r requirements.txt
python app.py
```

### Frontend Local Development
```bash
cd frontend
npm install
npm run dev
```

## Notes

- The current implementation provides placeholder processing logic
- Actual model integration is required for production use
- File storage is handled in-memory for demo purposes (not suitable for production)
- CORS is configured to allow all origins (restrict in production)

## License

MIT