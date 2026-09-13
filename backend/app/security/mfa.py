import pyotp
import qrcode
import base64
import io

def generate_mfa_secret() -> str:
    """Generate a random base32 string for TOTP secret."""
    return pyotp.random_base32()

def get_totp_uri(secret: str, email: str, issuer_name: str = "JACRAL Admin") -> str:
    """Generate the URI for a TOTP authenticator app."""
    return pyotp.totp.TOTP(secret).provisioning_uri(name=email, issuer_name=issuer_name)

def generate_qr_code_base64(uri: str) -> str:
    """
    Generate a QR code PNG from a URI and return it as a base64 data URI.
    This is far more reliable than raw SVG for browser rendering.
    """
    img = qrcode.make(uri)
    stream = io.BytesIO()
    img.save(stream, format="PNG")
    encoded = base64.b64encode(stream.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{encoded}"

def verify_totp(secret: str, code: str) -> bool:
    """Verify a 6-digit TOTP code against the secret."""
    if not secret or not code:
        return False
    totp = pyotp.TOTP(secret)
    # Validate with a window of 1 (allows 30 seconds before and after)
    return totp.verify(code, valid_window=1)
