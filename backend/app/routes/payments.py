"""
JACRAL – Payment routes.

POST /api/v1/payments/checkout              CUSTOMER
POST /api/v1/payments/webhook/razorpay      PUBLIC (webhook)
GET  /api/v1/payments/order/{order_id}      CUSTOMER
"""
import json
import logging

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.order import Order
from app.models.payment import Payment
from app.models.user import User
from app.schemas.payment import CheckoutRequest, CheckoutResponse, PaymentOut
from app.security.permissions import require_customer
from app.services import email_service, payment_service, shipping_service

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Payments"])


@router.post(
    "/checkout",
    response_model=CheckoutResponse,
    summary="Initiate payment for an order",
)
def checkout(
    data: CheckoutRequest,
    current_user: User = Depends(require_customer),
    db: Session = Depends(get_db),
):
    order = db.query(Order).filter(
        Order.id == data.order_id, Order.user_id == current_user.id
    ).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")

    if order.payment_status == "paid":
        raise HTTPException(status_code=400, detail="Order is already paid.")

    existing_payment = db.query(Payment).filter(Payment.order_id == order.id).first()

    if existing_payment and existing_payment.provider_order_id:
        return CheckoutResponse(
            payment_id=existing_payment.id,
            provider=existing_payment.provider,
            provider_order_id=existing_payment.provider_order_id,
            amount=existing_payment.amount,
            currency=existing_payment.currency,
            key_id=payment_service.settings.RAZORPAY_KEY_ID,
        )

    try:
        gw_order = payment_service.create_payment_order(order.total_amount, order.id)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))

    payment = Payment(
        order_id=order.id,
        provider=gw_order["provider"],
        provider_order_id=gw_order["provider_order_id"],
        amount=order.total_amount,
        currency=gw_order["currency"],
        status="created",
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)

    return CheckoutResponse(
        payment_id=payment.id,
        provider=payment.provider,
        provider_order_id=payment.provider_order_id,
        amount=payment.amount,
        currency=payment.currency,
        key_id=gw_order.get("key_id"),
    )


@router.post(
    "/webhook/razorpay",
    status_code=status.HTTP_200_OK,
    summary="Razorpay payment webhook (idempotent)",
)
async def razorpay_webhook(request: Request, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    body = await request.body()
    signature = request.headers.get("X-Razorpay-Signature", "")

    if not payment_service.verify_razorpay_webhook_signature(body, signature):
        logger.warning("Razorpay webhook signature verification failed")
        raise HTTPException(status_code=400, detail="Invalid webhook signature.")

    try:
        event = json.loads(body)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON body.")

    event_type = event.get("event")

    if event_type == "payment.captured":
        payload = event.get("payload", {}).get("payment", {}).get("entity", {})
        provider_payment_id = payload.get("id")
        provider_order_id = payload.get("order_id")

        if not provider_payment_id:
            return {"status": "ignored"}

        # Row-level lock to prevent concurrent webhook processing race conditions
        payment = db.query(Payment).filter(
            Payment.provider_order_id == provider_order_id
        ).with_for_update().first()

        if not payment:
            logger.error("No payment found for Razorpay order %s", provider_order_id)
            return {"status": "payment_not_found"}

        if payment.status == "paid":
            logger.info("Webhook already processed for payment %s", provider_payment_id)
            return {"status": "already_processed"}

        payment.provider_payment_id = provider_payment_id
        payment.status = "paid"
        payment.raw_response = json.dumps(payload)

        order = db.query(Order).filter(Order.id == payment.order_id).first()
        if order:
            order.payment_status = "paid"
            order.status = "confirmed"

            db.commit()

            email_service.send_order_confirmation(
                background_tasks=background_tasks,
                to=order.shipping_email,
                order_id=order.id,
                total=str(order.total_amount),
                customer_name=order.shipping_name,
            )
            background_tasks.add_task(shipping_service.create_shipment_background, order.id)

    return {"status": "ok"}


@router.get(
    "/order/{order_id}",
    response_model=PaymentOut,
    summary="Get payment info for an order",
)
def get_payment_for_order(
    order_id: int,
    current_user: User = Depends(require_customer),
    db: Session = Depends(get_db),
):
    order = db.query(Order).filter(
        Order.id == order_id, Order.user_id == current_user.id
    ).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")

    payment = db.query(Payment).filter(Payment.order_id == order_id).first()

    if not payment:
        raise HTTPException(status_code=404, detail="Payment not initiated for this order.")

    return payment
