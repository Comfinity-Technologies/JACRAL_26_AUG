"""
Automated Verification for Acceptance Tests 1-5:
TEST 1: Admin uploads Logo A -> Publish -> Customer website shows Logo A
TEST 2: Admin replaces Logo A with Logo B -> Publish -> Customer website shows Logo B
TEST 3: Admin uploads Slide 1 Image A -> Publish -> Customer website shows Image A
TEST 4: Admin replaces Image A with Image B -> Publish -> Customer website shows Image B
TEST 5: Admin changes Slide title -> Publish -> Customer website displays new title
"""
import io
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models.user import User
from app.security.jwt import create_access_token


def get_admin_headers():
    db = SessionLocal()
    admin = db.query(User).filter(User.role == "ADMIN").first()
    token = create_access_token(admin.id, admin.role)
    db.close()
    return {"Authorization": f"Bearer {token}"}


def test_acceptance_flow_tests_1_to_5():
    client = TestClient(app)
    headers = get_admin_headers()

    # ─────────────────────────────────────────────────────────────
    # TEST 1: Admin uploads JACRAL Logo A -> Publish -> Public shows Logo A
    # ─────────────────────────────────────────────────────────────
    logo_a_content = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"
    upload_res1 = client.post(
        "/api/v1/admin/content/brand/logo",
        headers=headers,
        files={"file": ("logo_a.png", io.BytesIO(logo_a_content), "image/png")},
    )
    assert upload_res1.status_code == 200, f"Upload Logo A failed: {upload_res1.text}"
    draft_logo_a = upload_res1.json()["draft_logo_url"]
    assert "logo_a" in draft_logo_a

    # BEFORE publish: Public API still shows previous/none
    brand_before_pub = client.get("/api/v1/content/brand").json()
    assert brand_before_pub["logo_url"] != draft_logo_a, "Draft should not leak to public before publish!"

    # Admin clicks PUBLISH
    pub_res1 = client.post("/api/v1/admin/content/landing-page/publish", headers=headers)
    assert pub_res1.status_code == 200

    # AFTER publish: Public API shows Logo A
    brand_after_pub = client.get("/api/v1/content/brand").json()
    assert brand_after_pub["logo_url"] == draft_logo_a
    print("\n[PASS] TEST 1: Admin uploads Logo A -> Publish -> Public shows Logo A")

    # ─────────────────────────────────────────────────────────────
    # TEST 2: Admin replaces Logo A with Logo B -> Publish -> Public shows Logo B
    # ─────────────────────────────────────────────────────────────
    logo_b_content = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x02\x00\x00\x00\x02\x08\x06\x00\x00\x00v~{\x9a\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"
    upload_res2 = client.post(
        "/api/v1/admin/content/brand/logo",
        headers=headers,
        files={"file": ("logo_b.png", io.BytesIO(logo_b_content), "image/png")},
    )
    assert upload_res2.status_code == 200
    draft_logo_b = upload_res2.json()["draft_logo_url"]
    assert "logo_b" in draft_logo_b

    # Public still shows Logo A until publish
    assert client.get("/api/v1/content/brand").json()["logo_url"] == draft_logo_a

    # Publish
    client.post("/api/v1/admin/content/landing-page/publish", headers=headers)

    # Public now shows Logo B
    assert client.get("/api/v1/content/brand").json()["logo_url"] == draft_logo_b
    print("[PASS] TEST 2: Admin replaces Logo A with Logo B -> Publish -> Public shows Logo B")

    # ─────────────────────────────────────────────────────────────
    # TEST 3: Admin uploads Slide 1 Image A -> Publish -> Customer shows Image A
    # ─────────────────────────────────────────────────────────────
    slide_a_content = b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00`\x00`\x00\x00\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c\x1c $.' \",#\x1c\x1c(7),01444\x1f'9=82<.342\xff\xc0\x00\x0b\x08\x00\x01\x00\x01\x01\x01\x11\x00\xff\xc4\x00\x1f\x00\x00\x01\x05\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0b\xff\xda\x00\x08\x01\x01\x00\x00?\x00\xbf\x00\xff\xd9"
    slide_upload_res1 = client.post(
        "/api/v1/admin/content/landing-page/slides/1/image",
        headers=headers,
        data={"target": "desktop"},
        files={"file": ("slide_a.jpg", io.BytesIO(slide_a_content), "image/jpeg")},
    )
    assert slide_upload_res1.status_code == 200
    img_a_url = slide_upload_res1.json()["image_url"]
    assert "slide_a" in img_a_url

    # Publish
    client.post("/api/v1/admin/content/landing-page/publish", headers=headers)

    # Customer landing page shows Image A on slide 1
    landing_data1 = client.get("/api/v1/content/landing-page").json()
    slide1 = next(s for s in landing_data1["hero_slides"] if s["id"] == 1)
    assert slide1["image_url"] == img_a_url
    print("[PASS] TEST 3: Admin uploads Slide 1 Image A -> Publish -> Public shows Image A")

    # ─────────────────────────────────────────────────────────────
    # TEST 4: Admin replaces Image A with Image B -> Publish -> Customer shows Image B
    # ─────────────────────────────────────────────────────────────
    slide_b_content = b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00`\x00`\x00\x00\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c\x1c $.' \",#\x1c\x1c(7),01444\x1f'9=82<.342\xff\xc0\x00\x0b\x08\x00\x01\x00\x01\x01\x01\x11\x00\xff\xc4\x00\x1f\x00\x00\x01\x05\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0b\xff\xda\x00\x08\x01\x01\x00\x00?\x00\xbf\x00\xff\xd9"
    slide_upload_res2 = client.post(
        "/api/v1/admin/content/landing-page/slides/1/image",
        headers=headers,
        data={"target": "desktop"},
        files={"file": ("slide_b.jpg", io.BytesIO(slide_b_content), "image/jpeg")},
    )
    assert slide_upload_res2.status_code == 200
    img_b_url = slide_upload_res2.json()["image_url"]
    assert "slide_b" in img_b_url

    # Before publish: still Image A
    landing_mid = client.get("/api/v1/content/landing-page").json()
    slide1_mid = next(s for s in landing_mid["hero_slides"] if s["id"] == 1)
    assert slide1_mid["image_url"] == img_a_url

    # Publish
    client.post("/api/v1/admin/content/landing-page/publish", headers=headers)

    # After publish: Image B
    landing_data2 = client.get("/api/v1/content/landing-page").json()
    slide1_after = next(s for s in landing_data2["hero_slides"] if s["id"] == 1)
    assert slide1_after["image_url"] == img_b_url
    print("[PASS] TEST 4: Admin replaces Image A with Image B -> Publish -> Public shows Image B")

    # ─────────────────────────────────────────────────────────────
    # TEST 5: Admin changes Slide title -> Publish -> Customer website displays new title
    # ─────────────────────────────────────────────────────────────
    import uuid
    new_title = f"NEW SUPER-CEREAL TITLE {uuid.uuid4().hex[:6].upper()}"
    update_slide_res = client.put(
        "/api/v1/admin/content/landing-page/slides/1",
        headers=headers,
        json={"draft_title": new_title},
    )
    assert update_slide_res.status_code == 200

    # Before publish: old title
    landing_before = client.get("/api/v1/content/landing-page").json()
    slide1_before = next(s for s in landing_before["hero_slides"] if s["id"] == 1)
    assert slide1_before["title"] != new_title

    # Publish
    client.post("/api/v1/admin/content/landing-page/publish", headers=headers)

    # After publish: new title
    landing_after = client.get("/api/v1/content/landing-page").json()
    slide1_final = next(s for s in landing_after["hero_slides"] if s["id"] == 1)
    assert slide1_final["title"] == new_title
    print("[PASS] TEST 5: Admin changes Slide title -> Publish -> Customer website displays new title")


if __name__ == "__main__":
    test_acceptance_flow_tests_1_to_5()
