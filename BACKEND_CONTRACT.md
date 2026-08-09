# Saree Grace Backend — API Contract (source of truth for RTK Query slices)

Derived directly from reading `../saree_grace_backend` route files, controllers, and Mongoose
models (not from assumption). Confirmed backend: `/Users/gokulvishwandan/Documents/Gokul/saree_grace_backend`
(package name `saree-grace-backend`). A separate, unrelated `ecommerce-backend` also exists as
a sibling directory (`../backend`) — **not** used for this project, ignore it.

Base path: `/api/v1` (from `PORT=4000`, `API_BASE_PATH=/api/v1` in backend `.env.example`).
Local dev base URL: `http://localhost:4000/api/v1`.

## Global conventions

- **Success envelope:** `{ success: true, data: T, meta?: {...} }`
- **Error envelope:** `{ success: false, error: { message: string, code?: string, details?: unknown } }`
  - Zod validation failure → 400, `details` = raw Zod `issues` array
  - Mongoose `ValidationError` → 400; `CastError` → 400
  - Duplicate key (11000) → 409, `details` = `keyValue`
  - Unmatched route → 404 `"Route not found: <METHOD> <path>"`
  - Unhandled exception → 500 `"Internal server error"` (no stack leaked)
  - **422 is never returned by any route** — don't build handling that expects it.
- **Auth delivery: JSON body only, no cookies.** No `res.cookie` anywhere in the backend.
  `register`/`login`/`google`/`refresh` return `{ user, accessToken, refreshToken }` in the
  JSON body. Every authenticated request must send `Authorization: Bearer <accessToken>`.
  Access token TTL 15m (default), refresh token TTL 30d, refresh tokens rotate + hashed at
  rest server-side with reuse detection (reuse revokes the whole chain).
- **Pagination:** cursor-based everywhere. Query: `cursor` (opaque, base64url), `limit`
  (default 20, max 50). Response: list + `meta.nextCursor` (string | null). No page numbers.
- **CORS:** whitelist via `CORS_ORIGINS` env; add the frontend's dev/prod origins there.
- **Rate limits:** global 300/15min, auth 10/15min, payments 30/15min → 429 on excess.
- **Uploads:** `multipart/form-data`, field name `images` (max 8 products/variants, max 5 reviews).

## Auth — `/auth`

| Method & path                | Auth   | Body                                    | `data`                                    |
| ---------------------------- | ------ | --------------------------------------- | ----------------------------------------- |
| POST `/auth/register`        | public | `{name(2-100), email, password(8-128)}` | `{user, accessToken, refreshToken}` (201) |
| POST `/auth/login`           | public | `{email, password}`                     | `{user, accessToken, refreshToken}`       |
| POST `/auth/google`          | public | `{idToken}`                             | `{user, accessToken, refreshToken}`       |
| POST `/auth/refresh`         | public | `{refreshToken}`                        | `{accessToken, refreshToken}` (rotated)   |
| POST `/auth/logout`          | public | `{refreshToken}`                        | `{message}` (idempotent)                  |
| POST `/auth/forgot-password` | public | `{email}`                               | `{message}` (always 200, no enumeration)  |
| POST `/auth/reset-password`  | public | `{token, newPassword(8-128)}`           | `{message}` (revokes all refresh tokens)  |
| GET `/auth/me`               | user   | —                                       | `{user}`                                  |

`User`: `{_id, name, email, googleId, role: 'customer'|'admin', addresses: Address[], isActive, createdAt, updatedAt}`.
`Address`: `{_id, label?, fullName, phone, line1, line2?, city, state, postalCode, country='India', isDefault}`.

**No `PUT /auth/me` and no address-CRUD endpoints exist**, despite `addresses` on the User
model — see "Missing endpoints" below.

## Products — `/products`, admin `/admin/products`

- `GET /products?cursor&limit&category&fabric&color&minPrice&maxPrice&handloomOnly&inStockOnly&sort(newest|price_asc|price_desc|top_rated)` → `{products}` + `meta.nextCursor`.
  **`category` must be the category's ObjectId (`_id`), not its slug** — confirmed from
  `product.validation.ts` (`category: objectId.optional()`) and `product.service.ts` (assigns
  the raw query value straight into a Mongo filter against the `category` ref field, which
  would silently match nothing for a slug string).
- `GET /products/search?q=<required>&cursor&limit` → same shape (Mongo `$text` search)
- `GET /products/:slug` → `{product}` (404 if inactive/missing)
- `GET /products/:id/reviews?cursor&limit` → `{reviews}` (approved only)

`Product`: `{_id, name, slug, description, type:'simple'|'variant', category, fabric?, color?, isHandloom, images:[{url,publicId,isPrimary}], ratingAvg, reviewCount, isActive, startingPrice}`

- simple: `+ price, compareAtPrice?, stock, sku?`
- variant: `+ variantAttributeNames: string[], variants: [{_id, sku, attributes: Record<string,string>, price, compareAtPrice?, stock, images, isActive}]`

Admin (all require admin):

- `POST /admin/products` — simple: full create incl. images in one call. variant: creates an
  empty **shell only** (`variants: []`, no images) — variants are added in a **second step**.
- `POST /admin/products/:id/variants` (multipart) — adds one variant + its images.
- `PUT /admin/products/:id` (multipart) — partial update; simple-only fields ignored for variant type; `removeImagePublicIds` for image cleanup.
- `PATCH /admin/products/:id/variants/:variantId` (multipart) — partial variant update.
- `DELETE /admin/products/:id`, `DELETE /admin/products/:id/variants/:variantId`.

## Categories — `/categories`

