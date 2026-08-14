"""
seed.py — Database Seeder

Run this script ONCE to populate your MongoDB with test data:
  python seed.py

It creates:
- 2 companies (Sunrise Realty + Urban Nest Apartments)
- 6 customers (3 per company)

⚠️ IMPORTANT: Replace phone numbers with REAL numbers you can answer!
Otherwise you won't be able to test the AI voice calls.

The script clears existing data first, so you can re-run it safely.
"""

import asyncio
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from config import settings


async def seed_database():
    """Populate the database with test companies and customers."""

    # Connect to MongoDB
    client = AsyncIOMotorClient(settings.MONGODB_URI)
    db = client.voiceagent

    print("🌱 Seeding database...")

    # Clear existing data (safe to re-run)
    await db.companies.delete_many({})
    await db.customers.delete_many({})
    await db.call_logs.delete_many({})
    print("   🗑️  Cleared existing data")

    now = datetime.now(timezone.utc)

    # ===== COMPANY 1: Sunrise Realty =====
    company1_result = await db.companies.insert_one({
        "name": "Sunrise Realty",
        "prompt": (
            "You are Priya, a professional real estate agent calling on behalf of Sunrise Realty. "
            "Sunrise Realty specializes in luxury homes and apartments in Mumbai, India. "
            "Your goal is to qualify this lead in under 2 minutes. "
            "Follow this exact script:\n\n"
            "Step 1 - Greeting: Say hello and introduce yourself as Priya from Sunrise Realty.\n"
            "Step 2 - Purpose: Tell them you are calling to check if they are looking to buy or invest in a property in Mumbai.\n"
            "Step 3 - Qualify: Ask them directly: Are you currently looking to buy a home or an apartment?\n"
            "Step 4 - If YES: Ask (a) What is your approximate budget? (b) Which area in Mumbai do you prefer, for example Bandra, Andheri, or Powai?\n"
            "Step 5 - If NO: Say thank you for their time, wish them a good day, and end the call politely.\n\n"
            "IMPORTANT RULES:\n"
            "- Speak in simple, clear English. Do NOT ask about insurance, health, or appointments.\n"
            "- This is ONLY about buying real estate property in Mumbai.\n"
            "- Ask ONE question at a time. Wait for the answer before asking the next question.\n"
            "- NEVER say numbers as digits. Always say them as words. For example, say 'fifty lakhs' not '5000000', say 'one crore' not '10000000'.\n"
            "- Do NOT mention square feet or any technical measurements.\n"
            "- Keep the total call under 2 minutes."
        ),
        "created_at": now
    })
    company1_id = company1_result.inserted_id
    print(f"   🏢 Created Sunrise Realty (ID: {company1_id})")

    # ===== COMPANY 2: Urban Nest Apartments =====
    company2_result = await db.companies.insert_one({
        "name": "Urban Nest Apartments",
        "prompt": (
            "You are Arjun, a friendly rental agent calling on behalf of Urban Nest Apartments. "
            "Urban Nest Apartments provides modern, affordable rental flats in Bangalore, India. "
            "Your goal is to qualify this lead in under 2 minutes. "
            "Follow this exact script:\n\n"
            "Step 1 - Greeting: Say hello and introduce yourself as Arjun from Urban Nest Apartments.\n"
            "Step 2 - Purpose: Tell them you are calling to check if they are looking for a rental apartment in Bangalore.\n"
            "Step 3 - Qualify: Ask them directly: Are you currently looking to rent a flat or apartment?\n"
            "Step 4 - If YES: Ask (a) What is your monthly rent budget? (b) Which area in Bangalore do you prefer, for example HSR Layout, Koramangala, or Whitefield?\n"
            "Step 5 - If NO: Say thank you for their time, wish them a good day, and end the call politely.\n\n"
            "IMPORTANT RULES:\n"
            "- Speak in simple, clear English. Do NOT ask about insurance, health, or appointments.\n"
            "- This is ONLY about renting an apartment in Bangalore.\n"
            "- Ask ONE question at a time. Wait for the answer before asking the next question.\n"
            "- NEVER say numbers as digits. Always say them as words. For example say 'twenty thousand rupees' not '20000'.\n"
            "- Do NOT mention square feet or any technical measurements.\n"
            "- Keep the total call under 2 minutes."
        ),
        "created_at": now
    })
    company2_id = company2_result.inserted_id
    print(f"   🏢 Created Urban Nest Apartments (ID: {company2_id})")

    # ===== CUSTOMERS FOR COMPANY 1 =====
    # ⚠️ REPLACE THESE PHONE NUMBERS WITH REAL ONES FOR TESTING!
    customers_company1 = [
        {"name": "Alex Johnson",   "phone": "+15550199001"},
        {"name": "Priya Mehta",    "phone": "+15550199002"},
        {"name": "Rahul Sharma",   "phone": "+15550199003"},
    ]

    for c in customers_company1:
        await db.customers.insert_one({
            "company_id": company1_id,
            "name": c["name"],
            "phone": c["phone"],
            "status": "PENDING",
            "created_at": now,
            "updated_at": now
        })
        print(f"   👤 Created {c['name']} for Sunrise Realty")

    # ===== CUSTOMERS FOR COMPANY 2 =====
    customers_company2 = [
        {"name": "Sneha Iyer",     "phone": "+15550199004"},
        {"name": "Karan Patel",    "phone": "+15550199005"},
        {"name": "Divya Nair",     "phone": "+15550199006"},
    ]

    for c in customers_company2:
        await db.customers.insert_one({
            "company_id": company2_id,
            "name": c["name"],
            "phone": c["phone"],
            "status": "PENDING",
            "created_at": now,
            "updated_at": now
        })
        print(f"   👤 Created {c['name']} for Urban Nest Apartments")

    print("\n✅ Seeding complete! 2 companies, 6 customers created.")
    print("\n⚠️  REMINDER: Update phone numbers in seed.py with REAL numbers before testing!")

    client.close()


if __name__ == "__main__":
    asyncio.run(seed_database())
