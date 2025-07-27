from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get_all_products():
    r = client.get("/products/")
    assert r.status_code == 200

def test_get_product_by_id():
    r = client.get("/products/1")
    assert r.status_code in (200, 404)