- `GET /categories?tree=false` → `{categories}` flat, active only, sorted by name
- `GET /categories?tree=true` → `{categories: [{category, children: [...]}]}`
- `POST /categories` (admin) `{name(2-100), description?, parentCategory?}`
- `PUT /categories/:id` (admin) `{name?, description?, parentCategory?, isActive?}`
- `DELETE /categories/:id` (admin) — 409 if it has products/subcategories (never cascades)

**No single-category-by-id/slug endpoint** — only the list.

## Cart — `/cart` (auth required on every route — no guest cart on the backend)

- `GET /cart` → `{cart}` (auto-creates empty)
- `POST /cart` `{productId, variantId?, qty(>0, default 1)}` → `{cart}` (201; 409 if qty > stock)
- `PATCH /cart/:itemId` `{qty(>0)}` → `{cart}`
- `DELETE /cart/:itemId` → `{cart}`
- `POST /cart/merge` `{items: [{productId, variantId?, qty}] (max 100)}` → `{cart}` — for folding a client-side guest cart into the server cart on login

`Cart`: `{_id, user, items: [{_id, product, variantId, qty, priceSnapshot, nameSnapshot, imageSnapshot}]}`.
Price is a **snapshot**, not recomputed live except when the line is touched again.

**Guests must be handled entirely client-side (redux-persist) and merged via `/cart/merge` on login** — this is a real design decision the frontend must implement, not an oversight to work around.

## Wishlist — `/wishlist` (auth required)

- `GET /wishlist` → `{wishlist}` (populated with product summary fields)
- `POST /wishlist/:productId` → `{wishlist}` (201, idempotent)
- `DELETE /wishlist/:productId` → `{wishlist}` (idempotent)

No guest wishlist support at all on the backend — wishlist requires login (reflect this in UI: prompt login instead of local-only wishlist, to avoid a false "saved" state that vanishes).

## Orders — `/orders` (auth required), admin `/admin/orders`

- `POST /orders` `{shippingAddress: AddressInput}` → `{order}` (201) — builds from current cart, decrements stock in a transaction, 409 `"Insufficient stock for \"<name>\""`, clears cart, status `pending`. `shippingFee` = ₹99 flat, free if `itemsTotal >= 999`.
- `GET /orders/my?cursor&limit&status` → `{orders}`
- `GET /orders/:id` → `{order}` (403 if not owner)
- `GET /orders/:id/tracking` → `{status, tracking, statusHistory}`
- `POST /orders/:id/cancel` → `{order}` (only from pending/paid/processing; restores stock)

Admin: `GET /admin/orders`, `GET /admin/orders/:id`, `PATCH /admin/orders/:id/status`
`{status, note?, carrier?, trackingId?, trackingUrl?}` — enforced state machine:
`pending→[paid,payment_failed,cancelled]`, `payment_failed→[pending,cancelled]`,
`paid→[processing,cancelled]`, `processing→[shipped,cancelled]`, `shipped→[delivered]`,
`delivered`/`cancelled` terminal. Invalid transition → 409.

Status enum: `pending | paid | processing | shipped | delivered | cancelled | payment_failed`.

## Payments — `/payments` (Razorpay)

- `POST /payments/create-order` `{orderId}` → `{razorpayOrderId, amount(paise), currency:"INR", keyId, internalOrderId}` (201; only from pending/payment_failed)
- `POST /payments/verify` `{razorpayOrderId, razorpayPaymentId, razorpaySignature}` → `{order}` (HMAC verify; 400 on signature mismatch; idempotent no-op if already paid) → order becomes `paid`
- `POST /payments/webhook` — server-to-server, no auth, signature-verified separately (backend-only concern, frontend doesn't call this)
- `POST /payments/:id/refund` (admin) `{amount?, reason?}` → `{order}`

Frontend flow: create internal order → `create-order` (Razorpay order) → open Razorpay Checkout with `keyId` → on success call `/payments/verify` → show confirmation. On failure, order stays `pending`/`payment_failed`, cart was already cleared at order-creation time (not on payment) — **retry must re-use the existing order, not create a new one from cart** (cart is already empty by then).

## Reviews — `/reviews`, admin `/admin/reviews`

- `POST /reviews` (auth, multipart `images` max 5) `{productId, orderId, rating(1-5), comment(1-2000)}` → `{review}` (201)
  - **Eligibility, enforced server-side:** order must belong to user, order status must be
    `delivered`, productId must be a line item of that order, one review per (user, product,
    order). Frontend "write a review" button should only be shown for delivered orders'
    line items that don't already have a review — but the backend enforces this regardless.
  - New reviews are `approved: false` until admin-approved; don't affect product rating yet.
- Admin: `GET /admin/reviews?approved=`, `PATCH /admin/reviews/:id/approve`, `DELETE /admin/reviews/:id`

## Admin dashboard — `GET /admin/dashboard`

```
{
  orderCountsByStatus: Record<OrderStatus, number>,
  revenue: { today, week, month },
  lowStockProducts: [{ id, name, sku?, stock }],   // stock <= 5, max 20
  recentOrders: [{ id, orderNumber, total, status, createdAt }]  // last 10
}
```

## Missing endpoints (checklist items with no backend support — flagged per rule 4)

- **No address-book CRUD** (`Section 11` wants add/edit/delete/set-default addresses). The
  `User.addresses` sub-schema exists but nothing in `/auth` or elsewhere exposes it. Orders take
  an inline `shippingAddress` object, not a reference to a saved address.
- **No `PUT /auth/me`** profile-update endpoint (name/phone edit from `Section 11`).
- **No guest cart/wishlist on the backend** — both require auth; guest support must be fully
  client-side + reconciled via `/cart/merge` on login (wishlist has no merge equivalent at all).
- **No category-by-id/slug detail endpoint** — only list.
- **No email verification, no "list active sessions", no admin user-management, no bulk product import.**
