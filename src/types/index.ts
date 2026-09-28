export interface Address {
  _id?: string;
  label?: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export type UserRole = "customer" | "admin";

export interface User {
  _id: string;
  name: string;
  email: string;
  googleId?: string | null;
  role: UserRole;
  addresses: Address[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  url: string;
  publicId: string;
  isPrimary?: boolean;
}

export type ProductType = "simple" | "variant";

export interface ProductVariant {
  _id: string;
  sku: string;
  attributes: Record<string, string>;
  price: number;
  compareAtPrice?: number;
  stock: number;
  images: ProductImage[];
  isActive: boolean;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  parentCategory: string | null;
  image?: { url: string; publicId: string };
  isActive: boolean;
}

export interface CategoryTreeNode {
  category: Category;
  children: CategoryTreeNode[];
}

export interface Occasion {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: { url: string; publicId: string };
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  seoTitle?: string;
  seoDescription?: string;
  type: ProductType;
  category: Category | string;
  occasions?: (Occasion | string)[];
  fabric?: string;
  color?: string;
  isHandloom: boolean;
  images: ProductImage[];
  ratingAvg: number;
  reviewCount: number;
  isActive: boolean;
  startingPrice: number;
  // Mongoose virtuals, same as `startingPrice` (see the comment on
  // `WishlistProductSummary` below) — always populated regardless of field
  // selection. For a simple product these mirror `price`/`stock` and
  // `variantCount` is 0; for a variant product they're computed across
  // active variants only.
  maxPrice: number;
  totalStock: number;
  variantCount: number;
  createdAt: string;
  updatedAt: string;
  // simple-only
  price?: number;
  compareAtPrice?: number;
  stock?: number;
  sku?: string;
  // variant-only
  variantAttributeNames?: string[];
  variants?: ProductVariant[];
}

export type ProductSort = "newest" | "price_asc" | "price_desc" | "top_rated";

// `GET /products/facets` — filter options that exist in the live catalogue for the current
// filters. `value` is what goes in the `color`/`fabric` query param (case-insensitive).
export interface FacetOption {
  value: string;
  label: string;
  count: number;
  hex?: string;
}

export interface ProductFacets {
  colors: FacetOption[];
  fabrics: FacetOption[];
}

export interface CartItem {
  _id: string;
  product: string | Product;
  variantId: string | null;
  qty: number;
  priceSnapshot: number;
  nameSnapshot: string;
  imageSnapshot?: string;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
}

// Exactly the fields `wishlist.service.ts` populates (`'name slug images price variants type
// isActive'`), plus `startingPrice` — confirmed live (not assumed) that it's still present even
// though it's not in that select string, because it's a Mongoose *virtual* computed from
// `variants`/`price` at serialization time, not restricted by field selection the way a stored
// field would be. Deliberately still missing `isHandloom`, `ratingAvg`, `description`, etc. —
// confirmed live those are genuinely absent, not just unlisted.
export interface WishlistProductSummary {
  _id: string;
  name: string;
  slug: string;
  images: ProductImage[];
  type: ProductType;
  isActive: boolean;
  price?: number;
  variants?: ProductVariant[];
  startingPrice: number;
}

export interface Wishlist {
  _id: string;
  user: string;
  productIds: WishlistProductSummary[] | string[];
}

export type OrderStatus =
  "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled" | "payment_failed";

export interface OrderStatusHistoryEntry {
  status: OrderStatus;
  note?: string;
  changedAt: string;
  changedBy?: string;
}

// Populated only on the admin order-detail endpoint (GET /admin/orders/:id) — `select('name
// category type')` with `category` nested-populated to `{_id, name}`. `null` when the source
// product has since been deleted. Every other order endpoint leaves `OrderItem.product` a
// plain id string, same as `CartItem.product`.
export interface OrderItemProductSummary {
  _id: string;
  name: string;
  type: "simple" | "variant";
  category: { _id: string; name: string } | null;
}

export interface OrderItem {
  product: string | OrderItemProductSummary | null;
  variantId?: string | null;
  nameSnapshot: string;
  imageSnapshot?: string;
  skuSnapshot?: string;
  priceSnapshot: number;
  qty: number;
}

export interface OrderPayment {
  provider: "razorpay" | "cod";
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  method?: string;
  amountPaid?: number;
  paidAt?: string;
  failureReason?: string;
  refund?: {
    razorpayRefundId: string;
    amount: number;
    reason?: string;
    refundedAt: string;
  };
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: string;
  items: OrderItem[];
  shippingAddress: Address;
  itemsTotal: number;
  shippingFee: number;
  total: number;
  status: OrderStatus;
  statusHistory: OrderStatusHistoryEntry[];
  payment: OrderPayment;
  tracking: { carrier?: string; trackingId?: string; trackingUrl?: string };
  stockRestored: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: string;
  user: { _id: string; name: string } | string;
  product: string;
  order: string;
  rating: number;
  comment: string;
  images: ProductImage[];
  approved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminDashboardStats {
  orderCountsByStatus: Record<OrderStatus, number>;
  revenue: { today: number; week: number; month: number };
  lowStockProducts: Array<{ id: string; name: string; sku?: string; stock: number }>;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    total: number;
    status: OrderStatus;
    createdAt: string;
  }>;
}

export interface CursorMeta {
  nextCursor: string | null;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: CursorMeta & Record<string, unknown>;
}

export interface ApiErrorBody {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
}
