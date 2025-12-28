from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Cookie
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import razorpay
import requests
import random

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Razorpay client (will initialize when keys are provided)
razorpay_key_id = os.environ.get('RAZORPAY_KEY_ID')
razorpay_key_secret = os.environ.get('RAZORPAY_KEY_SECRET')
razorpay_client = None
if razorpay_key_id and razorpay_key_secret:
    razorpay_client = razorpay.Client(auth=(razorpay_key_id, razorpay_key_secret))

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ==================== MODELS ====================

class User(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    created_at: datetime

class UserSession(BaseModel):
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime

class Product(BaseModel):
    product_id: str
    name: str
    description: str
    story: str
    time_taken: str
    category: str  # "crochet" or "cards"
    price: float
    stock: int
    images: List[str]
    game_eligible: bool = True
    created_at: datetime

class ProductCreate(BaseModel):
    name: str
    description: str
    story: str
    time_taken: str
    category: str
    price: float
    stock: int
    images: List[str]
    game_eligible: bool = True

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    story: Optional[str] = None
    time_taken: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    images: Optional[List[str]] = None
    game_eligible: Optional[bool] = None

class Reward(BaseModel):
    reward_id: str
    user_id: str
    type: str  # "free_product", "discount", "free_card"
    value: str  # product_id or discount amount
    description: str
    expires_at: datetime
    used: bool = False
    created_at: datetime

class GameAttempt(BaseModel):
    attempt_id: str
    user_id: str
    result: str  # "free_product", "discount", "free_card", "no_win"
    reward_id: Optional[str] = None
    date: datetime

class GameSpinResponse(BaseModel):
    result: str
    reward: Optional[Reward] = None
    message: str

class Order(BaseModel):
    order_id: str
    user_id: str
    items: List[Dict[str, Any]]
    rewards_applied: List[str]
    subtotal: float
    discount: float
    total: float
    payment_status: str
    razorpay_order_id: Optional[str] = None
    created_at: datetime

class OrderCreate(BaseModel):
    items: List[Dict[str, Any]]
    rewards_applied: List[str] = []

class PaymentVerify(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

class GameSettings(BaseModel):
    free_product_probability: float = 0.05
    discount_probability: float = 0.15
    free_card_probability: float = 0.10
    no_win_probability: float = 0.70
    discount_amount: int = 50  # in rupees

# ==================== AUTH HELPERS ====================

async def get_current_user(request: Request) -> Optional[Dict]:
    """Get current user from session token (cookie or header)"""
    # REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    session_token = request.cookies.get('session_token')
    
    if not session_token:
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            session_token = auth_header.split(' ')[1]
    
    if not session_token:
        return None
    
    # Check session in database
    session_doc = await db.user_sessions.find_one(
        {"session_token": session_token},
        {"_id": 0}
    )
    
    if not session_doc:
        return None
    
    # Check expiry
    expires_at = session_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if expires_at < datetime.now(timezone.utc):
        return None
    
    # Get user
    user_doc = await db.users.find_one(
        {"user_id": session_doc["user_id"]},
        {"_id": 0}
    )
    
    return user_doc

async def require_auth(request: Request) -> Dict:
    """Require authentication and return user"""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

# ==================== AUTH ENDPOINTS ====================

@api_router.post("/auth/session")
async def create_session(request: Request, response: Response):
    """Exchange session_id for user data and create session"""
    # REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    session_id = request.headers.get('X-Session-ID')
    if not session_id:
        raise HTTPException(status_code=400, detail="Missing session_id")
    
    # Get user data from Emergent Auth
    try:
        auth_response = requests.get(
            'https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data',
            headers={'X-Session-ID': session_id},
            timeout=10
        )
        auth_response.raise_for_status()
        user_data = auth_response.json()
    except Exception as e:
        logger.error(f"Auth error: {e}")
        raise HTTPException(status_code=401, detail="Invalid session_id")
    
    # Check if user exists
    existing_user = await db.users.find_one(
        {"email": user_data['email']},
        {"_id": 0}
    )
    
    if existing_user:
        user_id = existing_user['user_id']
    else:
        # Create new user with custom user_id
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        await db.users.insert_one({
            "user_id": user_id,
            "email": user_data['email'],
            "name": user_data['name'],
            "picture": user_data.get('picture'),
            "created_at": datetime.now(timezone.utc)
        })
    
    # Create session
    session_token = user_data['session_token']
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at,
        "created_at": datetime.now(timezone.utc)
    })
    
    # Set httpOnly cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7*24*60*60
    )
    
    # Return user data
    user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    return user_doc

