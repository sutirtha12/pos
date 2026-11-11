import { MenuItem, Table, Order, KOTItem, Customer, Staff, InventoryItem, Supplier } from "@/types";

export const menuItems: MenuItem[] = [
  // Starters
  { id: "m1", name: "Paneer Tikka", category: "Starters", price: 280, gstRate: 5, hsnCode: "9963", isVeg: true, available: true, ingredients: ["paneer", "yogurt", "spices"] },
  { id: "m2", name: "Chicken 65", category: "Starters", price: 320, gstRate: 5, hsnCode: "9963", isVeg: false, available: true, ingredients: ["chicken", "spices", "curry leaves"] },
  { id: "m3", name: "Veg Spring Rolls", category: "Starters", price: 220, gstRate: 5, hsnCode: "9963", isVeg: true, available: true, ingredients: ["cabbage", "carrot", "noodles"] },
  { id: "m4", name: "Fish Amritsari", category: "Starters", price: 380, gstRate: 5, hsnCode: "9963", isVeg: false, available: true, ingredients: ["fish", "gram flour", "spices"] },
  { id: "m5", name: "Mushroom Pepper Fry", category: "Starters", price: 260, gstRate: 5, hsnCode: "9963", isVeg: true, available: true, ingredients: ["mushroom", "pepper", "onion"] },
  // Main Course
  { id: "m6", name: "Butter Chicken", category: "Main Course", price: 380, gstRate: 5, hsnCode: "9963", isVeg: false, available: true, ingredients: ["chicken", "butter", "tomato", "cream"] },
  { id: "m7", name: "Dal Makhani", category: "Main Course", price: 280, gstRate: 5, hsnCode: "9963", isVeg: true, available: true, ingredients: ["black dal", "butter", "cream"] },
  { id: "m8", name: "Paneer Butter Masala", category: "Main Course", price: 300, gstRate: 5, hsnCode: "9963", isVeg: true, available: true, ingredients: ["paneer", "butter", "tomato", "cream"] },
  { id: "m9", name: "Mutton Rogan Josh", category: "Main Course", price: 450, gstRate: 5, hsnCode: "9963", isVeg: false, available: true, ingredients: ["mutton", "yogurt", "spices"] },
  { id: "m10", name: "Kadai Paneer", category: "Main Course", price: 290, gstRate: 5, hsnCode: "9963", isVeg: true, available: true, ingredients: ["paneer", "capsicum", "tomato"] },
  { id: "m11", name: "Chicken Biryani", category: "Main Course", price: 350, gstRate: 5, hsnCode: "9963", isVeg: false, available: true, ingredients: ["chicken", "basmati rice", "spices"] },
  { id: "m12", name: "Veg Biryani", category: "Main Course", price: 280, gstRate: 5, hsnCode: "9963", isVeg: true, available: true, ingredients: ["mixed veg", "basmati rice", "spices"] },
  // Breads
  { id: "m13", name: "Butter Naan", category: "Breads", price: 60, gstRate: 5, hsnCode: "9963", isVeg: true, available: true, ingredients: ["flour", "butter"] },
  { id: "m14", name: "Garlic Naan", category: "Breads", price: 80, gstRate: 5, hsnCode: "9963", isVeg: true, available: true, ingredients: ["flour", "garlic", "butter"] },
  { id: "m15", name: "Tandoori Roti", category: "Breads", price: 40, gstRate: 5, hsnCode: "9963", isVeg: true, available: true, ingredients: ["whole wheat flour"] },
  { id: "m16", name: "Laccha Paratha", category: "Breads", price: 70, gstRate: 5, hsnCode: "9963", isVeg: true, available: true, ingredients: ["flour", "ghee"] },
  // Beverages
  { id: "m17", name: "Masala Chai", category: "Beverages", price: 50, gstRate: 5, hsnCode: "9963", isVeg: true, available: true, ingredients: ["tea", "milk", "spices"] },
  { id: "m18", name: "Cold Coffee", category: "Beverages", price: 150, gstRate: 18, hsnCode: "9963", isVeg: true, available: true, ingredients: ["coffee", "milk", "ice cream"] },
  { id: "m19", name: "Fresh Lime Soda", category: "Beverages", price: 100, gstRate: 18, hsnCode: "2202", isVeg: true, available: true, ingredients: ["lime", "soda", "sugar"] },
  { id: "m20", name: "Mango Lassi", category: "Beverages", price: 120, gstRate: 5, hsnCode: "9963", isVeg: true, available: true, ingredients: ["yogurt", "mango", "sugar"] },
  { id: "m21", name: "Bottled Water", category: "Beverages", price: 30, gstRate: 18, hsnCode: "2201", isVeg: true, available: true },
  // Desserts
  { id: "m22", name: "Gulab Jamun", category: "Desserts", price: 120, gstRate: 5, hsnCode: "9963", isVeg: true, available: true, ingredients: ["khoya", "sugar", "cardamom"] },
  { id: "m23", name: "Rasmalai", category: "Desserts", price: 150, gstRate: 5, hsnCode: "9963", isVeg: true, available: true, ingredients: ["paneer", "milk", "saffron"] },
  { id: "m24", name: "Brownie with Ice Cream", category: "Desserts", price: 200, gstRate: 5, hsnCode: "9963", isVeg: true, available: false, ingredients: ["chocolate", "flour", "ice cream"] },
  // Cafe
  { id: "m25", name: "Espresso", category: "Cafe", price: 120, gstRate: 5, hsnCode: "9963", isVeg: true, available: true, ingredients: ["coffee beans"] },
  { id: "m26", name: "Cappuccino", category: "Cafe", price: 180, gstRate: 5, hsnCode: "9963", isVeg: true, available: true, ingredients: ["coffee", "milk"] },
  { id: "m27", name: "Latte", category: "Cafe", price: 200, gstRate: 5, hsnCode: "9963", isVeg: true, available: true, ingredients: ["coffee", "steamed milk"] },
  { id: "m28", name: "Sandwich - Grilled Veg", category: "Cafe", price: 180, gstRate: 5, hsnCode: "9963", isVeg: true, available: true, ingredients: ["bread", "vegetables", "cheese"] },
  { id: "m29", name: "Sandwich - Chicken Club", category: "Cafe", price: 250, gstRate: 5, hsnCode: "9963", isVeg: false, available: true, ingredients: ["bread", "chicken", "lettuce", "mayo"] },
  { id: "m30", name: "Pasta Alfredo", category: "Cafe", price: 280, gstRate: 5, hsnCode: "9963", isVeg: true, available: true, ingredients: ["pasta", "cream", "cheese", "garlic"] },
];

