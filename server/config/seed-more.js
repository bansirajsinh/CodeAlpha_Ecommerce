// seed-more.js - diagnostic script to seed 36 additional products into the database
require('dotenv').config();
const mysql = require('mysql2/promise');

const newProducts = [
  // Electronics (category_id = 1)
  {
    category_id: 1,
    name: 'Logitech MX Master 3S Mouse',
    slug: 'logitech-mx-master-3s-mouse',
    description: 'Ergonomic wireless mouse with ultra-fast MagSpeed scrolling, 8K DPI tracking on any surface, quiet clicks, and multi-device connection capability.',
    price: 99.99,
    stock_qty: 85,
    image_url: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600'
  },
  {
    category_id: 1,
    name: 'Kindle Paperwhite (16 GB)',
    slug: 'kindle-paperwhite-16gb',
    description: 'Now with a 6.8-inch display and thinner borders, adjustable warm light, up to 10 weeks of battery life, and 20% faster page turns. Waterproof design.',
    price: 149.99,
    stock_qty: 60,
    image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600'
  },
  {
    category_id: 1,
    name: 'Apple iPad Pro 11-inch (M4)',
    slug: 'apple-ipad-pro-11-m4',
    description: 'Impossibly thin design with the breakthrough Apple M4 chip, Ultra Retina XDR OLED display, and superfast Wi-Fi 6E. Supports Apple Pencil Pro.',
    price: 999.00,
    stock_qty: 25,
    image_url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600'
  },
  {
    category_id: 1,
    name: 'Dell UltraSharp 27 Monitor',
    slug: 'dell-ultrasharp-27-monitor',
    description: '27-inch 4K USB-C Hub monitor with outstanding color coverage including DCI-P3, ComfortView Plus built-in low blue light, and tilt/swivel/pivot adjustability.',
    price: 349.99,
    stock_qty: 30,
    image_url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600'
  },
  {
    category_id: 1,
    name: 'Sony PlayStation 5 Slim',
    slug: 'sony-playstation-5-slim',
    description: 'Experience lightning-fast loading with an ultra-high speed SSD, deeper immersion with support for haptic feedback, adaptive triggers, and 3D Audio.',
    price: 499.99,
    stock_qty: 40,
    image_url: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600'
  },
  {
    category_id: 1,
    name: 'JBL Flip 6 Portable Speaker',
    slug: 'jbl-flip-6-portable-speaker',
    description: 'JBL Flip 6 delivers powerful JBL Original Pro Sound with exceptional clarity thanks to its 2-way speaker system. IP67 waterproof and 12 hours playtime.',
    price: 129.95,
    stock_qty: 90,
    image_url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600'
  },

  // Clothing (category_id = 2)
  {
    category_id: 2,
    name: 'Patagonia Better Sweater Fleece',
    slug: 'patagonia-better-sweater-fleece',
    description: 'A warm, low-bulk full-zip jacket made of soft, sweater-knit 100% recycled polyester fleece. Dyed with a low-impact process.',
    price: 139.00,
    stock_qty: 50,
    image_url: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=600'
  },
  {
    category_id: 2,
    name: 'Ray-Ban Classic Wayfarer Sunglasses',
    slug: 'ray-ban-classic-wayfarer',
    description: 'The most recognizable style in the history of sunglasses. Distinctive shape is combined with the traditional Ray-Ban signature logo on the sculpted temples.',
    price: 163.00,
    stock_qty: 75,
    image_url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600'
  },
  {
    category_id: 2,
    name: 'The North Face Borealis Backpack',
    slug: 'the-north-face-borealis-backpack',
    description: 'Classic 28-liter backpack for school, work, or adventure. Features a dedicated, highly protective laptop compartment and FlexVent suspension system.',
    price: 99.00,
    stock_qty: 110,
    image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600'
  },
  {
    category_id: 2,
    name: "Calvin Klein Men's Boxers (3-Pack)",
    slug: 'calvin-klein-boxers-3pack',
    description: 'Classic fit boxers crafted from soft 100% cotton for breathable comfort. Features a comfortable elasticized Calvin Klein signature logo waistband.',
    price: 39.99,
    stock_qty: 150,
    image_url: 'https://images.unsplash.com/photo-1562572159-4ebcd318f4dd?w=600'
  },
  {
    category_id: 2,
    name: 'Tommy Hilfiger Classic Polo Shirt',
    slug: 'tommy-hilfiger-classic-polo',
    description: 'A staple in any wardrobe, this custom-fit polo shirt is crafted from 100% cotton pique for ultimate breathability and comfort. Embroidered flag on chest.',
    price: 59.50,
    stock_qty: 85,
    image_url: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600'
  },
  {
    category_id: 2,
    name: 'Birkenstock Arizona Unisex Sandals',
    slug: 'birkenstock-arizona-sandals',
    description: 'The iconic two-strap sandal with a legendary comfort cork footbed that mimics the shape of a healthy foot. Crafted from durable Birko-Flor synthetic leather.',
    price: 110.00,
    stock_qty: 45,
    image_url: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=600'
  },

  // Books (category_id = 3)
  {
    category_id: 3,
    name: 'Designing Data-Intensive Applications',
    slug: 'designing-data-intensive-apps',
    description: 'By Martin Kleppmann. An engineering-grade guide to the principles, architectures, and trade-offs of modern database, storage, and processing technologies.',
    price: 49.99,
    stock_qty: 120,
    image_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600'
  },
  {
    category_id: 3,
    name: 'Refactoring: Improving Code Design',
    slug: 'refactoring-martin-fowler',
    description: 'By Martin Fowler. The classic, must-have handbook on code architecture. Teaches how to safely refactor and restructure legacy codebases without breaking features.',
    price: 44.99,
    stock_qty: 80,
    image_url: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600'
  },
  {
    category_id: 3,
    name: 'Introduction to Algorithms (CLRS)',
    slug: 'introduction-to-algorithms-clrs',
    description: 'The global standard textbook on algorithms. Provides deep, rigorous coverage of sorting, data structures, graph algorithms, and computational complexity.',
    price: 89.99,
    stock_qty: 65,
    image_url: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=600'
  },
  {
    category_id: 3,
    name: 'Compilers: Principles, Techniques, & Tools',
    slug: 'compilers-dragon-book',
    description: 'Commonly known as the "Dragon Book". The definitive, authoritative reference text on lexical analysis, parsing, compiler architectures, and code optimization.',
    price: 99.00,
    stock_qty: 40,
    image_url: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=600'
  },
  {
    category_id: 3,
    name: "You Don't Know JS Yet: Get Started",
    slug: 'you-dont-know-js-yet',
    description: 'By Kyle Simpson. The foundational guide to core JavaScript mechanisms. Explains scope, closures, objects, prototypes, and asynchronous patterns in deep detail.',
    price: 25.00,
    stock_qty: 130,
    image_url: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=600'
  },
  {
    category_id: 3,
    name: 'Sapiens: A Brief History of Humankind',
    slug: 'sapiens-brief-history-humankind',
    description: 'By Yuval Noah Harari. The multi-million copy bestseller exploring the narrative and biological revolutions that shaped the human species from hunter-gatherers to modern days.',
    price: 19.99,
    stock_qty: 160,
    image_url: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=600'
  },

  // Home & Kitchen (category_id = 4)
  {
    category_id: 4,
    name: 'KitchenAid Artisan 5-Quart Mixer',
    slug: 'kitchenaid-artisan-5quart-mixer',
    description: 'Legendary stand mixer featuring 10 speeds and a durable tilt-head design. Includes a flat beater, dough hook, and wire whip for all your baking creations.',
    price: 449.99,
    stock_qty: 15,
    image_url: 'https://images.unsplash.com/photo-1594385208974-2e75f9d8ab48?w=600'
  },
  {
    category_id: 4,
    name: 'Philips Premium Airfryer XXL',
    slug: 'philips-premium-airfryer-xxl',
    description: 'The only airfryer with fat removal technology that separates and captures excess fat. Generous 3lb capacity feeds up to 6 people easily.',
    price: 199.95,
    stock_qty: 55,
    image_url: 'https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?w=600'
  },
  {
    category_id: 4,
    name: 'Brita Extra Large 18-Cup Dispenser',
    slug: 'brita-extra-large-dispenser',
    description: 'Filtered water dispenser with UltraMax filter. Reduces chlorine taste, odor, lead, and other impurities. Includes an electronic filter replacement indicator.',
    price: 34.99,
    stock_qty: 140,
    image_url: 'https://images.unsplash.com/photo-1603201667141-5a2d4c673378?w=600'
  },
  {
    category_id: 4,
    name: 'Le Creuset Signature Dutch Oven',
    slug: 'le-creuset-signature-dutch-oven',
    description: 'Classic 5.5-quart enameled cast iron round Dutch Oven. Superior heat distribution and retention, ideal for slow-cooking, braising, and baking sourdough.',
    price: 379.95,
    stock_qty: 20,
    image_url: 'https://images.unsplash.com/photo-1590794056226-79ef3a814ec9?w=600'
  },
  {
    category_id: 4,
    name: 'Ring Video Doorbell Plus',
    slug: 'ring-video-doorbell-plus',
    description: 'Head-to-toe HD+ Video doorbell with Package Detection, Color Night Vision, and standard customizable motion alerts to monitor your home front.',
    price: 149.99,
    stock_qty: 70,
    image_url: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=600'
  },
  {
    category_id: 4,
    name: 'iRobot Roomba j7+ Robot Vacuum',
    slug: 'irobot-roomba-j7-vacuum',
    description: 'Smart self-emptying robot vacuum with PrecisionVision Navigation to detect and avoid obstacles like charging cords or pet waste. Clears itself for 60 days.',
    price: 599.00,
    stock_qty: 25,
    image_url: 'https://images.unsplash.com/photo-1576089173322-261546747517?w=600'
  },

  // Sports (category_id = 5)
  {
    category_id: 5,
    name: 'Spalding TF-1000 Basketball',
    slug: 'spalding-tf-1000-basketball',
    description: 'Legacy indoor composite leather basketball. Features advanced moisture management, deep channels, and structural cushioning for outstanding grip.',
    price: 69.99,
    stock_qty: 90,
    image_url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600'
  },
  {
    category_id: 5,
    name: 'Wilson Pro Staff Tennis Racket',
    slug: 'wilson-pro-staff-97',
    description: 'Precision performance tennis racket engineered for intermediate-to-advanced offensive players. Braid 45 carbon fiber construction yields crisp feel.',
    price: 249.00,
    stock_qty: 35,
    image_url: 'https://images.unsplash.com/photo-1622279457486-62dcc4a4b1db?w=600'
  },
  {
    category_id: 5,
    name: 'Fitbit Charge 6 Fitness Tracker',
    slug: 'fitbit-charge-6-tracker',
    description: 'Advanced health tracker with built-in GPS, active zone minutes, 24/7 heart rate tracking, EDA scan, ECG app, stress scores, and 7 days battery.',
    price: 159.95,
    stock_qty: 80,
    image_url: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600'
  },
  {
    category_id: 5,
    name: 'Theragun Prime Deep Tissue Massager',
    slug: 'theragun-prime-massager',
    description: 'Powerful percussive therapy device designed to ease muscle tension, soreness, and speed recovery. Features quiet motor and 5-speed control.',
    price: 299.00,
    stock_qty: 50,
    image_url: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600'
  },
  {
    category_id: 5,
    name: 'Titleist Pro V1 Golf Balls (Dozen)',
    slug: 'titleist-pro-v1-golf-balls',
    description: '#1 ball in golf. Engineered to deliver exceptional distance, outstanding green-side control, extremely soft feel, and long-lasting consistency.',
    price: 54.99,
    stock_qty: 180,
    image_url: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=600'
  },
  {
    category_id: 5,
    name: 'Manduka PRO Premium Yoga Mat',
    slug: 'manduka-pro-yoga-mat',
    description: 'Ultra-dense, cushioned 6mm yoga mat with lifetime guarantee. Superior slip-resistance, closed-cell hygienic surface, and joint-friendly support.',
    price: 129.00,
    stock_qty: 75,
    image_url: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600'
  },

  // Beauty (category_id = 6)
  {
    category_id: 6,
    name: 'La Roche-Posay Anthelios SPF 60',
    slug: 'la-roche-posay-anthelios',
    description: 'Dermatologist tested melted-in sunscreen milk. Provides broad-spectrum SPF 60 protection, water-resistant for 80 minutes, non-greasy texture.',
    price: 26.99,
    stock_qty: 190,
    image_url: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600'
  },
  {
    category_id: 6,
    name: 'Laneige Lip Sleeping Mask Berry',
    slug: 'laneige-lip-sleeping-mask',
    description: 'A leave-on lip mask that delivers intense moisture and antioxidants while you sleep with Berry Mix Complex and nourishing Vitamin C.',
    price: 24.00,
    stock_qty: 220,
    image_url: 'https://images.unsplash.com/photo-1617897903246-719242758050?w=600'
  },
  {
    category_id: 6,
    name: 'Estee Lauder Advanced Night Repair',
    slug: 'estee-lauder-night-repair',
    description: 'Revolutionary deep-penetrating face serum. Reduces the look of multiple signs of aging caused by environmental assaults of modern life.',
    price: 79.00,
    stock_qty: 85,
    image_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600'
  },
  {
    category_id: 6,
    name: 'Olaplex No. 3 Hair Perfector',
    slug: 'olaplex-no-3-hair-perfector',
    description: 'Global best seller. An at-home pre-shampoo treatment that restores damaged and compromised hair by repairing broken disulfide chemical bonds.',
    price: 30.00,
    stock_qty: 145,
    image_url: 'https://images.unsplash.com/photo-1608248597481-496100c8c836?w=600'
  },
  {
    category_id: 6,
    name: "Kiehl's Ultra Facial Cream 1.7oz",
    slug: 'kiehls-ultra-facial-cream',
    description: 'Kiehl\'s #1 facial cream provides 24-hour hydration. Formulated with Glacial Glycoprotein and olive-derived Squalane for smooth, healthy skin.',
    price: 38.00,
    stock_qty: 115,
    image_url: 'https://images.unsplash.com/photo-1608248597481-496100c8c836?w=600'
  },
  {
    category_id: 6,
    name: "Paula's Choice 2% BHA Exfoliant",
    slug: 'paulas-choice-2-bha-exfoliant',
    description: 'Gentle, leave-on liquid exfoliant with salicylic acid. Unclogs and minimizes enlarged pores, sloughs off dead skin, and evens out skin tone.',
    price: 34.00,
    stock_qty: 160,
    image_url: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=600'
  }
];

async function seed() {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'ecommerce_db'
    });

    console.log('Successfully connected to database.');

    // We use INSERT IGNORE or duplicate key skips to prevent errors on repeated runs
    for (const p of newProducts) {
      const [existing] = await conn.query('SELECT id FROM products WHERE slug = ?', [p.slug]);
      if (existing.length === 0) {
        await conn.query(
          `INSERT INTO products (category_id, name, slug, description, price, stock_qty, image_url, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
          [p.category_id, p.name, p.slug, p.description, p.price, p.stock_qty, p.image_url]
        );
        console.log(`Inserted product: "${p.name}"`);
      } else {
        console.log(`Product already exists: "${p.name}" (skipped)`);
      }
    }

    console.log('✅ Seeding completed successfully!');
    await conn.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

seed();
