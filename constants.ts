import { Order, OrderStatus, Product, User, CartItem } from './types';

export const ALL_PRODUCTS: Product[] = [
  // --- Apparel & Fashion ---
  {
    id: "prod_1",
    name: "Eco-Fleece Hoodie",
    price: 85,
    color: "Sage Green",
    size: "M",
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=400&q=80",
    category: "Apparel",
    tags: ["sustainable", "casual", "winter"]
  },
  {
    id: "prod_7",
    name: "Vintage Denim Jacket",
    price: 110,
    color: "Blue Wash",
    size: "L",
    image: "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&w=400&q=80",
    category: "Fashion",
    tags: ["vintage", "casual", "outerwear"]
  },
  {
    id: "prod_8",
    name: "Silk Scarf",
    price: 65,
    color: "Floral Pattern",
    size: "One Size",
    image: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=400&q=80",
    category: "Fashion",
    tags: ["luxury", "accessories"]
  },
  {
    id: "prod_19",
    name: "Linen Button Shirt",
    price: 55,
    color: "Beige",
    size: "L",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&q=80",
    category: "Fashion",
    tags: ["summer", "casual"]
  },
  {
    id: "prod_20",
    name: "Floral Summer Dress",
    price: 75,
    color: "Yellow",
    size: "S",
    image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=400&q=80",
    category: "Fashion",
    tags: ["summer", "party"]
  },

  // --- Footwear ---
  {
    id: "prod_15",
    name: "Urban Runner Sneakers",
    price: 120,
    color: "Grey/Neon",
    size: "US 10",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80",
    category: "Footwear",
    tags: ["sport", "fashion"]
  },
  {
    id: "prod_21",
    name: "Leather Hiking Boots",
    price: 160,
    color: "Brown",
    size: "US 9",
    image: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=400&q=80",
    category: "Footwear",
    tags: ["outdoor", "durable"]
  },
  {
    id: "prod_22",
    name: "Classic Loafers",
    price: 95,
    color: "Black",
    size: "US 10",
    image: "https://images.unsplash.com/photo-1614252369475-531eba835eb1?auto=format&fit=crop&w=400&q=80",
    category: "Footwear",
    tags: ["formal", "office"]
  },

  // --- Electronics & Gadgets ---
  {
    id: "prod_2",
    name: "Wireless Headphones",
    price: 299,
    color: "Matte Black",
    size: "One Size",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80",
    category: "Electronics",
    tags: ["audio", "travel", "tech"]
  },
  {
    id: "prod_4",
    name: "Smart Fitness Watch",
    price: 199,
    color: "Midnight Blue",
    size: "One Size",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80",
    category: "Gadgets",
    tags: ["fitness", "tech", "health"]
  },
  {
    id: "prod_9",
    name: "Mini Drone 4K",
    price: 450,
    color: "White",
    size: "Standard",
    // Updated image to a clear drone shot
    image: "https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=400&q=80",
    category: "Gadgets",
    tags: ["photography", "tech", "outdoor"]
  },
  {
    id: "prod_17",
    name: "Portable Bluetooth Speaker",
    price: 59,
    color: "Teal",
    size: "Mini",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=400&q=80",
    category: "Electronics",
    tags: ["music", "portable"]
  },
  {
    id: "prod_23",
    name: "USB-C Fast Charger",
    price: 25,
    color: "White",
    size: "N/A",
    image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=400&q=80",
    category: "Gadgets",
    tags: ["accessory", "power"]
  },

  // --- Beauty & Makeup ---
  {
    id: "prod_24",
    name: "Velvet Matte Lipstick",
    price: 28,
    color: "Ruby Red",
    size: "3g",
    image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=400&q=80",
    category: "Beauty",
    tags: ["makeup", "cosmetics"]
  },
  {
    id: "prod_25",
    name: "Hydrating Facial Serum",
    price: 45,
    color: "Clear",
    size: "30ml",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=400&q=80",
    category: "Beauty",
    tags: ["skincare", "wellness"]
  },
  {
    id: "prod_26",
    name: "Eyeshadow Palette",
    price: 35,
    color: "Nude Tones",
    size: "12 Colors",
    image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=400&q=80",
    category: "Beauty",
    tags: ["makeup", "artistry"]
  },

  // --- Grocery ---
  {
    id: "prod_27",
    name: "Organic Arabica Coffee",
    price: 18,
    color: "Dark Roast",
    size: "1lb",
    image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=400&q=80",
    category: "Grocery",
    tags: ["beverage", "organic"]
  },
  {
    id: "prod_28",
    name: "Artisan Dark Chocolate",
    price: 12,
    color: "Dark",
    size: "100g",
    image: "https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=400&q=80",
    category: "Grocery",
    tags: ["sweets", "snack"]
  },
  {
    id: "prod_29",
    name: "Extra Virgin Olive Oil",
    price: 22,
    color: "Gold",
    size: "500ml",
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80",
    category: "Grocery",
    tags: ["cooking", "essential"]
  },

  // --- Stationery ---
  {
    id: "prod_30",
    name: "Leather Bound Journal",
    price: 30,
    color: "Brown",
    size: "A5",
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80",
    category: "Stationery",
    tags: ["writing", "office"]
  },
  {
    id: "prod_31",
    name: "Gold Fountain Pen",
    price: 55,
    color: "Gold",
    size: "Fine Nib",
    image: "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?auto=format&fit=crop&w=400&q=80",
    category: "Stationery",
    tags: ["luxury", "writing"]
  },
  {
    id: "prod_32",
    name: "Minimalist Desk Organizer",
    price: 25,
    color: "Bamboo",
    size: "Standard",
    image: "https://images.unsplash.com/photo-1505330622279-bf7d7fc918f4?auto=format&fit=crop&w=400&q=80",
    category: "Stationery",
    tags: ["office", "organization"]
  },

  // --- Kitchenware ---
  {
    id: "prod_10",
    name: "Smart Blender Pro",
    price: 180,
    color: "Stainless Steel",
    size: "2L",
    image: "https://images.unsplash.com/photo-1570222094114-28a9d8896aca?auto=format&fit=crop&w=400&q=80",
    category: "Kitchenware",
    tags: ["home", "appliance", "smart-home"]
  },
  {
    id: "prod_12",
    name: "Espresso Machine",
    price: 600,
    color: "Red",
    size: "Standard",
    image: "https://images.unsplash.com/photo-1520981825232-ece5fae45120?auto=format&fit=crop&w=400&q=80",
    category: "Kitchenware",
    tags: ["coffee", "luxury", "morning"]
  },

  // --- Accessories ---
  {
    id: "prod_16",
    name: "Travel Backpack",
    price: 89,
    color: "Charcoal",
    size: "30L",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=400&q=80",
    category: "Accessories",
    tags: ["travel", "outdoor"]
  },
  {
    id: "prod_13",
    name: "Premium Yoga Mat",
    price: 45,
    color: "Lavender",
    size: "Standard",
    image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=400&q=80",
    category: "Fitness",
    tags: ["health", "workout"]
  },
  {
    id: "prod_14",
    name: "Smart Thermostat",
    price: 129,
    color: "Black",
    size: "Gen 3",
    image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=400&q=80",
    category: "Smart Home",
    tags: ["home", "tech", "efficiency"]
  },

  // --- Toys & Hobbies ---
  {
    id: "prod_33",
    name: "RC Off-Road Car",
    price: 65,
    color: "Red/Black",
    size: "1:18 Scale",
    image: "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=400&q=80",
    category: "Toys",
    tags: ["kids", "fun", "remote-control"]
  },
  {
    id: "prod_34",
    name: "Building Blocks Set",
    price: 45,
    color: "Multi",
    size: "500 pcs",
    image: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=400&q=80",
    category: "Toys",
    tags: ["educational", "creative"]
  },

  // --- Pet Supplies ---
  {
    id: "prod_35",
    name: "Orthopedic Dog Bed",
    price: 89,
    color: "Grey",
    size: "Large",
    image: "https://images.unsplash.com/photo-1591946614720-90a587da4a36?auto=format&fit=crop&w=400&q=80",
    category: "Pets",
    tags: ["dog", "comfort"]
  },
  {
    id: "prod_36",
    name: "Automatic Cat Feeder",
    price: 75,
    color: "White",
    size: "4L",
    image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=400&q=80",
    category: "Pets",
    tags: ["cat", "smart-home"]
  },

  // --- Automotive ---
  {
    id: "prod_37",
    name: "Portable Car Vacuum",
    price: 40,
    color: "Black",
    size: "Compact",
    image: "https://images.unsplash.com/photo-1606813636544-2396b12d52f6?auto=format&fit=crop&w=400&q=80",
    category: "Automotive",
    tags: ["cleaning", "car"]
  },
  {
    id: "prod_38",
    name: "Car Phone Mount",
    price: 25,
    color: "Black",
    size: "Universal",
    image: "https://images.unsplash.com/photo-1635770311497-8c38a29ee5b4?auto=format&fit=crop&w=400&q=80",
    category: "Automotive",
    tags: ["accessory", "convenience"]
  },

  // --- Books ---
  {
    id: "prod_39",
    name: "Sci-Fi Novel Best Seller",
    price: 24,
    color: "N/A",
    size: "Hardcover",
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80",
    category: "Books",
    tags: ["fiction", "reading"]
  },
  {
    id: "prod_40",
    name: "Gourmet Cookbook",
    price: 35,
    color: "N/A",
    size: "Hardcover",
    image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=400&q=80",
    category: "Books",
    tags: ["cooking", "learning"]
  },

  // --- Garden & Outdoor ---
  {
    id: "prod_41",
    name: "Ceramic Planter Set",
    price: 45,
    color: "Terracotta",
    size: "Set of 3",
    image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=400&q=80",
    category: "Garden",
    tags: ["plants", "decor"]
  },
  {
    id: "prod_42",
    name: "Garden Tool Kit",
    price: 30,
    color: "Green",
    size: "Standard",
    image: "https://images.unsplash.com/photo-1617576683096-00fc8eecb3af?auto=format&fit=crop&w=400&q=80",
    category: "Garden",
    tags: ["tools", "outdoor"]
  }
];

