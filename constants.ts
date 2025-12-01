import { Product, ReturnReason } from './types';

export const RETURN_REASONS = [
  ReturnReason.DAMAGED_SHIPPING,
  ReturnReason.DEFECTIVE_SCREEN,
  ReturnReason.NOT_WORKING,
  ReturnReason.WRONG_ITEM,
  ReturnReason.BETTER_PRICE,
  ReturnReason.NO_LONGER_NEEDED,
  ReturnReason.MISSING_PARTS,
  ReturnReason.QUALITY_ISSUES,
  ReturnReason.SIZE_FIT,
  ReturnReason.ARRIVED_LATE,
];

export const CATEGORIES = [
    'All', 
    'Electronics', 
    'Clothes', 
    'Shoes', 
    'Fashion', 
    'Grocery', 
    'Wearables', 
    'Audio', 
    'Home Office', 
    'Gaming'
];

export const MOCK_PRODUCTS: Product[] = [
  // ELECTRONICS
  {
    id: 'p1',
    name: 'Quantum X1 Laptop',
    price: 1299.99,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop&q=60',
    description: 'High-performance laptop with OLED display and AI-core processor.',
    purchasedDate: '2023-10-15',
    orderId: 'ORD-7782-X1'
  },
  {
    id: 'e2',
    name: 'PixelPad Pro Tablet',
    price: 899.00,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=60',
    description: '12.9-inch Liquid Retina display with M2 chip.',
  },
  {
    id: 'e3',
    name: 'SkyView 4K Drone',
    price: 749.50,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1507582020474-9a35b7d450d7?w=800&auto=format&fit=crop&q=60',
    description: 'Foldable drone with 3-axis gimbal and 4K camera.',
  },
  {
    id: 'e4',
    name: 'Smart Home Hub',
    price: 129.00,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1558002038-1091a1661116?w=800&auto=format&fit=crop&q=60',
    description: 'Voice-controlled smart hub for home automation.',
  },

  // WEARABLES
  {
    id: 'p2',
    name: 'Nebula Smart Watch',
    price: 299.50,
    category: 'Wearables',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=60',
    description: 'Advanced health tracking, ECG, and solar charging capabilities.',
    purchasedDate: '2023-11-01',
    orderId: 'ORD-9921-NW'
  },
  {
    id: 'w2',
    name: 'Vitality Fitness Band',
    price: 49.99,
    category: 'Wearables',
    image: 'https://images.unsplash.com/photo-1576243345690-4e4b79b63288?w=800&auto=format&fit=crop&q=60',
    description: 'Waterproof tracker with heart rate and sleep monitoring.',
  },
  {
    id: 'w3',
    name: 'VR Headset Pro',
    price: 399.00,
    category: 'Wearables',
    image: 'https://images.unsplash.com/photo-1622979135225-d2ba269fb1bd?w=800&auto=format&fit=crop&q=60',
    description: 'Immersive virtual reality headset with 6DOF tracking.',
  },

  // AUDIO
  {
    id: 'p3',
    name: 'Sonic Boom Headphones',
    price: 199.00,
    category: 'Audio',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=60',
    description: 'Active noise cancelling over-ear headphones with 40h battery.',
    purchasedDate: '2023-11-20',
    orderId: 'ORD-3321-SB'
  },
  {
    id: 'a2',
    name: 'PodPro Wireless Earbuds',
    price: 159.00,
    category: 'Audio',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=60',
    description: 'True wireless earbuds with spatial audio and transparency mode.',
  },
  {
    id: 'a3',
    name: 'Vintage Turntable',
    price: 249.00,
    category: 'Audio',
    image: 'https://images.unsplash.com/photo-1614726365723-498aa46ebc68?w=800&auto=format&fit=crop&q=60',
    description: 'Belt-drive bluetooth turntable with built-in preamp.',
  },

  // CLOTHES
  {
    id: 'p9',
    name: 'Classic Denim Jacket',
    price: 89.99,
    category: 'Clothes',
    image: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800&auto=format&fit=crop&q=60',
    description: 'Vintage wash denim jacket with sherpa lining.',
    purchasedDate: '2024-01-10',
    orderId: 'ORD-5521-DJ'
  },
  {
    id: 'c2',
    name: 'Premium Cotton Tee Pack',
    price: 34.99,
    category: 'Clothes',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&auto=format&fit=crop&q=60',
    description: '3-pack of heavyweight organic cotton t-shirts.',
  },
  {
    id: 'c3',
    name: 'Merino Wool Sweater',
    price: 120.00,
    category: 'Clothes',
    image: 'https://images.unsplash.com/photo-1620799140408-ed5341cd2431?w=800&auto=format&fit=crop&q=60',
    description: 'Soft, breathable merino wool sweater in charcoal grey.',
  },
  {
    id: 'c4',
    name: 'Summer Floral Dress',
    price: 65.00,
    category: 'Clothes',
    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop&q=60',
    description: 'Lightweight floral print midi dress, perfect for summer.',
  },
  {
    id: 'c5',
    name: 'Urban Hoodie',
    price: 55.00,
    category: 'Clothes',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&auto=format&fit=crop&q=60',
    description: 'Heavyweight fleece hoodie in matte black.',
  },

  // SHOES
  {
    id: 'p10',
    name: 'Air Stride Running Shoes',
    price: 120.00,
    category: 'Shoes',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=60',
    description: 'Lightweight performance running shoes with reactive foam.',
    purchasedDate: '2024-02-01',
    orderId: 'ORD-8821-RS'
  },
  {
    id: 's2',
    name: 'Urban High-Tops',
    price: 95.00,
    category: 'Shoes',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=60',
    description: 'Canvas high-top sneakers with durable rubber sole.',
  },
  {
    id: 's3',
    name: 'Classic Leather Loafers',
    price: 150.00,
    category: 'Shoes',
    image: 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=800&auto=format&fit=crop&q=60',
    description: 'Handcrafted leather loafers with cushioned insole.',
  },
  {
    id: 's4',
    name: 'Hiking Boots',
    price: 180.00,
    category: 'Shoes',
    image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&auto=format&fit=crop&q=60',
    description: 'Waterproof hiking boots with rugged traction.',
  },

  // FASHION
  {
    id: 'p11',
    name: 'Silk Floral Scarf',
    price: 45.00,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1584030373081-f37b7bb4fa8e?w=800&auto=format&fit=crop&q=60',
    description: '100% Mulberry silk scarf with hand-painted floral design.',
  },
  {
    id: 'f2',
    name: 'Aviator Sunglasses',
    price: 135.00,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&auto=format&fit=crop&q=60',
    description: 'Classic aviator style with polarized lenses and gold frame.',
  },
  {
    id: 'f3',
    name: 'Leather Crossbody Bag',
    price: 210.00,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=60',
    description: 'Genuine leather bag with adjustable strap and multiple compartments.',
  },
  {
    id: 'f4',
    name: 'Minimalist Watch',
    price: 120.00,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&auto=format&fit=crop&q=60',
    description: 'Analog watch with rose gold case and leather strap.',
  },

  // GROCERY
  {
    id: 'p12',
    name: 'Organic Green Tea Pack',
    price: 24.99,
    category: 'Grocery',
    image: 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=800&auto=format&fit=crop&q=60',
    description: 'Premium organic matcha green tea powder, 500g.',
  },
  {
    id: 'g2',
    name: 'Artisan Coffee Beans',
    price: 18.50,
    category: 'Grocery',
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&auto=format&fit=crop&q=60',
    description: 'Single-origin Arabica coffee beans, medium roast.',
  },
  {
    id: 'g3',
    name: 'Gourmet Dark Chocolate',
    price: 12.99,
    category: 'Grocery',
    image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=800&auto=format&fit=crop&q=60',
    description: '85% cocoa dark chocolate bar with sea salt.',
  },
  {
    id: 'g4',
    name: 'Extra Virgin Olive Oil',
    price: 22.00,
    category: 'Grocery',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd3925?w=800&auto=format&fit=crop&q=60',
    description: 'Cold-pressed extra virgin olive oil from Italy.',
  },
  {
    id: 'g5',
    name: 'Organic Granola',
    price: 8.99,
    category: 'Grocery',
    image: 'https://images.unsplash.com/photo-1517093729634-686c528d44ce?w=800&auto=format&fit=crop&q=60',
    description: 'Honey almond granola with dried fruits.',
  },

  // HOME OFFICE
  {
    id: 'p4',
    name: 'Vision Pro 4K Monitor',
    price: 450.00,
    category: 'Home Office',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=60',
    description: '32-inch 4K IPS monitor with color accuracy for creatives.',
  },
  {
    id: 'p5',
    name: 'CyberStream Webcam',
    price: 129.00,
    category: 'Home Office',
    image: 'https://images.unsplash.com/photo-1590637687834-3112328db942?w=800&auto=format&fit=crop&q=60',
    description: '4K webcam with AI tracking and ring light.',
  },
  {
    id: 'h3',
    name: 'ErgoMesh Office Chair',
    price: 349.00,
    category: 'Home Office',
    image: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=800&auto=format&fit=crop&q=60',
    description: 'Fully adjustable ergonomic mesh chair with lumbar support.',
  },

  // GAMING
  {
    id: 'p6',
    name: 'Velocity Gaming Mouse',
    price: 79.99,
    category: 'Gaming',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=60',
    description: 'Ultra-lightweight gaming mouse with 25K DPI sensor.',
  },
  {
    id: 'ga2',
    name: 'Mechanical RGB Keyboard',
    price: 129.99,
    category: 'Gaming',
    image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=800&auto=format&fit=crop&q=60',
    description: 'Tactile mechanical switches with per-key RGB lighting.',
  },
  {
    id: 'ga3',
    name: 'Console Controller',
    price: 59.99,
    category: 'Gaming',
    image: 'https://images.unsplash.com/photo-1592840496011-8b3412a1331c?w=800&auto=format&fit=crop&q=60',
    description: 'Wireless controller with haptic feedback.',
  }
];

export const COMPANY_POLICY_TEXT = `
RETURN POLICY DATABASE (Simulated Vector Store):

1. BROKEN SCREENS: 
   - If the screen crack point of impact suggests a drop (spiderweb from corner), return is DENIED (User Damage).
   - If the screen has a single hairline crack or internal bleeding without glass damage, return is APPROVED (Manufacturing Defect).

2. WATER DAMAGE:
   - Any signs of liquid contact (corrosion, pink indicators) result in immediate DENIAL.

3. ACCESSORIES:
   - Missing accessories will result in a 20% restocking fee deduction from the refund.

4. TIMEFRAME:
   - Returns must be initiated within 30 days of purchase.
   
5. CONDITION:
   - Item must be in "Like New" condition unless claiming damage on arrival.
   
6. SHOES & CLOTHING:
   - Must be unworn with original tags attached.
   - Worn soles on shoes are grounds for denial unless a structural defect is present (sole separation).
`;
