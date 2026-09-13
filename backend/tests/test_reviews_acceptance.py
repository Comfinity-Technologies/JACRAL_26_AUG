"""
Acceptance test for Reviews and Site Settings endpoints.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine, SessionLocal
from app.models.user import User
from app.models.review import CustomerReview
from app.security.jwt import create_access_token


@pytest.fixture(scope="module")
def client():
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="module")
def admin_token():
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.role == "ADMIN").first()
        token = create_access_token(admin.id, admin.role)
        return token
    finally:
        db.close()


def test_public_reviews_endpoint(client):
    res = client.get("/api/v1/reviews")
    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_site_settings_endpoint(client):
    res = client.get("/api/v1/content/site-settings")
    assert res.status_code == 200
    data = res.json()
    assert "contact_email" in data


def test_admin_reviews_crud(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    # 1. Create a review
    create_payload = {
        "customer_name": "Test Customer",
        "customer_location": "Bengaluru",
        "review_text": "Remarkable taste and sustained morning energy!",
        "rating": 5,
        "display_order": 10,
        "is_active": True,
        "is_published": False,
    }
    res = client.post("/api/v1/admin/reviews", json=create_payload, headers=headers)
    assert res.status_code == 201
    created = res.json()
    rev_id = created["id"]
    assert created["customer_name"] == "Test Customer"
    assert created["is_published"] is False

    # 2. Publish the review
    res = client.post(f"/api/v1/admin/reviews/{rev_id}/publish", headers=headers)
    assert res.status_code == 200
    assert res.json()["is_published"] is True

    # 3. Verify it shows in public reviews
    res = client.get("/api/v1/reviews")
    assert res.status_code == 200
    reviews = res.json()
    assert any(r["id"] == rev_id for r in reviews)

    # 4. Unpublish
    res = client.post(f"/api/v1/admin/reviews/{rev_id}/unpublish", headers=headers)
    assert res.status_code == 200
    assert res.json()["is_published"] is False

    # 5. Delete
    res = client.delete(f"/api/v1/admin/reviews/{rev_id}", headers=headers)
    assert res.status_code == 200
    assert res.json()["success"] is True
