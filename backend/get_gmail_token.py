"""
Run this ONCE locally to get your Gmail OAuth2 refresh token.
It will open a browser window — log in as signetracare@gmail.com and allow access.
Then paste the 3 values printed below into Railway as environment variables.

Usage:
  pip install google-auth-oauthlib
  python get_gmail_token.py
"""

import json
from google_auth_oauthlib.flow import InstalledAppFlow

# Only need permission to send emails
SCOPES = ["https://www.googleapis.com/auth/gmail.send"]

# Path to the credentials JSON you downloaded from Google Cloud Console
CREDENTIALS_FILE = "credentials.json"

def main():
    flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_FILE, SCOPES)
    creds = flow.run_local_server(port=0)

    print("\n" + "="*60)
    print("✅ SUCCESS! Add these 3 variables to Railway:")
    print("="*60)
    print(f"GMAIL_CLIENT_ID     = {creds.client_id}")
    print(f"GMAIL_CLIENT_SECRET = {creds.client_secret}")
    print(f"GMAIL_REFRESH_TOKEN = {creds.refresh_token}")
    print("="*60 + "\n")

if __name__ == "__main__":
    main()