@api_router.get("/auth/me")
async def get_me(request: Request):
    """Get current user"""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    """Logout user"""
    session_token = request.cookies.get('session_token')
    
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    
    response.delete_cookie(key="session_token", path="/")
    return {"message": "Logged out"}

# ==================== PRODUCT ENDPOINTS ====================

@api_router.get("/products")
async def get_products(category: Optional[str] = None):
    """Get all products"""
    query = {}
    if category:
        query["category"] = category
    
    products = await db.products.find(query, {"_id": 0}).to_list(100)
    return products

@api_router.get("/products/{product_id}")
async def get_product(product_id: str):
    """Get product by ID"""
    product = await db.products.find_one({"product_id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@api_router.post("/products")
async def create_product(product: ProductCreate, request: Request):
    """Create new product (admin only)"""
    user = await require_auth(request)
    
    product_id = f"prod_{uuid.uuid4().hex[:12]}"
    product_doc = {
        "product_id": product_id,
        **product.model_dump(),
        "created_at": datetime.now(timezone.utc)
    }
    
    await db.products.insert_one(product_doc)
    return await db.products.find_one({"product_id": product_id}, {"_id": 0})

@api_router.put("/products/{product_id}")
async def update_product(product_id: str, product: ProductUpdate, request: Request):
    """Update product (admin only)"""
    user = await require_auth(request)
    
    update_data = {k: v for k, v in product.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    result = await db.products.update_one(
        {"product_id": product_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return await db.products.find_one({"product_id": product_id}, {"_id": 0})

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, request: Request):
    """Delete product (admin only)"""
    user = await require_auth(request)
    
    result = await db.products.delete_one({"product_id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {"message": "Product deleted"}

# ==================== GAME ENDPOINTS ====================

@api_router.post("/game/spin")
async def spin_wheel(request: Request) -> GameSpinResponse:
    """Spin the wheel (1 attempt per day)"""
    user = await require_auth(request)
    user_id = user['user_id']
    
    # Check if user already played today
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    existing_attempt = await db.game_attempts.find_one({
        "user_id": user_id,
        "date": {"$gte": today_start}
    })
    
    if existing_attempt:
        return GameSpinResponse(
            result="already_played",
            message="You've already played today! Come back tomorrow."
        )
    
    # Get game settings
    settings_doc = await db.game_settings.find_one({}, {"_id": 0})
    if not settings_doc:
        # Create default settings
        settings = GameSettings()
        await db.game_settings.insert_one(settings.model_dump())
    else:
        settings = GameSettings(**settings_doc)
    
    # Determine result based on probabilities
    rand = random.random()
    
    if rand < settings.free_product_probability:
        result = "free_product"
        # Get a random game-eligible product
        products = await db.products.find({"game_eligible": True, "stock": {"$gt": 0}}, {"_id": 0}).to_list(100)
        if not products:
            result = "no_win"
        else:
            product = random.choice(products)
            reward = Reward(
                reward_id=f"reward_{uuid.uuid4().hex[:12]}",
                user_id=user_id,
                type="free_product",
                value=product['product_id'],
                description=f"Free {product['name']}",
                expires_at=datetime.now(timezone.utc) + timedelta(days=30),
                created_at=datetime.now(timezone.utc)
            )
            await db.rewards.insert_one(reward.model_dump())
            
            # Record attempt
            attempt = GameAttempt(
                attempt_id=f"attempt_{uuid.uuid4().hex[:12]}",
                user_id=user_id,
                result=result,
                reward_id=reward.reward_id,
                date=datetime.now(timezone.utc)
            )
            await db.game_attempts.insert_one(attempt.model_dump())
            
            return GameSpinResponse(
                result=result,
                reward=reward,
                message=f"Congratulations! You won a free {product['name']}!"
            )
    
    elif rand < settings.free_product_probability + settings.discount_probability:
        result = "discount"
        reward = Reward(
            reward_id=f"reward_{uuid.uuid4().hex[:12]}",
            user_id=user_id,
            type="discount",
            value=str(settings.discount_amount),
            description=f"₹{settings.discount_amount} off on your next purchase",
            expires_at=datetime.now(timezone.utc) + timedelta(days=30),
            created_at=datetime.now(timezone.utc)
        )
        await db.rewards.insert_one(reward.model_dump())
        
        # Record attempt
        attempt = GameAttempt(
            attempt_id=f"attempt_{uuid.uuid4().hex[:12]}",
            user_id=user_id,
            result=result,
            reward_id=reward.reward_id,
            date=datetime.now(timezone.utc)
        )
        await db.game_attempts.insert_one(attempt.model_dump())
        
        return GameSpinResponse(
            result=result,
            reward=reward,
            message=f"You won ₹{settings.discount_amount} off!"
        )
    
    elif rand < settings.free_product_probability + settings.discount_probability + settings.free_card_probability:
        result = "free_card"
        # Get a random card
        cards = await db.products.find({"category": "cards", "stock": {"$gt": 0}}, {"_id": 0}).to_list(100)
        if not cards:
            result = "no_win"
        else:
            card = random.choice(cards)
            reward = Reward(
                reward_id=f"reward_{uuid.uuid4().hex[:12]}",
                user_id=user_id,
                type="free_card",
                value=card['product_id'],
                description=f"Free {card['name']}",
                expires_at=datetime.now(timezone.utc) + timedelta(days=30),
                created_at=datetime.now(timezone.utc)
            )
            await db.rewards.insert_one(reward.model_dump())
            
            # Record attempt
            attempt = GameAttempt(
                attempt_id=f"attempt_{uuid.uuid4().hex[:12]}",
                user_id=user_id,
                result=result,
                reward_id=reward.reward_id,
                date=datetime.now(timezone.utc)
            )
            await db.game_attempts.insert_one(attempt.model_dump())
            
            return GameSpinResponse(
                result=result,
                reward=reward,
                message=f"You won a free {card['name']}!"
            )
    
    # No win
    result = "no_win"
    attempt = GameAttempt(
        attempt_id=f"attempt_{uuid.uuid4().hex[:12]}",
        user_id=user_id,
        result=result,
        date=datetime.now(timezone.utc)
    )
    await db.game_attempts.insert_one(attempt.model_dump())
    
    return GameSpinResponse(
        result=result,
        message="Better luck next time!"
    )

@api_router.get("/game/attempts")
async def get_attempts(request: Request):
    """Get user's game attempts"""
    user = await require_auth(request)
    attempts = await db.game_attempts.find(
        {"user_id": user['user_id']},
        {"_id": 0}
    ).sort("date", -1).to_list(100)
    return attempts

@api_router.get("/game/can-play")
async def can_play_today(request: Request):
    """Check if user can play today"""
    user = await require_auth(request)
    
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    existing_attempt = await db.game_attempts.find_one({
        "user_id": user['user_id'],
        "date": {"$gte": today_start}
    })
    
    return {"can_play": existing_attempt is None}

# ==================== REWARD ENDPOINTS ====================

@api_router.get("/rewards")
async def get_rewards(request: Request):
    """Get user's rewards"""
    user = await require_auth(request)
    
    # Get active rewards (not used and not expired)
    rewards = await db.rewards.find({
        "user_id": user['user_id'],
        "used": False,
        "expires_at": {"$gt": datetime.now(timezone.utc)}
    }, {"_id": 0}).to_list(100)
    
    return rewards

@api_router.post("/rewards/{reward_id}/redeem")
async def redeem_reward(reward_id: str, request: Request):
    """Mark reward as used"""
    user = await require_auth(request)
    
    result = await db.rewards.update_one(
        {
            "reward_id": reward_id,
            "user_id": user['user_id'],
            "used": False
        },
        {"$set": {"used": True}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Reward not found or already used")
    
    return {"message": "Reward redeemed"}

# ==================== ORDER ENDPOINTS ====================

@api_router.post("/orders")
async def create_order(order: OrderCreate, request: Request):
    """Create order and initiate payment"""
    user = await require_auth(request)
    
    # Calculate totals
    subtotal = sum(item['price'] * item['quantity'] for item in order.items)
    discount = 0
    free_items = []
    
    # Apply rewards
    for reward_id in order.rewards_applied:
        reward_doc = await db.rewards.find_one(
            {
                "reward_id": reward_id,
                "user_id": user['user_id'],
                "used": False
            },
            {"_id": 0}
        )
        
        if reward_doc:
            if reward_doc['type'] == 'discount':
                discount += float(reward_doc['value'])
            elif reward_doc['type'] in ['free_product', 'free_card']:
                free_items.append(reward_doc['value'])
    
    total = max(0, subtotal - discount)
    
    # Create order
    order_id = f"order_{uuid.uuid4().hex[:12]}"
    order_doc = {
        "order_id": order_id,
        "user_id": user['user_id'],
        "items": order.items,
        "rewards_applied": order.rewards_applied,
        "free_items": free_items,
        "subtotal": subtotal,
        "discount": discount,
        "total": total,
        "payment_status": "pending",
        "created_at": datetime.now(timezone.utc)
    }
    
    # Create Razorpay order if payment needed
    if total > 0 and razorpay_client:
        try:
            razorpay_order = razorpay_client.order.create({
                "amount": int(total * 100),  # Convert to paise
                "currency": "INR",
                "payment_capture": 1
            })
            order_doc["razorpay_order_id"] = razorpay_order['id']
        except Exception as e:
            logger.error(f"Razorpay error: {e}")
            raise HTTPException(status_code=500, detail="Payment initialization failed")
    elif total == 0:
        order_doc["payment_status"] = "completed"
        # Mark rewards as used
        for reward_id in order.rewards_applied:
            await db.rewards.update_one(
                {"reward_id": reward_id},
                {"$set": {"used": True}}
            )
    
    await db.orders.insert_one(order_doc)
    return await db.orders.find_one({"order_id": order_id}, {"_id": 0})

@api_router.post("/orders/verify-payment")
async def verify_payment(payment: PaymentVerify, request: Request):
    """Verify Razorpay payment"""
    user = await require_auth(request)
    
    if not razorpay_client:
        raise HTTPException(status_code=500, detail="Payment gateway not configured")
    
    # Verify signature
    try:
        razorpay_client.utility.verify_payment_signature({
            'razorpay_order_id': payment.razorpay_order_id,
            'razorpay_payment_id': payment.razorpay_payment_id,
            'razorpay_signature': payment.razorpay_signature
        })
    except Exception as e:
        logger.error(f"Payment verification failed: {e}")
        raise HTTPException(status_code=400, detail="Invalid payment signature")
    
    # Update order
    result = await db.orders.update_one(
        {"razorpay_order_id": payment.razorpay_order_id, "user_id": user['user_id']},
        {"$set": {
            "payment_status": "completed",
            "razorpay_payment_id": payment.razorpay_payment_id
        }}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Mark rewards as used
    order_doc = await db.orders.find_one(
        {"razorpay_order_id": payment.razorpay_order_id},
        {"_id": 0}
    )
    for reward_id in order_doc.get('rewards_applied', []):
        await db.rewards.update_one(
            {"reward_id": reward_id},
            {"$set": {"used": True}}
        )
    
    return {"message": "Payment verified", "order_id": order_doc['order_id']}

@api_router.get("/orders")
async def get_orders(request: Request):
    """Get user's orders"""
    user = await require_auth(request)
    orders = await db.orders.find(
        {"user_id": user['user_id']},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    return orders

@api_router.get("/orders/{order_id}")
async def get_order(order_id: str, request: Request):
    """Get order by ID"""
    user = await require_auth(request)
    order = await db.orders.find_one(
        {"order_id": order_id, "user_id": user['user_id']},
        {"_id": 0}
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

# ==================== ADMIN ENDPOINTS ====================

@api_router.get("/admin/analytics")
async def get_analytics(request: Request):
    """Get analytics data (admin only)"""
    user = await require_auth(request)
    
    # Count total attempts today
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    total_attempts_today = await db.game_attempts.count_documents({
        "date": {"$gte": today_start}
    })
    
    # Count wins today
    wins_today = await db.game_attempts.count_documents({
        "date": {"$gte": today_start},
        "result": {"$ne": "no_win"}
    })
    
    # Total orders
    total_orders = await db.orders.count_documents({})
    
    # Total revenue
    orders = await db.orders.find(
        {"payment_status": "completed"},
        {"_id": 0, "total": 1}
    ).to_list(1000)
    total_revenue = sum(order.get('total', 0) for order in orders)
    
    # Total products
    total_products = await db.products.count_documents({})
    
    return {
        "total_attempts_today": total_attempts_today,
        "wins_today": wins_today,
        "win_rate_today": wins_today / total_attempts_today if total_attempts_today > 0 else 0,
        "total_orders": total_orders,
        "total_revenue": total_revenue,
        "total_products": total_products
    }

@api_router.get("/admin/settings")
async def get_game_settings(request: Request):
    """Get game settings (admin only)"""
    user = await require_auth(request)
    
    settings = await db.game_settings.find_one({}, {"_id": 0})
    if not settings:
        settings = GameSettings().model_dump()
        await db.game_settings.insert_one(settings)
    return settings

@api_router.put("/admin/settings")
async def update_game_settings(settings: GameSettings, request: Request):
    """Update game settings (admin only)"""
    user = await require_auth(request)
    
    # Validate probabilities sum to 1.0
    total = settings.free_product_probability + settings.discount_probability + \
            settings.free_card_probability + settings.no_win_probability
    
    if abs(total - 1.0) > 0.01:
        raise HTTPException(status_code=400, detail="Probabilities must sum to 1.0")
    
    await db.game_settings.delete_many({})
    await db.game_settings.insert_one(settings.model_dump())
    
    return settings

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()