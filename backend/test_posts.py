
import requests
import json

url = "http://localhost:4000/api/v1/social/posts?limit=20"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer mock-access-token"
}

print(f"GET {url}")
try:
    response = requests.get(url, headers=headers)
    print(f"Status: {response.status_code}")
    data = response.json()
    print(f"Response keys: {data.keys()}")
    print(f"Success: {data.get('success')}")
    
    posts = data.get('data', [])
    print(f"Number of posts: {len(posts)}")
    
    if posts:
        print("\nFirst post structure:")
        post = posts[0]
        print(json.dumps(post, indent=2, default=str))
    else:
        print("No posts returned!")
except Exception as e:
    print(f"Error: {e}")