export const tables: Table[] = [
  { id: "t1", number: 1, capacity: 2, status: "available", section: "Indoor" },
  { id: "t2", number: 2, capacity: 2, status: "occupied", section: "Indoor", currentOrderId: "o1" },
  { id: "t3", number: 3, capacity: 4, status: "available", section: "Indoor" },
  { id: "t4", number: 4, capacity: 4, status: "reserved", section: "Indoor" },
  { id: "t5", number: 5, capacity: 6, status: "occupied", section: "Indoor", currentOrderId: "o2" },
  { id: "t6", number: 6, capacity: 4, status: "available", section: "Indoor" },
  { id: "t7", number: 7, capacity: 8, status: "dirty", section: "Indoor" },
  { id: "t8", number: 8, capacity: 2, status: "available", section: "Outdoor" },
  { id: "t9", number: 9, capacity: 4, status: "occupied", section: "Outdoor", currentOrderId: "o3" },
  { id: "t10", number: 10, capacity: 4, status: "available", section: "Outdoor" },
  { id: "t11", number: 11, capacity: 6, status: "available", section: "Outdoor" },
  { id: "t12", number: 12, capacity: 2, status: "available", section: "Terrace" },
  { id: "t13", number: 13, capacity: 4, status: "reserved", section: "Terrace" },
  { id: "t14", number: 14, capacity: 4, status: "available", section: "Terrace" },
  { id: "t15", number: 15, capacity: 8, status: "available", section: "Private Dining" },
];