export const MOCK_CART: CartItem[] = [];

export const MOCK_USERS: User[] = [
  {
    id: "usr_1",
    email: "user@demo.com",
    name: "Alex Doe",
    passwordHash: "123456", 
    preferences: ["sustainable", "tech", "minimalist"],
    wishlist: []
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    orderId: "ORD-7782-X",
    userId: "usr_1",
    customerName: "Alex Doe",
    date: "2023-10-25",
    status: OrderStatus.DELIVERED,
    eligibleForReturn: true,
    items: [ ALL_PRODUCTS[0], ALL_PRODUCTS[2] ] // Hoodie, Scarf
  },
  {
    orderId: "ORD-9921-Y",
    userId: "usr_1",
    customerName: "Alex Doe",
    date: "2023-09-10",
    status: OrderStatus.DELIVERED,
    eligibleForReturn: false, // Too old
    items: [ ALL_PRODUCTS[5] ] 
  },
  {
    orderId: "ORD-3345-Z",
    userId: "usr_1",
    customerName: "Alex Doe",
    date: "2023-10-28",
    status: OrderStatus.DELIVERED,
    eligibleForReturn: true,
    items: [ ALL_PRODUCTS[10] ] // Mini Drone (Updated index due to inserts, mapping by ID below)
  },
  {
    orderId: "ORD-1122-A",
    userId: "usr_1",
    customerName: "Alex Doe",
    date: "2023-11-05",
    status: OrderStatus.RETURN_INITIATED, 
    eligibleForReturn: false,
    items: [ ALL_PRODUCTS[8] ] // Headphones
  },
  {
    orderId: "ORD-6673-M",
    userId: "usr_1",
    customerName: "Alex Doe",
    date: "2024-01-10",
    status: OrderStatus.DELIVERED,
    eligibleForReturn: true,
    items: [ ALL_PRODUCTS[19], ALL_PRODUCTS[21] ] 
  }
];

