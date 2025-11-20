# Bookstore Backend Requirements

## Core User Stories

- As a visitor, I can browse the public catalog to discover books by category, author, or keyword.
- As a customer, I can register, log in, and manage my profile.
- As a customer, I can build and manage a shopping cart, place orders, and review order history.
- As an admin, I can manage inventory (CRUD books, authors, categories, stock levels, pricing, promotions).
- As an admin, I can process orders (update status, fulfillment, refunds) and review analytics dashboards.

## High-Level Features

- Authentication & Authorization (JWT-based sessions, role-based access for admin/customer).
- Catalog & Search (filters, pagination, featured books, recommendations roadmap).
- Cart & Checkout (cart persistence, shipping options, payment gateway integration placeholder).
- Order Management (statuses, fulfillment timeline, customer notifications).
- Content & Reviews roadmap (book ratings, user-generated reviews, moderation).
- Reporting & Analytics (sales summaries, top sellers, inventory alerts).

## Data Model (Initial Entities)

- `User`: id, name, email, password_hash, role, status, created_at, updated_at.
- `Book`: id, title, slug, description, isbn, price, discount_price, stock, cover_url, published_at, metadata.
- `Author`: id, name, bio, social_links.
- `Category`: id, name, slug, description.
- `BookCategory`: book_id, category_id.
- `Order`: id, user_id, total_amount, status, payment_status, shipping_address_id, placed_at.
- `OrderItem`: id, order_id, book_id, quantity, price_snapshot.
- `Cart`: id, user_id, last_activity_at.
- `CartItem`: id, cart_id, book_id, quantity.
- `Address`: id, user_id, full_name, phone, line1, line2, city, state, postal_code, country, is_default.

## Key Workflows

- **Authentication**: register → email verification (optional) → login → refresh tokens → logout.
- **Catalog Browsing**: query filters → caching layer roadmap → read-only endpoints.
- **Cart Flow**: add/update/delete items → persist per user → checkout validation (stock, pricing) → create order.
- **Order Fulfillment**: customer checkout → order status transitions (pending → paid → processing → shipped → completed/cancelled).
- **Inventory Management**: admin CRUD books/categories → handle stock adjustments on order events.

## Non-Functional Requirements

- RESTful APIs with consistent error handling and validation.
- Secure secrets management via `.env` files and config module.
- Unit + integration tests baseline; contract tests for core flows.
- Observability: request logging, centralized error handling, health check endpoint.
- Deployment readiness: Dockerfile roadmap, CI/CD integration, staging vs production environment configuration.