export const orders: Order[] = [
  {
    id: "o1", tableId: "t2", type: "dine-in", status: "active",
    items: [
      { ...menuItems[5], quantity: 1 },
      { ...menuItems[12], quantity: 3 },
      { ...menuItems[16], quantity: 2 },
    ],
    subtotal: 660, cgst: 16.5, sgst: 16.5, discount: 0, serviceCharge: 33, total: 726,
    createdAt: "2026-11-11T12:30:00", kotPrinted: true,
  },
  {
    id: "o2", tableId: "t5", type: "dine-in", status: "active",
    items: [
      { ...menuItems[0], quantity: 1 },
      { ...menuItems[10], quantity: 2 },
      { ...menuItems[19], quantity: 2 },
    ],
    subtotal: 1220, cgst: 30.5, sgst: 30.5, discount: 0, serviceCharge: 61, total: 1342,
    createdAt: "2026-11-11T13:00:00", kotPrinted: true,
  },
  {
    id: "o3", tableId: "t9", type: "dine-in", status: "active",
    items: [
      { ...menuItems[7], quantity: 1 },
      { ...menuItems[6], quantity: 1 },
      { ...menuItems[13], quantity: 2 },
    ],
    subtotal: 740, cgst: 18.5, sgst: 18.5, discount: 50, serviceCharge: 37, total: 763,
    createdAt: "2026-11-11T13:15:00", kotPrinted: false,
  },
  {
    id: "o4", tableId: undefined, type: "takeaway", status: "active",
    items: [
      { ...menuItems[1], quantity: 2 },
      { ...menuItems[10], quantity: 1 },
    ],
    subtotal: 990, cgst: 24.75, sgst: 24.75, discount: 0, serviceCharge: 0, total: 1039.5,
    createdAt: "2026-11-11T13:30:00", kotPrinted: true,
  },
  {
    id: "o5", tableId: undefined, type: "dine-in", status: "completed",
    items: [
      { ...menuItems[5], quantity: 2 },
      { ...menuItems[12], quantity: 4 },
    ],
    subtotal: 1000, cgst: 25, sgst: 25, discount: 100, serviceCharge: 50, total: 1000,
    paymentMode: "upi", createdAt: "2026-11-11T11:00:00", completedAt: "2026-11-11T11:45:00", kotPrinted: true,
  },
  {
    id: "o6", tableId: undefined, type: "takeaway", status: "completed",
    items: [
      { ...menuItems[24], quantity: 2 },
      { ...menuItems[27], quantity: 1 },
    ],
    subtotal: 420, cgst: 10.5, sgst: 10.5, discount: 0, serviceCharge: 0, total: 441,
    paymentMode: "cash", createdAt: "2026-11-11T10:30:00", completedAt: "2026-11-11T10:40:00", kotPrinted: true,
  },
];

export const kotItems: KOTItem[] = [
  { id: "k1", orderId: "o1", tableNumber: 2, items: [{ name: "Butter Chicken", quantity: 1 }, { name: "Butter Naan", quantity: 3 }], status: "preparing", createdAt: "2026-11-11T12:31:00", type: "dine-in" },
  { id: "k2", orderId: "o2", tableNumber: 5, items: [{ name: "Paneer Tikka", quantity: 1 }, { name: "Chicken Biryani", quantity: 2 }], status: "ready", createdAt: "2026-11-11T13:01:00", type: "dine-in" },
  { id: "k3", orderId: "o3", tableNumber: 9, items: [{ name: "Paneer Butter Masala", quantity: 1 }, { name: "Dal Makhani", quantity: 1 }, { name: "Garlic Naan", quantity: 2 }], status: "pending", createdAt: "2026-11-11T13:16:00", type: "dine-in" },
  { id: "k4", orderId: "o4", tableNumber: undefined, items: [{ name: "Chicken 65", quantity: 2 }, { name: "Chicken Biryani", quantity: 1 }], status: "preparing", createdAt: "2026-11-11T13:31:00", type: "takeaway" },
];

