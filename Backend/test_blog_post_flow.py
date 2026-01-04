import requests
import json
import random
import string

BASE_URL = "http://127.0.0.1:8000/api"

def random_string(length=10):
    return ''.join(random.choices(string.ascii_letters, k=length))

def test_flow():
    email = f"test_{random_string()}@example.com"
    password = "password123"
    name = f"Test User {random_string(5)}"

    # 1. Register
    print(f"1. Registering {email}...")
    reg_res = requests.post(f"{BASE_URL}/auth/register", json={
        "email": email,
        "password": password,
        "full_name": name,
        "role": "student"
    })
    if reg_res.status_code != 200:
        print(f"Registration failed: {reg_res.text}")
        # Try login directly if user exists
    else:
        print("Registration successful.")

    # 2. Login
    print("2. Logging in...")
    login_res = requests.post(f"{BASE_URL}/auth/login", json={
        "email": email,
        "password": password
    })
    
    if login_res.status_code != 200:
        print(f"Login failed: {login_res.text}")
        return

    data = login_res.json()
    token = data.get("access_token")
    if not token:
        print("No token returned!")
        return
    print(f"Token received. Prefix: {token[:10]}")

    # 3. Create Blog
    print("3. Creating Blog Post...")
    blog_data = {
        "title": "Integration Test Blog",
        "content": "This is a test blog content created by python script.",
        "excerpt": "Test excerpt",
        "category": "Technology",
        "image_url": "https://example.com/image.jpg",
        "author_name": name
    }
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    blog_res = requests.post(f"{BASE_URL}/blog-agent/", json=blog_data, headers=headers)
    
    print(f"Blog Post Status: {blog_res.status_code}")
    print(f"Blog Post Response: {blog_res.text}")

if __name__ == "__main__":
    test_flow()
