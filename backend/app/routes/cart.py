"""
JACRAL – Cart routes.

GET    /api/v1/cart              CUSTOMER
POST   /api/v1/cart/items        CUSTOMER
PATCH  /api/v1/cart/items/{id}   CUSTOMER
DELETE /api/v1/cart/items/{id}   CUSTOMER
DELETE /api/v1/cart              CUSTOMER
"""
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.cart import Cart, CartItem
from app.models.product import Product
from app.models.user import User
from app.schemas.cart import AddToCartRequest, CartItemOut, CartOut, UpdateCartItemRequest
from app.security.permissions import require_customer

router = APIRouter(tags=["Cart"])


def _get_or_create_cart(user: User, db: Session) -> Cart:
    cart = db.query(Cart).filter(Cart.user_id == user.id).first()
    if not cart:
        cart = Cart(user_id=user.id)
        db.add(cart)
        db.flush()
    return cart


def _build_cart_response(cart: Cart) -> dict:
    items = []
    total = Decimal("0.00")
    for item in cart.items:
        subtotal = item.unit_price * item.quantity
        total += subtotal
        items.append(
            CartItemOut(
                id=item.id,
                product_id=item.product_id,
                quantity=item.quantity,
                unit_price=item.unit_price,
                subtotal=subtotal,
            )
        )
    return CartOut(
        id=cart.id,
        user_id=cart.user_id,
        items=items,
        total=total,
        updated_at=cart.updated_at,
    )


@router.get(
    "/",
    response_model=CartOut,
    summary="Get current user's cart with computed totals",
)
def get_cart(
    current_user: User = Depends(require_customer),
    db: Session = Depends(get_db),
):
    cart = _get_or_create_cart(current_user, db)
    db.commit()
    db.refresh(cart)
    return _build_cart_response(cart)


@router.post(
    "/items",
    response_model=CartOut,
    status_code=status.HTTP_201_CREATED,
    summary="Add a product to cart",
)
def add_to_cart(
    data: AddToCartRequest,
    current_user: User = Depends(require_customer),
    db: Session = Depends(get_db),
):
    product = db.query(Product).filter(
        Product.id == data.product_id, Product.is_active.is_(True)
    ).first()

    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")

    if product.stock < data.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Only {product.stock} units available.",
        )

    cart = _get_or_create_cart(current_user, db)

    existing = db.query(CartItem).filter(
        CartItem.cart_id == cart.id,
        CartItem.product_id == data.product_id,
    ).first()

    if existing:
        new_qty = existing.quantity + data.quantity
        if product.stock < new_qty:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Only {product.stock} units available.",
            )
        existing.quantity = new_qty
        existing.unit_price = product.price
    else:
        item = CartItem(
            cart_id=cart.id,
            product_id=product.id,
            quantity=data.quantity,
            unit_price=product.price,
        )
        db.add(item)

    db.commit()
    db.refresh(cart)
    return _build_cart_response(cart)


@router.patch(
    "/items/{item_id}",
    response_model=CartOut,
    summary="Update cart item quantity",
)
def update_cart_item(
    item_id: int,
    data: UpdateCartItemRequest,
    current_user: User = Depends(require_customer),
    db: Session = Depends(get_db),
):
    item = (
        db.query(CartItem)
        .join(Cart, CartItem.cart_id == Cart.id)
        .filter(CartItem.id == item_id, Cart.user_id == current_user.id)
        .first()
    )

    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart item not found.")

    product = db.query(Product).filter(Product.id == item.product_id).first()
    if not product or product.stock < data.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Only {product.stock if product else 0} units available.",
        )

    item.quantity = data.quantity
    item.unit_price = product.price  # Always refresh from DB

    db.commit()

    cart = db.query(Cart).filter(Cart.id == item.cart_id).first()
    db.refresh(cart)
    return _build_cart_response(cart)


@router.delete(
    "/items/{item_id}",
    response_model=CartOut,
    summary="Remove an item from cart",
)
def remove_cart_item(
    item_id: int,
    current_user: User = Depends(require_customer),
    db: Session = Depends(get_db),
):
    item = (
        db.query(CartItem)
        .join(Cart, CartItem.cart_id == Cart.id)
        .filter(CartItem.id == item_id, Cart.user_id == current_user.id)
        .first()
    )

    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart item not found.")

    cart_id = item.cart_id
    db.delete(item)
    db.commit()

    cart = db.query(Cart).filter(Cart.id == cart_id).first()
    db.refresh(cart)
    return _build_cart_response(cart)


@router.delete(
    "/",
    summary="Clear all items from cart",
)
def clear_cart(
    current_user: User = Depends(require_customer),
    db: Session = Depends(get_db),
):
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if cart:
        db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
        db.commit()
    return {"success": True, "message": "Cart cleared."}
