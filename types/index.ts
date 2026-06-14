export type UserRole = "admin" | "agent" | "client" | "guest";

export interface Category {
  id: string;
  name: string;
  image_url: string;
  item_count: number;
  created_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt: string;
  is_primary: boolean;
  sort_order: number;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  type: "size" | "color";
  options: string[];
  price_modifier: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  stock: number;
  image_url: string;
  category_id: string;
  is_active: boolean;
  slug: string;
  rating: number;
  review_count: number;
  badge: string | null;
  features: string[] | null;
  specifications: Record<string, string> | null;
  created_at: string;
  updated_at: string;
  category?: Category;
  images?: ProductImage[];
  variants?: ProductVariant[];
}

export interface CartItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
  stock: number;
}

export interface Order {
  id: string;
  user_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  payment_status: "unpaid" | "paid" | "failed" | "refunded";
  payment_provider: string | null;
  payment_reference: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
}

export interface Log {
  id: string;
  action: string;
  details: string;
  user_id: string | null;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url: string;
  is_active: boolean;
  created_at: string;
}

export interface AppSetting {
  key: string;
  value: string;
  updated_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_name: string;
  user_avatar: string;
  rating: number;
  title: string;
  content: string;
  created_at: string;
  verified: boolean;
  helpful: number;
}

export interface CampaignDailyStat {
  id: string;
  campaign_id: string;
  date: string;
  revenue: number;
  orders: number;
  clicks: number;
}

export interface Campaign {
  id: string;
  name: string;
  discount_percent: number;
  code: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  usage_count: number;
  max_usage: number;
  revenue: number;
  orders: number;
  average_order_value: number;
  conversion_rate: number;
  clicks: number;
  roi: number;
  channel: "email" | "social" | "paid" | "affiliate" | "organic";
  target_audience: string;
  description: string;
  min_order_value: number;
  created_at: string;
  daily_stats?: CampaignDailyStat[];
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  avatar: string;
  total_orders: number;
  total_spent: number;
  joined_at: string;
  last_order_at: string | null;
  status: "active" | "inactive" | "vip";
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  text: string;
  created_at: string;
}

export interface AnalyticsData {
  date: string;
  revenue: number;
  orders: number;
  visitors: number;
  conversion_rate: number;
}

export interface CustomField {
  id: string;
  label: string;
  type: "text" | "number" | "select" | "color" | "textarea";
  required: boolean;
  options?: string[];
}
