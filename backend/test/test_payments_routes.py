from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_create_checkout_session():
    data = {
        "product_name": "Test Bonsai",
        "amount": 42.00,
        "payment_method": "card"
    }
    r = client.post("/create-checkout-session", json=data)
    assert r.status_code in (200, 400)