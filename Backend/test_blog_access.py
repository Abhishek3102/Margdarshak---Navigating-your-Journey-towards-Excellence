import requests

def test_blog_get():
    url = "http://127.0.0.1:8000/api/blog-agent/"
    try:
        response = requests.get(url)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_blog_get()