// Re-map initial orders to use the exact objects from the new ALL_PRODUCTS array to avoid index confusion
// Helper to find prod
const findProd = (id: string) => ALL_PRODUCTS.find(p => p.id === id) || ALL_PRODUCTS[0];

INITIAL_ORDERS.forEach(order => {
    // Just ensuring items exist, in a real app these would be IDs
    if (!order.items || order.items.length === 0) order.items = [ALL_PRODUCTS[0]];
});
// Hardcoding a few specific ones for the demo data
INITIAL_ORDERS[0].items = [findProd("prod_1"), findProd("prod_8")];
INITIAL_ORDERS[1].items = [findProd("prod_4")];
INITIAL_ORDERS[2].items = [findProd("prod_9")];
INITIAL_ORDERS[3].items = [findProd("prod_2")];
INITIAL_ORDERS[4].items = [findProd("prod_16"), findProd("prod_14")];


export const RETURN_REASONS = [
  "Sizing or fit issues",
  "Damaged or defective item",
  "Did not meet expectations",
  "Changed mind or impulse purchase",
  "Incorrect order",
  "Delivery delays",
  "Unwanted gifts",
  "Misleading product information"
];

export const RETURN_POLICIES = [
  { condition: "damage", window: 30, fee: 0, action: "Refund or Exchange" },
  { condition: "wrong_size", window: 30, fee: 0, action: "Exchange Only" },
  { condition: "remorse", window: 14, fee: 10, action: "Refund" }, 
  { condition: "technical_fault", window: 60, fee: 0, action: "Replacement" }
];

export const KNOWLEDGE_BASE_ARTICLES = [
  { id: "kb_1", title: "Recycling Program", content: "We offer a free recycling program for all electronics. Request a shipping label from support." },
  { id: "kb_2", title: "Serial Number Location", content: "For headphones, the serial number is located on the inside of the left ear cup. For Blenders, check the bottom base." },
  { id: "kb_3", title: "International Returns", content: "International returns take 14-20 business days to process and may incur a $15 handling fee." },
  { id: "kb_4", title: "Technical Troubleshooting - Screens", content: "If a screen is flickering, please provide a video. This is often a connector issue." }
];