"""
database.py — MongoDB Connection using Motor (async driver)

WHY Motor instead of PyMongo?
- FastAPI is async (non-blocking). If we used PyMongo (synchronous),
  every database call would block the entire server.
- Motor is the async version of PyMongo. It lets FastAPI handle
  many requests simultaneously without waiting for DB responses.

HOW IT WORKS:
1. We create ONE client connection when the app starts
2. We reuse that connection for all requests (connection pooling)
3. We close it cleanly when the app shuts down
"""

from motor.motor_asyncio import AsyncIOMotorClient
from config import settings

# These will be set when connect_db() is called at app startup
client: AsyncIOMotorClient = None
db = None


async def connect_db():
    """
    Connect to MongoDB Atlas.
    Called once when FastAPI starts up.
    """
    global client, db

    # Create the async MongoDB client
    client = AsyncIOMotorClient(settings.MONGODB_URI)

    # Select our database (last part of the URI or default name)
    db = client.voiceagent

    # Verify the connection works by pinging the server
    try:
        await client.admin.command("ping")
        print("✅ Connected to MongoDB Atlas successfully!")
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB: {e}")
        raise e


async def close_db():
    """
    Close the MongoDB connection.
    Called when FastAPI shuts down.
    """
    global client
    if client:
        client.close()
        print("🔌 MongoDB connection closed.")


def get_db():
    """
    Get the database instance.
    Used by routers/services to access collections.
    """
    return db
