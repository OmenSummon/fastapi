import sys
sys.path.append('/app/backend')

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
import uuid
import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment
ROOT_DIR = Path('/app/backend')
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

async def seed_products():
    # Clear existing products
    await db.products.delete_many({})
    
    products = [
        {
            "product_id": f"prod_{uuid.uuid4().hex[:12]}",
            "name": "Cozy Crochet Bear",
            "description": "Adorable handmade crochet bear perfect for children or as a decorative piece. Made with soft yarn.",
            "story": "This little bear was inspired by childhood memories. Each stitch was made with love, taking me back to cozy winter evenings.",
            "time_taken": "8-10 hours",
            "category": "crochet",
            "price": 450,
            "stock": 5,
            "images": [
                "https://images.unsplash.com/photo-1757583012114-0a48ae0a6e3c?crop=entropy&cs=srgb&fm=jpg&q=85",
                "https://images.unsplash.com/photo-1603321581635-d46915755425?crop=entropy&cs=srgb&fm=jpg&q=85"
            ],
            "game_eligible": True,
            "created_at": datetime.now(timezone.utc)
        },
        {
            "product_id": f"prod_{uuid.uuid4().hex[:12]}",
            "name": "Flower Bouquet Crochet",
            "description": "Beautiful handmade crochet flowers that never wilt. Perfect for home decoration or as a gift.",
            "story": "Inspired by spring gardens, these flowers bloom eternally. Each petal is carefully crafted to capture nature's beauty.",
            "time_taken": "6-8 hours",
            "category": "crochet",
            "price": 380,
            "stock": 8,
            "images": [
                "https://images.unsplash.com/photo-1728393287642-13bee7126ae8?crop=entropy&cs=srgb&fm=jpg&q=85"
            ],
            "game_eligible": True,
            "created_at": datetime.now(timezone.utc)
        },
        {
            "product_id": f"prod_{uuid.uuid4().hex[:12]}",
            "name": "Crochet Keychain Set",
            "description": "Set of 3 colorful crochet keychains. Unique designs including heart, star, and flower.",
            "story": "Small treasures that carry big meaning. Perfect for personalizing your keys or bag with handmade charm.",
            "time_taken": "2-3 hours",
            "category": "crochet",
            "price": 150,
            "stock": 15,
            "images": [
                "https://images.unsplash.com/photo-1603321581635-d46915755425?crop=entropy&cs=srgb&fm=jpg&q=85"
            ],
            "game_eligible": True,
            "created_at": datetime.now(timezone.utc)
        },
        {
            "product_id": f"prod_{uuid.uuid4().hex[:12]}",
            "name": "Vintage Crochet Placemat",
            "description": "Elegant vintage-style crochet placemat for your dining table. Adds warmth to any meal.",
            "story": "Inspired by grandmother's table settings, each placemat brings nostalgia and elegance to modern dining.",
            "time_taken": "4-5 hours",
            "category": "crochet",
            "price": 280,
            "stock": 6,
            "images": [
                "https://images.unsplash.com/photo-1757583012114-0a48ae0a6e3c?crop=entropy&cs=srgb&fm=jpg&q=85"
            ],
            "game_eligible": True,
            "created_at": datetime.now(timezone.utc)
        },
        {
            "product_id": f"prod_{uuid.uuid4().hex[:12]}",
            "name": "Birthday Celebration Card",
            "description": "Handmade birthday card with intricate paper work and heartfelt design. Blank inside for your message.",
            "story": "Every birthday deserves a special card. This design celebrates joy and new beginnings with vibrant colors.",
            "time_taken": "1-2 hours",
            "category": "cards",
            "price": 120,
            "stock": 20,
            "images": [
                "https://images.unsplash.com/photo-1758402750917-52aead675b72?crop=entropy&cs=srgb&fm=jpg&q=85"
            ],
            "game_eligible": True,
            "created_at": datetime.now(timezone.utc)
        },
        {
            "product_id": f"prod_{uuid.uuid4().hex[:12]}",
            "name": "Love & Romance Card",
            "description": "Romantic handmade card perfect for anniversaries, Valentine's Day, or expressing love any day.",
            "story": "Love deserves to be celebrated every day. This card captures the essence of romance with delicate details.",
            "time_taken": "1-2 hours",
            "category": "cards",
            "price": 130,
            "stock": 18,
            "images": [
                "https://images.unsplash.com/photo-1764385827204-95e931324847?crop=entropy&cs=srgb&fm=jpg&q=85"
            ],
            "game_eligible": True,
            "created_at": datetime.now(timezone.utc)
        },
        {
            "product_id": f"prod_{uuid.uuid4().hex[:12]}",
            "name": "Thank You Floral Card",
            "description": "Beautiful thank you card with hand-drawn floral patterns. Express gratitude in style.",
            "story": "Gratitude is best expressed with beauty. Each flower on this card represents appreciation and kindness.",
            "time_taken": "1 hour",
            "category": "cards",
            "price": 100,
            "stock": 25,
            "images": [
                "https://images.unsplash.com/photo-1758402750917-52aead675b72?crop=entropy&cs=srgb&fm=jpg&q=85"
            ],
            "game_eligible": True,
            "created_at": datetime.now(timezone.utc)
        },
        {
            "product_id": f"prod_{uuid.uuid4().hex[:12]}",
            "name": "Custom Message Card",
            "description": "Personalized handmade card for any occasion. Simple, elegant, and heartfelt.",
            "story": "Sometimes the simplest designs carry the deepest meanings. A blank canvas for your heartfelt words.",
            "time_taken": "45 minutes",
            "category": "cards",
            "price": 80,
            "stock": 30,
            "images": [
                "https://images.unsplash.com/photo-1764385827204-95e931324847?crop=entropy&cs=srgb&fm=jpg&q=85"
            ],
            "game_eligible": True,
            "created_at": datetime.now(timezone.utc)
        }
    ]
    
    await db.products.insert_many(products)
    print(f"✓ Seeded {len(products)} products")
    
    # Create default game settings
    await db.game_settings.delete_many({})
    settings = {
        "free_product_probability": 0.05,
        "discount_probability": 0.15,
        "free_card_probability": 0.10,
        "no_win_probability": 0.70,
        "discount_amount": 50
    }
    await db.game_settings.insert_one(settings)
    print("✓ Created default game settings")

async def main():
    await seed_products()
    print("\n✅ Database seeded successfully!")

if __name__ == "__main__":
    asyncio.run(main())
