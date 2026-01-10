import cloudinary
import cloudinary.uploader
import cloudinary.api
import os
from dotenv import load_dotenv

load_dotenv()

# Configure Cloudinary
cloudinary.config( 
  cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME"), 
  api_key = os.getenv("CLOUDINARY_API_KEY"), 
  api_secret = os.getenv("CLOUDINARY_API_SECRET"),
  secure = True
)

def upload_file_to_cloudinary(local_file_path, public_id=None, resource_type="auto"):
    """
    Uploads a file (video or image) from a local path to Cloudinary.
    Uses 'upload_large' + 'eager_async' for videos to ensure stability.
    """
    print(f"Uploading to Cloudinary from: {local_file_path} as {resource_type}")
    
    # Default options
    options = {
        "resource_type": resource_type,
        "public_id": public_id,
        "folder": "margdarshak_content" 
    }

    # Apply specific transformations based on type
    if resource_type == "video":
        # CRITICAL FIX: Use Eager Async for large videos to prevent Timeouts
        # "transformation" (Incoming) blocks the upload. "eager" happens in background.
        options["eager"] = [
            { "quality": "auto:good", "fetch_format": "auto", "bit_rate": "500k" }
        ]
        options["eager_async"] = True 
        options["folder"] = "margdarshak_videos"
        options["chunk_size"] = 6000000 # 6MB chunks
        
        # Use upload_large for videos
        return cloudinary.uploader.upload_large(local_file_path, **options)

    elif resource_type == "image":
        options["transformation"] = [
            { "quality": "auto", "fetch_format": "auto" }
        ]
        options["folder"] = "margdarshak_thumbnails"
        
        return cloudinary.uploader.upload(local_file_path, **options)

    return cloudinary.uploader.upload(local_file_path, **options)
