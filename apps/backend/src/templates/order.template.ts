export interface CanonicalOrder {
  external_order_id: string;
  channel: string;

  customer_email: string;
  customer_name: string;
  customer_address: string;
  customer_city: string;
  customer_state: string;

  status: string;
  total_amount: number;
  promo_code?: string | null;
  payment_mode: string;
  balance_payment: number;

  items: {
    product_id: string;
    product_name: string;
    price: number;
    quantity: number;
  }[];
}
