from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from fastapi.concurrency import run_in_threadpool
from app.utils.cloudinary_utils import upload_file_to_cloudinary
import shutil
import os
import uuid
import traceback

router = APIRouter()

TEMP_DIR = "temp_uploads"
os.makedirs(TEMP_DIR, exist_ok=True)

@router.post("/upload")
async def upload_content(
    file: UploadFile = File(...),
    resource_type: str = Form("auto") # 'video', 'image', or 'auto'
):
    """
    Uploads a file to Cloudinary.
    """
    temp_file_path = None
    try:
        print(f"Receiving upload: {file.filename} type={resource_type}")

        # Basic Validation
        if resource_type == "video" and not file.content_type.startswith('video/'):
            raise HTTPException(status_code=400, detail="File must be a video")
        if resource_type == "image" and not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")

        # Create temp file
        ext = file.filename.split('.')[-1] if '.' in file.filename else "tmp"
        # Sanitize filename
        safe_filename = "".join([c for c in file.filename if c.isalpha() or c.isdigit() or c in ('.', '_')]).rstrip()
        temp_filename = f"{uuid.uuid4()}_{safe_filename}"
        temp_file_path = os.path.join(TEMP_DIR, temp_filename)

        print(f"Writing to temp file: {temp_file_path}")
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        print(f"Saved temp file successfully. Size: {os.path.getsize(temp_file_path)} bytes")

        # Upload - BLOCKING, run in threadpool
        public_id = safe_filename.split('.')[0]
        
        print("Starting Cloudinary upload (this may take time)...")
        
        result = await run_in_threadpool(
            upload_file_to_cloudinary, 
            local_file_path=temp_file_path, 
            public_id=public_id,
            resource_type=resource_type
        )

        if not result:
             raise Exception("Cloudinary returned no result.")

        print("Cloudinary Upload Success!")
        
        # PREFER EAGER URL for Videos (Compressed Version)
        final_url = result.get("secure_url")
        if resource_type == "video" and result.get("eager"):
            try:
                # Eager returns a list of transformed versions. We pick the first one.
                final_url = result["eager"][0].get("secure_url", final_url)
                print(f"Using Eager Transformed URL: {final_url}")
            except Exception as e:
                print(f"Error parsing eager URL: {e}, falling back to standard.")

        return {
            "url": final_url,
            "duration": result.get("duration", 0), 
            "public_id": result.get("public_id"),
            "format": result.get("format")
        }

    except Exception as e:
        print(f"CRITICAL UPLOAD ERROR: {e}")
        traceback.print_exc() 
        raise HTTPException(status_code=500, detail=f"Upload Failed: {str(e)}")
    
    finally:
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
            except:
                pass
