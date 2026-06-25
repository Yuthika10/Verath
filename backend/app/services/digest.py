import logging
from datetime import datetime
from typing import Any, Dict, Optional

from motor.motor_asyncio import AsyncIOMotorClient

from app.config import settings
from app.services.summarizer import generate_period_summary

logger = logging.getLogger(__name__)

_mongo = AsyncIOMotorClient(settings.mongo_uri)
_db = _mongo[settings.database_name]
_digests_col = _db["digests"]
_users_col = _db["users"]

# Default digest window: one week
DEFAULT_WINDOW_HOURS = 168


async def generate_and_store_digest(
    user_id: str, window_hours: int = DEFAULT_WINDOW_HOURS
) -> Dict[str, Any]:
    """Generate a period summary for one user and persist it to the digests collection."""
    summary = await generate_period_summary(user_id, hours=window_hours)
    doc = {
        "user_id": user_id,
        "generated_at": datetime.utcnow(),
        "window_hours": window_hours,
        "summary": summary,
    }
    await _digests_col.insert_one(doc)
    logger.info(f"Stored digest for user {user_id} (window {window_hours}h)")
    return doc


async def get_latest_digest(user_id: str) -> Optional[Dict[str, Any]]:
    """Return the most recently generated digest for a user, or None."""
    return await _digests_col.find_one(
        {"user_id": user_id}, sort=[("generated_at", -1)]
    )


async def run_weekly_digests() -> int:
    """Scheduler job: generate and store a digest for every user.

    Returns the number of digests created.
    """
    count = 0
    cursor = _users_col.find({}, {"_id": 1})
    async for user in cursor:
        try:
            await generate_and_store_digest(str(user["_id"]))
            count += 1
        except Exception as e:
            logger.error(
                f"Failed to generate digest for user {user.get('_id')}: {e}",
                exc_info=True,
            )
    logger.info(f"Weekly digest job complete: {count} digests generated")
    return count