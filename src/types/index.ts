export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  gstRate: number; // 5 or 18
  hsnCode: string;
  isVeg: boolean;
  available: boolean;
  ingredients?: string[];
}

export interface CartItem extends MenuItem {
  quantity: number;
  notes?: string;
}

export interface Table {
  id: string;
  number: number;
  capacity: number;
  status: "available" | "occupied" | "reserved" | "dirty";
  section: string;
  currentOrderId?: string;
}

export interface Order {
  id: string;
  tableId?: string;
  items: CartItem[];
  status: "active" | "completed" | "cancelled" | "held";
  type: "dine-in" | "takeaway" | "delivery";
  guestCount?: number;
  waiterName?: string;
  notes?: string;
  deliveryPhone?: string;
  deliveryAddress?: string;
  subtotal: number;
  cgst: number;
  sgst: number;
  discount: number;
  serviceCharge: number;
  total: number;
  paymentMode?: "cash" | "card" | "upi" | "split";
  customerId?: string;
  createdAt: string;
  completedAt?: string;
  kotPrinted: boolean;
}

export interface KOTItem {
  id: string;
  orderId: string;
  tableNumber?: number;
  items: { name: string; quantity: number; notes?: string }[];
  status: "pending" | "preparing" | "ready" | "served";
  createdAt: string;
  type: "dine-in" | "takeaway" | "delivery";
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  visits: number;
  totalSpent: number;
  loyaltyPoints: number;
  lastVisit: string;
  tags: string[];
}

export interface Staff {
  id: string;
  name: string;
  role: "owner" | "manager" | "cashier" | "waiter" | "chef";
  phone: string;
  email?: string;
  shift: "morning" | "evening" | "night";
  active: boolean;
  joinDate: string;
  salesTotal: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  unit: string;
  currentStock: number;
  minStock: number;
  costPerUnit: number;
  supplier: string;
  lastRestocked: string;
  category: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  gstin?: string;
  items: string[];
}

export type DiscountType = "flat" | "percent";

export interface PaymentDetails {
  cash?: number;
  upi?: number;
  card?: number;
  tendered?: number;
  change?: number;
  reference?: string;
}

export interface BusinessSettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  gstin: string;
  state: string;
  stateCode: string;
  sac: string;
  invoicePrefix: string;
  serviceChargeRate: number;
  roundOffEnabled: boolean;
  upiId: string;
}

export interface BillRecord {
  id: string;
  invoiceNumber: string;
  orderId: string;
  type: "dine-in" | "takeaway" | "delivery";
  tableNumber?: number;
  guestCount?: number;
  waiterName?: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  discountLabel?: string;
  cgst5: number;
  sgst5: number;
  cgst18: number;
  sgst18: number;
  cgst: number;
  sgst: number;
  serviceCharge: number;
  roundOff: number;
  total: number;
  paymentStatus: "unpaid" | "paid";
  paymentMode?: "cash" | "card" | "upi" | "split";
  paymentDetails?: PaymentDetails;
  createdAt: string;
  settledAt?: string;
  cashierName: string;
}
