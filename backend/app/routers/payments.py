import logging
import stripe
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from app.core.config import settings

# Configure module-level logger
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# Initialize FastAPI router for payment-related endpoints
router = APIRouter()

# Set Stripe API key from application configuration
stripe.api_key = settings.stripe_key


@router.post("/create-checkout-session")
async def create_checkout_session(request: Request):
    """
    Endpoint to create a Stripe Checkout Session for payment processing.

    Expects a JSON payload with the following fields:
    - product_name (str): Name of the product being purchased.
    - amount (str or float): Product price in BRL (Brazilian Real).

    Returns:
        JSONResponse: Contains the Stripe session ID and checkout URL if successful,
                      or an error message if the session creation fails.
    """
    try:
        data = await request.json()
        logger.info("Received checkout request for product: %s", data.get("product_name"))

        session = stripe.checkout.Session.create(
            payment_method_types=["card", "boleto"],
            line_items=[{
                "price_data": {
                    "currency": "brl",
                    "product_data": {"name": data["product_name"]},
                    "unit_amount": int(float(data["amount"]) * 100),  # Stripe expects amount in cents
                },
                "quantity": 1,
            }],
            mode="payment",
            success_url="http://localhost:5173/sucess",
            cancel_url="http://localhost:5173/",
            locale="pt-BR"
        )

        logger.info("Stripe session created successfully: %s", session.id)
        return JSONResponse({"id": session.id, "url": session.url})

    except Exception as e:
        logger.error("Failed to create Stripe session: %s", str(e))
        return JSONResponse({"error": "Failed to create checkout session."}, status_code=400)
