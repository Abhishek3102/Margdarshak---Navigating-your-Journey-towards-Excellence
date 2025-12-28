import requests

try:
    url = "http://127.0.0.1:8000/api/quiz/result/latest"
    print(f"Testing URL: {url}")
    response = requests.get(url)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text[:200]}")
except Exception as e:
    print(f"Error: {e}")
