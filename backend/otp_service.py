"""
Signetra OTP Service
====================
Handles OTP generation, hashing, and email dispatch.

Email Strategy (in order):
  1. Gmail REST API (OAuth2)  — uses HTTPS/443, bypasses SMTP port blocks
  2. Gmail SMTP (App Password) — legacy fallback
Both always log the OTP code to the console for Railway log visibility.
"""

import os
import base64
import random
import hashlib
import smtplib
import requests
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta

# ---------------------------------------------------------------------------
# Configuration (loaded from environment variables)
# ---------------------------------------------------------------------------
# Gmail OAuth2 (primary — works from any cloud server)
GMAIL_CLIENT_ID     = os.getenv("GMAIL_CLIENT_ID", "").strip()
GMAIL_CLIENT_SECRET = os.getenv("GMAIL_CLIENT_SECRET", "").strip()
GMAIL_REFRESH_TOKEN = os.getenv("GMAIL_REFRESH_TOKEN", "").strip()

# Gmail SMTP (fallback)
GMAIL_EMAIL        = os.getenv("GMAIL_EMAIL", "").strip()
GMAIL_APP_PASSWORD = os.getenv("GMAIL_APP_PASSWORD", "").replace(" ", "").strip()

# Misc
OTP_DEV_MODE       = os.getenv("OTP_DEV_MODE", "false").lower() == "true"
OTP_EXPIRY_MINUTES = int(os.getenv("OTP_EXPIRY_MINUTES", "5"))


# ---------------------------------------------------------------------------
# Core OTP Helpers
# ---------------------------------------------------------------------------

def generate_otp() -> str:
    """Generate a cryptographically acceptable 6-digit OTP."""
    return f"{random.SystemRandom().randint(100000, 999999)}"


def hash_otp(code: str) -> str:
    """SHA-256 hash of the OTP for secure DB storage."""
    return hashlib.sha256(code.encode()).hexdigest()


def verify_otp(stored_hash: str, user_input: str) -> bool:
    """Compare user-supplied OTP against the stored hash."""
    return hash_otp(user_input.strip()) == stored_hash


def get_expiry() -> datetime:
    """Return a datetime OTP_EXPIRY_MINUTES from now."""
    return datetime.utcnow() + timedelta(minutes=OTP_EXPIRY_MINUTES)


# ---------------------------------------------------------------------------
# Email HTML Builder
# ---------------------------------------------------------------------------

def _build_email_html(otp_code: str) -> str:
    """Build a sleek HTML email for the OTP."""
    return f"""
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 480px; margin: 0 auto; background: #0a0e1a; border-radius: 16px; overflow: hidden; border: 1px solid rgba(77,142,255,0.2);">
        <div style="background: linear-gradient(135deg, #4d8eff 0%, #adc6ff 100%); padding: 32px; text-align: center;">
            <h1 style="color: #001a42; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">SIGNETRA</h1>
            <p style="color: #001a42; margin: 8px 0 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 3px; font-weight: 600;">Verification Code</p>
        </div>
        <div style="padding: 40px 32px; text-align: center;">
            <p style="color: #c2c6d6; font-size: 14px; margin: 0 0 24px 0;">Your one-time verification code is:</p>
            <div style="background: #1b1f2c; border: 1px solid rgba(77,142,255,0.3); border-radius: 12px; padding: 20px; display: inline-block;">
                <span style="color: #4d8eff; font-size: 36px; font-weight: 800; letter-spacing: 12px; font-family: 'Courier New', monospace;">{otp_code}</span>
            </div>
            <p style="color: #8a8e9c; font-size: 12px; margin: 24px 0 0 0;">This code expires in <strong style="color: #adc6ff;">{OTP_EXPIRY_MINUTES} minutes</strong>.</p>
            <p style="color: #8a8e9c; font-size: 11px; margin: 16px 0 0 0;">If you did not request this, please ignore this email.</p>
        </div>
        <div style="background: #0d1121; padding: 16px; text-align: center; border-top: 1px solid rgba(255,255,255,0.05);">
            <p style="color: #555; font-size: 10px; margin: 0;">© 2026 Signetra · ASL Recognition Platform</p>
        </div>
    </div>
    """


# ---------------------------------------------------------------------------
# Gmail REST API (OAuth2) — Primary Email Method
# ---------------------------------------------------------------------------