export const customers: Customer[] = [
  { id: "c1", name: "Rahul Sharma", phone: "9876543210", email: "rahul@email.com", visits: 24, totalSpent: 18500, loyaltyPoints: 1850, lastVisit: "2026-11-10", tags: ["regular", "vip"] },
  { id: "c2", name: "Priya Patel", phone: "9876543211", visits: 12, totalSpent: 8200, loyaltyPoints: 820, lastVisit: "2026-11-08", tags: ["regular"] },
  { id: "c3", name: "Amit Kumar", phone: "9876543212", email: "amit.k@email.com", visits: 45, totalSpent: 42000, loyaltyPoints: 4200, lastVisit: "2026-11-11", tags: ["regular", "vip", "birthday-november"] },
  { id: "c4", name: "Sneha Reddy", phone: "9876543213", visits: 8, totalSpent: 5600, loyaltyPoints: 560, lastVisit: "2026-11-05", tags: ["regular"] },
  { id: "c5", name: "Vikram Singh", phone: "9876543214", email: "vikram@business.com", visits: 60, totalSpent: 85000, loyaltyPoints: 8500, lastVisit: "2026-11-11", tags: ["regular", "vip", "corporate"] },
  { id: "c6", name: "Meera Nair", phone: "9876543215", visits: 3, totalSpent: 2100, loyaltyPoints: 210, lastVisit: "2026-10-28", tags: ["new"] },
  { id: "c7", name: "Arjun Gupta", phone: "9876543216", email: "arjun.g@email.com", visits: 15, totalSpent: 12500, loyaltyPoints: 1250, lastVisit: "2026-11-09", tags: ["regular"] },
  { id: "c8", name: "Divya Joshi", phone: "9876543217", visits: 6, totalSpent: 4800, loyaltyPoints: 480, lastVisit: "2026-11-03", tags: ["regular"] },
];

export const staff: Staff[] = [
  { id: "s1", name: "Rajesh Verma", role: "owner", phone: "9800000001", email: "rajesh@restaurant.com", shift: "morning", active: true, joinDate: "2020-01-01", salesTotal: 0 },
  { id: "s2", name: "Anita Desai", role: "manager", phone: "9800000002", email: "anita@restaurant.com", shift: "morning", active: true, joinDate: "2021-03-15", salesTotal: 245000 },
  { id: "s3", name: "Suresh Menon", role: "cashier", phone: "9800000003", shift: "morning", active: true, joinDate: "2022-06-01", salesTotal: 180000 },
  { id: "s4", name: "Pooja Yadav", role: "cashier", phone: "9800000004", shift: "evening", active: true, joinDate: "2023-01-10", salesTotal: 156000 },
  { id: "s5", name: "Ravi Kumar", role: "waiter", phone: "9800000005", shift: "morning", active: true, joinDate: "2022-08-20", salesTotal: 92000 },
  { id: "s6", name: "Deepa Jain", role: "waiter", phone: "9800000006", shift: "evening", active: true, joinDate: "2023-04-01", salesTotal: 78000 },
  { id: "s7", name: "Mohammed Ali", role: "chef", phone: "9800000007", shift: "morning", active: true, joinDate: "2021-01-01", salesTotal: 0 },
  { id: "s8", name: "Lakshmi Iyer", role: "chef", phone: "9800000008", shift: "evening", active: true, joinDate: "2022-02-15", salesTotal: 0 },
  { id: "s9", name: "Kiran Patil", role: "waiter", phone: "9800000009", shift: "night", active: false, joinDate: "2023-09-01", salesTotal: 34000 },
];

