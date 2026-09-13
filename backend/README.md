# JACRAL Ecommerce Backend

This is the complete, production-ready FastAPI backend for the JACRAL ecommerce platform, featuring comprehensive authentication, product management, order processing, voting capabilities, and analytics.

## Folder Structure

```
backend/
├── alembic/
│   ├── versions/            # Database migration scripts
│   └── env.py               # Alembic configuration
├── app/
│   ├── main.py              # Application entry point & route registration
│   ├── config.py            # Environment variable configuration
│   ├── database.py          # SQLAlchemy connection & session management
│   ├── models/              # SQLAlchemy database models
│   ├── schemas/             # Pydantic validation schemas
│   ├── routes/              # FastAPI route handlers (Public & Customer)
│   │   └── admin/           # Admin-only route handlers
│   ├── services/            # Business logic & external integrations
│   ├── security/            # JWT, password hashing, and RBAC permissions
│   └── utils/               # Pagination and calculation helpers
├── .env                     # Environment variables (do not commit)
├── .env.example             # Template for environment variables
├── alembic.ini              # Alembic command configuration
├── requirements.txt         # Python dependencies
└── README.md                # This file
```

## Database Tables (PostgreSQL)

The database schema is fully managed via Alembic and includes:
- `users`: Customers and admin staff with roles.
- `categories`: Product categories.
- `products`: Products with pricing, stock, and category references.
- `carts` & `cart_items`: Persistent shopping carts.
- `addresses`: Customer delivery addresses.
- `orders` & `order_items`: Order records with snapshot data.
- `payments`: Payment gateway (Razorpay) records with idempotency constraints.
- `coupons`: Discount codes with usage limits.
- `voting_questions`, `voting_options`, & `voting_responses`: Configurable MCQ voting system.
- `utm_visits`: Anonymous marketing source tracking.
- `audit_logs`: Detailed tracking of administrative actions.

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` (Public)
- `POST /api/v1/auth/login` (Public)
- `POST /api/v1/auth/refresh` (Public)
- `GET  /api/v1/auth/me` (Customer+)
- `POST /api/v1/auth/logout` (Customer+)

### Public Access
- `GET /health` & `GET /health/db`
- `GET /api/v1/categories` & `GET /api/v1/categories/{id}/products`
- `GET /api/v1/products` & `GET /api/v1/products/{id}` & `GET /api/v1/products/slug/{slug}`
- `GET /api/v1/voting/questions` & `GET /api/v1/voting/questions/{id}/results`
- `POST /api/v1/voting/questions/{id}/vote` (Supports anonymous if enabled)
- `POST /api/v1/coupons/validate`
- `POST /api/v1/analytics/visit`

### Customer Area
- `GET`, `POST`, `PATCH`, `DELETE` `/api/v1/cart` & `/api/v1/cart/items`
- `GET`, `POST`, `PATCH`, `DELETE` `/api/v1/addresses`
- `GET`, `POST` `/api/v1/orders` (View own orders, Create order)
- `POST /api/v1/payments/checkout`

### Admin Management
- **Users**: `/api/v1/admin/users` (Admin only)
- **Products**: `/api/v1/admin/products` (Manager+)
- **Categories**: `/api/v1/admin/categories` (Manager+)
- **Orders**: `/api/v1/admin/orders` (Staff+)
- **Coupons**: `/api/v1/admin/coupons` (Admin only)
- **Voting**: `/api/v1/admin/voting/questions` & `options` (Manager+)
- **Analytics**: `/api/v1/admin/analytics/dashboard` & `traffic` (Manager+)
- **Audit Logs**: `/api/v1/admin/analytics/audit-logs` (Admin only)

## Environment Variables Required

Create a `.env` file based on `.env.example`. At minimum, you need:
```
DATABASE_URL=postgresql+psycopg://user:pass@localhost:5432/jacral
FRONTEND_URL=http://localhost:5173
JWT_SECRET_KEY=your_secure_random_string
```

Optional configurations (the app handles them gracefully if missing):
- `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`
- `SMTP_HOST`, `SMTP_USERNAME`, `SMTP_PASSWORD`
- `SHIPROCKET_EMAIL`, `SHIPROCKET_PASSWORD`

## Setup & Run Commands

**1. Create virtual environment & install dependencies:**
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

**2. Run Database Migrations:**
```powershell
alembic upgrade head
```

**3. Run the Development Server:**
```powershell
uvicorn app.main:app --reload
```
The API documentation (Swagger) will be available at: http://127.0.0.1:8000/docs

**4. Run Tests:**
```powershell
pytest
```
*(Note: Complete test coverage requires a separate test database configured in the test environment.)*

## Untestable without Credentials
The following features are fully implemented but require valid third-party credentials to test successfully:
1. **Razorpay Payments**: Requires valid Razorpay API keys to generate authentic checkout tokens and verify webhook signatures.
2. **Shiprocket**: Requires valid Shiprocket credentials to retrieve authentication tokens and create shipments.
3. **Email Notifications**: Requires a valid SMTP provider (e.g., SendGrid, Gmail App Password) to dispatch emails.

## Connecting the Frontend
1. **Configuration**: Set `VITE_API_URL=http://127.0.0.1:8000` (or production URL) in the frontend `.env`.
2. **Authentication**: After successful `POST /api/v1/auth/login`, store the `access_token` securely (e.g., HTTP-only cookie or memory).
3. **Authorization Header**: Attach the token to all authenticated requests:
   `Authorization: Bearer <access_token>`
4. **Refreshing Sessions**: On page reload, call `GET /api/v1/auth/me` with the access token to restore the user session. If the token expires, use the refresh token with `POST /api/v1/auth/refresh`.
5. **Admin Access**: If `user.role` is `admin`, `manager`, or `staff`, display the admin dashboard link and route requests to the `/api/v1/admin/*` endpoints.
