"""Database dependency injection — asyncpg connection pool."""
import asyncpg
from config import DATABASE_URL

pool: asyncpg.Pool | None = None


def _raw_dsn() -> str:
    """Strip SQLAlchemy dialect prefix so asyncpg gets a plain postgres:// DSN."""
    dsn = DATABASE_URL
    for prefix in ("postgresql+asyncpg://", "postgres+asyncpg://"):
        if dsn.startswith(prefix):
            return "postgresql://" + dsn[len(prefix):]
    return dsn


async def init_pool() -> None:
    global pool
    pool = await asyncpg.create_pool(_raw_dsn(), min_size=2, max_size=10)


async def close_pool() -> None:
    global pool
    if pool:
        await pool.close()
        pool = None


async def get_db() -> asyncpg.Pool:
    """FastAPI dependency — yields the connection pool."""
    assert pool is not None, "DB pool not initialized"
    return pool
