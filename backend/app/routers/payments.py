import stripe
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from app.core.config import settings

router = APIRouter()
stripe.api_key = settings.stripe_key

@router.post("/create-checkout-session")
async def create_checkout_session(request: Request):
    data = await request.json()
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card", "boleto"],
            line_items=[{
                "price_data": {
                    "currency": "brl",
                    "product_data": {"name": data["product_name"]},
                    "unit_amount": int(float(data["amount"]) * 100),
                },
                "quantity": 1,
            }],
            mode="payment",
            success_url="https://yourdomain.com/success?session_id={CHECKOUT_SESSION_ID}", # Need to change
            cancel_url="localhost:5173/",
            locale="pt-BR"
        )
        return JSONResponse({"id": session.id, "url": session.url})
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=400)
