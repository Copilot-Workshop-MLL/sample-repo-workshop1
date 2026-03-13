export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  sku: string;
  isActive: boolean;
  createdAt: string;
}

export interface OrderItem {
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customer: string;
  customerEmail: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  notes: string;
  createdAt: string;
}
