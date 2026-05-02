"""
STEP 1 (optional CLI) — get a LinkedIn access token and save it to .env.

Prefer the web UI: open the app and click “Connect LinkedIn” in the status bar
(same OAuth flow; tokens are stored under DATA_DIR / linkedin_tokens.json in the API).

Use this script only if you run the backend without the UI or want .env-based tokens.
"""

import requests
import urllib.parse
import threading
import webbrowser
from http.server import HTTPServer, BaseHTTPRequestHandler
from dotenv import load_dotenv
import os
import re

load_dotenv()

CLIENT_ID     = os.getenv("LINKEDIN_CLIENT_ID")
CLIENT_SECRET = os.getenv("LINKEDIN_CLIENT_SECRET")
REDIRECT_URI  = "http://localhost:8000/callback"
SCOPES        = "openid profile w_member_social"

auth_code_holder = {}

class CallbackHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        # Extract the 'code' from the URL
        parsed = urllib.parse.urlparse(self.path)
        params = urllib.parse.parse_qs(parsed.query)
        if "code" in params:
            auth_code_holder["code"] = params["code"][0]
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b"""
                <html><body style='font-family:Arial;text-align:center;padding:60px'>
                <h2 style='color:#0077B5'>LinkedIn Connected!</h2>
                <p>You can close this tab and go back to your terminal.</p>
                </body></html>
            """)
        else:
            self.send_response(400)
            self.end_headers()
            self.wfile.write(b"Error: No code received")

    def log_message(self, format, *args):
        pass  # Suppress server logs

def get_auth_url():
    params = {
        "response_type": "code",
        "client_id": CLIENT_ID,
        "redirect_uri": REDIRECT_URI,
        "scope": SCOPES,
        "state": "priyansh_agent_2026"
    }
    return "https://www.linkedin.com/oauth/v2/authorization?" + urllib.parse.urlencode(params)

def exchange_code_for_token(code):
    response = requests.post(
        "https://www.linkedin.com/oauth/v2/accessToken",
        data={
            "grant_type": "authorization_code",
            "code": code,
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "redirect_uri": REDIRECT_URI,
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    return response.json()

def get_profile_urn(access_token):
    response = requests.get(
        "https://api.linkedin.com/v2/userinfo",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    data = response.json()
    return data.get("sub"), data.get("name"), data.get("email", "N/A")

def save_to_env(token, urn):
    """Save token and URN into .env file"""
    env_path = ".env"
    with open(env_path, "r") as f:
        content = f.read()

    content = re.sub(r"LINKEDIN_ACCESS_TOKEN=.*", f"LINKEDIN_ACCESS_TOKEN={token}", content)
    content = re.sub(r"LINKEDIN_PERSON_URN=.*",   f"LINKEDIN_PERSON_URN=urn:li:person:{urn}", content)

    with open(env_path, "w") as f:
        f.write(content)

if __name__ == "__main__":
    print("\n" + "="*55)
    print("  🤖 Priyansh LinkedIn Agent — OAuth Setup")
    print("="*55)

    # Start local server in background thread
    server = HTTPServer(("localhost", 8000), CallbackHandler)
    thread = threading.Thread(target=server.handle_request)
    thread.start()

    # Open LinkedIn login in browser
    auth_url = get_auth_url()
    print("\n✅ Opening LinkedIn login in your browser...")
    print("   If it doesn't open, paste this URL manually:\n")
    print(f"   {auth_url}\n")
    webbrowser.open(auth_url)

    # Wait for the code
    thread.join(timeout=120)

    if "code" not in auth_code_holder:
        print("❌ Timed out. Please run again and log in within 2 minutes.")
        exit(1)

    print("✅ Got authorization code! Exchanging for access token...")
    token_data = exchange_code_for_token(auth_code_holder["code"])

    if "access_token" not in token_data:
        print(f"❌ Error getting token: {token_data}")
        exit(1)

    access_token = token_data["access_token"]
    print("✅ Access token received!")

    print("✅ Fetching your LinkedIn profile info...")
    urn, name, email = get_profile_urn(access_token)

    save_to_env(access_token, urn)

    print("\n" + "="*55)
    print(f"  🎉 Setup Complete!")
    print("="*55)
    print(f"  Name  : {name}")
    print(f"  Email : {email}")
    print(f"  URN   : urn:li:person:{urn}")
    print(f"\n  ✅ Token saved to .env")
    print(f"  ✅ Token valid for: 2 months")
    print("\n  👉 Now run: python step2_agent.py")
    print("="*55 + "\n")