export const inventory: InventoryItem[] = [
  { id: "i1", name: "Chicken", unit: "kg", currentStock: 15, minStock: 10, costPerUnit: 220, supplier: "Fresh Farms", lastRestocked: "2026-11-10", category: "Meat" },
  { id: "i2", name: "Paneer", unit: "kg", currentStock: 8, minStock: 5, costPerUnit: 320, supplier: "Dairy Fresh", lastRestocked: "2026-11-10", category: "Dairy" },
  { id: "i3", name: "Basmati Rice", unit: "kg", currentStock: 25, minStock: 15, costPerUnit: 120, supplier: "Grain House", lastRestocked: "2026-11-08", category: "Grains" },
  { id: "i4", name: "Butter", unit: "kg", currentStock: 3, minStock: 5, costPerUnit: 480, supplier: "Dairy Fresh", lastRestocked: "2026-11-09", category: "Dairy" },
  { id: "i5", name: "Tomatoes", unit: "kg", currentStock: 12, minStock: 8, costPerUnit: 40, supplier: "Fresh Farms", lastRestocked: "2026-11-11", category: "Vegetables" },
  { id: "i6", name: "Onions", unit: "kg", currentStock: 20, minStock: 10, costPerUnit: 35, supplier: "Fresh Farms", lastRestocked: "2026-11-11", category: "Vegetables" },
  { id: "i7", name: "Cream", unit: "ltr", currentStock: 4, minStock: 3, costPerUnit: 280, supplier: "Dairy Fresh", lastRestocked: "2026-11-10", category: "Dairy" },
  { id: "i8", name: "Flour (Maida)", unit: "kg", currentStock: 18, minStock: 10, costPerUnit: 45, supplier: "Grain House", lastRestocked: "2026-11-07", category: "Grains" },
  { id: "i9", name: "Coffee Beans", unit: "kg", currentStock: 2, minStock: 3, costPerUnit: 1200, supplier: "Bean Co.", lastRestocked: "2026-11-05", category: "Beverages" },
  { id: "i10", name: "Milk", unit: "ltr", currentStock: 20, minStock: 15, costPerUnit: 60, supplier: "Dairy Fresh", lastRestocked: "2026-11-11", category: "Dairy" },
  { id: "i11", name: "Cooking Oil", unit: "ltr", currentStock: 10, minStock: 8, costPerUnit: 180, supplier: "Grain House", lastRestocked: "2026-11-09", category: "Oils" },
  { id: "i12", name: "Mutton", unit: "kg", currentStock: 5, minStock: 5, costPerUnit: 650, supplier: "Fresh Farms", lastRestocked: "2026-11-10", category: "Meat" },
  { id: "i13", name: "Fish (Basa)", unit: "kg", currentStock: 4, minStock: 3, costPerUnit: 350, supplier: "Fresh Farms", lastRestocked: "2026-11-10", category: "Meat" },
  { id: "i14", name: "Yogurt", unit: "kg", currentStock: 6, minStock: 4, costPerUnit: 80, supplier: "Dairy Fresh", lastRestocked: "2026-11-11", category: "Dairy" },
  { id: "i15", name: "Sugar", unit: "kg", currentStock: 8, minStock: 5, costPerUnit: 50, supplier: "Grain House", lastRestocked: "2026-11-08", category: "Grains" },
];

export const suppliers: Supplier[] = [
  { id: "sp1", name: "Fresh Farms", phone: "9900000001", gstin: "29AABCU9603R1ZM", items: ["Chicken", "Mutton", "Fish", "Tomatoes", "Onions"] },
  { id: "sp2", name: "Dairy Fresh", phone: "9900000002", gstin: "29AABCU9604R1ZN", items: ["Paneer", "Butter", "Cream", "Milk", "Yogurt"] },
  { id: "sp3", name: "Grain House", phone: "9900000003", gstin: "29AABCU9605R1ZO", items: ["Basmati Rice", "Flour", "Cooking Oil", "Sugar"] },
  { id: "sp4", name: "Bean Co.", phone: "9900000004", items: ["Coffee Beans"] },
];

export const dailyStats = {
  totalSales: 28450,
  ordersToday: 34,
  avgOrderValue: 837,
  topItem: "Butter Chicken",
  topItemCount: 12,
  dineIn: 22,
  takeaway: 8,
  delivery: 4,
  cashPayments: 12500,
  upiPayments: 11200,
  cardPayments: 4750,
  totalCustomers: 28,
  newCustomers: 3,
  gstCollected: 1422.50,
};

export const weeklySalesData = [
  { day: "Mon", sales: 22400, orders: 28 },
  { day: "Tue", sales: 18900, orders: 24 },
  { day: "Wed", sales: 25600, orders: 32 },
  { day: "Thu", sales: 21300, orders: 27 },
  { day: "Fri", sales: 31200, orders: 40 },
  { day: "Sat", sales: 38500, orders: 48 },
  { day: "Sun", sales: 35800, orders: 45 },
];

export const categoryBreakdown = [
  { category: "Main Course", amount: 12400, percentage: 43.6 },
  { category: "Starters", amount: 5200, percentage: 18.3 },
  { category: "Beverages", amount: 4100, percentage: 14.4 },
  { category: "Cafe", amount: 3500, percentage: 12.3 },
  { category: "Breads", amount: 1850, percentage: 6.5 },
  { category: "Desserts", amount: 1400, percentage: 4.9 },
];