def _send_via_gmail_api(to_email: str, html_body: str, otp_code: str) -> bool:
    """Send email via Gmail REST API using OAuth2 refresh token.
    Uses HTTPS (port 443) — works from any cloud server regardless of SMTP blocks."""
    try:
        # 1. Exchange refresh token for a fresh access token
        token_resp = requests.post(
            "https://oauth2.googleapis.com/token",
            data={
                "client_id": GMAIL_CLIENT_ID,
                "client_secret": GMAIL_CLIENT_SECRET,
                "refresh_token": GMAIL_REFRESH_TOKEN,
                "grant_type": "refresh_token",
            },
            timeout=10,
        )
        token_data = token_resp.json()
        access_token = token_data.get("access_token")
        if not access_token:
            print(f"[OTP-ERROR] Gmail API: could not get access token — {token_data}")
            return False

        # 2. Build the MIME email
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"Signetra – Your Verification Code: {otp_code}"
        msg["From"]    = f"Signetra <{GMAIL_EMAIL}>"
        msg["To"]      = to_email
        msg.attach(MIMEText(html_body, "html"))

        raw_message = base64.urlsafe_b64encode(msg.as_bytes()).decode()

        # 3. Send via Gmail API
        send_resp = requests.post(
            "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json",
            },
            json={"raw": raw_message},
            timeout=10,
        )

        if send_resp.status_code == 200:
            print(f"[OTP] ✅ Email sent via Gmail API to {to_email}")
            return True
        else:
            print(f"[OTP-ERROR] Gmail API send failed ({send_resp.status_code}): {send_resp.text}")
            return False

    except Exception as e:
        print(f"[OTP-ERROR] Gmail API exception: {e}")
        return False


# ---------------------------------------------------------------------------
# Main Email Dispatch
# ---------------------------------------------------------------------------

def send_email_otp(to_email: str, otp_code: str) -> bool:
    """Send OTP email. Always logs to console for Railway log visibility."""

    # Always log OTP — visible in Railway Deploy Logs
    print(f"[OTP-LOG] Code for {to_email}: {otp_code}")

    html_body = _build_email_html(otp_code)

    # --- Strategy 1: Gmail REST API (OAuth2, uses HTTPS — no SMTP port issues) ---
    if GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET and GMAIL_REFRESH_TOKEN:
        if _send_via_gmail_api(to_email, html_body, otp_code):
            return True
        print("[OTP-WARN] Gmail API failed — trying SMTP fallback")

    # --- Strategy 2: Gmail SMTP (App Password fallback) ---
    if GMAIL_EMAIL and GMAIL_APP_PASSWORD:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = f"Signetra – Your Verification Code: {otp_code}"
            msg["From"]    = f"Signetra <{GMAIL_EMAIL}>"
            msg["To"]      = to_email
            msg.attach(MIMEText(html_body, "html"))

            with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=15) as server:
                server.login(GMAIL_EMAIL, GMAIL_APP_PASSWORD)
                server.sendmail(GMAIL_EMAIL, to_email, msg.as_string())

            print(f"[OTP] ✅ Email sent via Gmail SMTP to {to_email}")
            return True
        except Exception as e:
            print(f"[OTP-ERROR] Gmail SMTP failed: {e}")

    print(f"[OTP-DEV] No email provider worked. OTP={otp_code} is logged above.")
    return False


# ---------------------------------------------------------------------------
# SMS Dispatch (Twilio or Dev-Mode)
# ---------------------------------------------------------------------------

TWILIO_ACCOUNT_SID  = os.getenv("TWILIO_ACCOUNT_SID", "").strip()
TWILIO_AUTH_TOKEN   = os.getenv("TWILIO_AUTH_TOKEN", "").strip()
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER", "").strip()


def send_sms_otp(to_phone: str, otp_code: str) -> bool:
    """Send the OTP via SMS. In dev mode, logs to console instead."""
    if OTP_DEV_MODE or not TWILIO_ACCOUNT_SID:
        print(f"[OTP-DEV] SMS OTP for {to_phone}: {otp_code}  (dev mode / Twilio not configured)")
        return True

    try:
        from twilio.rest import Client
        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        message = client.messages.create(
            body=f"Your Signetra verification code is: {otp_code}. It expires in {OTP_EXPIRY_MINUTES} minutes.",
            from_=TWILIO_PHONE_NUMBER,
            to=to_phone,
        )
        print(f"[OTP] SMS sent to {to_phone} (SID: {message.sid})")
        return True
    except Exception as e:
        print(f"[OTP-ERROR] Failed to send SMS to {to_phone}: {e}")
        return False
