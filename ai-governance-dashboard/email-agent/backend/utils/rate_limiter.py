"""
Rate limiting utility using Redis
"""
from datetime import datetime, timedelta
from typing import Tuple
from utils.redis_client import get_redis_client
from utils.config import settings
from utils.logging_config import get_logger

logger = get_logger(__name__)


class RateLimiter:
    """Rate limiter using Redis counters."""
    
    def __init__(self):
        self.redis = get_redis_client()
        self.limit_per_minute = settings.RATE_LIMIT_PER_MINUTE
        self.burst_limit = settings.RATE_LIMIT_BURST
    
    async def check_rate_limit(self, user_id: str) -> Tuple[bool, int, int]:
        """
        Check if user has exceeded rate limit.
        
        Args:
            user_id: User identifier
            
        Returns:
            Tuple of (is_allowed, remaining_requests, reset_time_seconds)
        """
        try:
            # Get current minute window
            now = datetime.utcnow()
            minute_key = f"rate_limit:{user_id}:{now.strftime('%Y%m%d%H%M')}"
            
            # Get current count
            current_count = await self.redis.get(minute_key)
            current_count = int(current_count) if current_count else 0
            
            # Check if limit exceeded
            if current_count >= self.limit_per_minute:
                # Calculate seconds until next minute
                next_minute = (now + timedelta(minutes=1)).replace(second=0, microsecond=0)
                reset_seconds = int((next_minute - now).total_seconds())
                
                logger.warning(
                    f"Rate limit exceeded for user {user_id}: "
                    f"{current_count}/{self.limit_per_minute}"
                )
                return False, 0, reset_seconds
            
            # Increment counter
            pipe = self.redis.pipeline()
            pipe.incr(minute_key)
            pipe.expire(minute_key, 60)  # Expire after 1 minute
            await pipe.execute()
            
            remaining = self.limit_per_minute - current_count - 1
            return True, remaining, 60
            
        except Exception as e:
            logger.error(f"Rate limit check error for user {user_id}: {e}")
            # On error, allow the request (fail open)
            return True, self.limit_per_minute, 60
    
    async def reset_rate_limit(self, user_id: str) -> bool:
        """
        Reset rate limit for user (admin function).
        
        Args:
            user_id: User identifier
            
        Returns:
            True if successful, False otherwise
        """
        try:
            now = datetime.utcnow()
            minute_key = f"rate_limit:{user_id}:{now.strftime('%Y%m%d%H%M')}"
            await self.redis.delete(minute_key)
            logger.info(f"Rate limit reset for user {user_id}")
            return True
        except Exception as e:
            logger.error(f"Rate limit reset error for user {user_id}: {e}")
            return False
    
    async def get_current_usage(self, user_id: str) -> int:
        """
        Get current request count for user in current minute.
        
        Args:
            user_id: User identifier
            
        Returns:
            Current request count
        """
        try:
            now = datetime.utcnow()
            minute_key = f"rate_limit:{user_id}:{now.strftime('%Y%m%d%H%M')}"
            current_count = await self.redis.get(minute_key)
            return int(current_count) if current_count else 0
        except Exception as e:
            logger.error(f"Get current usage error for user {user_id}: {e}")
            return 0


# Global rate limiter instance
rate_limiter = RateLimiter()
