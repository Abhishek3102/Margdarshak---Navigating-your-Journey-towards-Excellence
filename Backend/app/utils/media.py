import cloudinary
import cloudinary.uploader
import os
from dotenv import load_dotenv

load_dotenv()

# Configure Cloudinary
cloudinary.config(
  cloud_name = os.getenv('CLOUDINARY_CLOUD_NAME'),
  api_key = os.getenv('CLOUDINARY_API_KEY'),
  api_secret = os.getenv('CLOUDINARY_API_SECRET'),
  secure = True
)

async def upload_video_optimized(file_obj, public_id: str = None):
    """
    Uploads a video to Cloudinary with 'auto' quality compression.
    This ensures large files are reduced in size without significant visual loss.
    """
    try:
        response = cloudinary.uploader.upload(
            file_obj,
            resource_type = "video",
            public_id = public_id,
            # OPTIMIZATION:
            # q_auto: Automatically adjust quality (compression)
            # f_auto: Automatically choose best format for the browser (e.g. webm/mp4)
            transformation=[
                {'quality': "auto:low"}, # 'low' is aggressive compression for education videos where ultra-HD isn't critical
                {'fetch_format': "auto"}
            ]
        )
        return response
    except Exception as e:
        print(f"Cloudinary Upload Error: {e}")
        return None
