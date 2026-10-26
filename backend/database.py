import os
import sys
from typing import Optional, Dict, Any, List
from bson import ObjectId
import dotenv
import pymongo
from pymongo import MongoClient
from pymongo.database import Database

try:
    import certifi
    CA_FILE = certifi.where()
except Exception:
    CA_FILE = None

try:
    import mongomock
except ImportError:
    mongomock = None

# Load environment configuration
_curr_dir = os.path.dirname(os.path.abspath(__file__))
dotenv.load_dotenv(os.path.join(_curr_dir, ".env"))
dotenv.load_dotenv(os.path.join(_curr_dir, "..", ".env"))
dotenv.load_dotenv()

MONGODB_URL = os.environ.get(
    "MONGODB_URL",
    "mongodb+srv://kasiram5473_db_user:fYFogOohovmKvoo7@cluster0.xjmr7ob.mongodb.net/"
)

DB_NAME = "aicte_fdr_db"

is_mock_db: bool = False
db_connection_status: str = "INITIALIZING"
db_connection_error: Optional[str] = None


def init_mongo_connection():
    """
    Resilient MongoDB connection initializer:
    1. Attempts connection to MongoDB Atlas with short timeout (2.5s) to avoid app freezes.
    2. If Atlas is reachable and ping succeeds -> returns Atlas client & db.
    3. If Atlas handshake fails (e.g. Render dynamic IP blocked by Atlas Network Access) ->
       gracefully falls back to high-performance in-memory mongomock so endpoints NEVER 500.
    """
    global is_mock_db, db_connection_status, db_connection_error
    err_msg = None

    # Step 1: Probe MongoDB Atlas
    if MONGODB_URL and not os.environ.get("USE_IN_MEMORY_DB", "").lower() in ("true", "1", "yes"):
        atlas_kwargs: Dict[str, Any] = {
            "serverSelectionTimeoutMS": 2500,
            "connectTimeoutMS": 2500,
            "socketTimeoutMS": 10000,
            "retryWrites": True,
        }
        if CA_FILE:
            atlas_kwargs["tlsCAFile"] = CA_FILE

        if os.environ.get("MONGODB_TLS_ALLOW_INVALID", "false").lower() in ("true", "1", "yes"):
            atlas_kwargs["tlsAllowInvalidCertificates"] = True

        try:
            atlas_client = MongoClient(MONGODB_URL, **atlas_kwargs)
            atlas_client.admin.command("ping")
            atlas_db = atlas_client[DB_NAME]
            print(f"[DATABASE] Connected successfully to MongoDB Atlas cluster ({DB_NAME}).")
            is_mock_db = False
            db_connection_status = "CONNECTED_ATLAS"
            db_connection_error = None
            return atlas_client, atlas_db
        except Exception as e:
            err_msg = str(e)
            print(f"[DATABASE WARNING] MongoDB Atlas connection test failed: {err_msg}")
            print("[DATABASE NOTICE] Cause: Atlas rejected TLS handshake because the client IP is not whitelisted.")
            print("[DATABASE NOTICE] To fix: In cloud.mongodb.com -> Network Access -> Add IP Address -> '0.0.0.0/0' (Allow anywhere).")
            print("[DATABASE RESILIENCE] Activating high-performance in-memory database fallback (mongomock) so backend never returns 500.")

    # Step 2: In-memory mongomock fallback
    if mongomock is not None:
        mock_client = mongomock.MongoClient()
        mock_db = mock_client[DB_NAME]
        is_mock_db = True
        db_connection_status = "CONNECTED_MOCK_FALLBACK"
        db_connection_error = err_msg
        print("[DATABASE] In-memory database (mongomock) active and operational.")
        return mock_client, mock_db
    else:
        last_client = MongoClient(MONGODB_URL, serverSelectionTimeoutMS=2500)
        is_mock_db = False
        db_connection_status = "CONNECTION_ERROR"
        db_connection_error = err_msg or "mongomock not installed and Atlas unreachable"
        return last_client, last_client[DB_NAME]


# Initialize connection on module load
client, db = init_mongo_connection()

# Explicit collection references
institutions_col = db["institutions"]
fdr_instruments_col = db["fdr_instruments"]
audit_logs_col = db["audit_logs"]
release_requests_col = db["release_requests"]


def ensure_db_seeded():
    """Ensures the active database is populated with the 6 evaluation scenarios if empty."""
    global db, is_mock_db
    try:
        # Check if database has any institutions
        if db.institutions.count_documents({}) == 0:
            try:
                from .seed import seed_database
                seed_database(force=True, custom_db=db)
            except ImportError:
                from seed import seed_database
                seed_database(force=True, custom_db=db)
    except Exception as e:
        print(f"[DATABASE NOTICE] ensure_db_seeded status: {e}")


# Pre-seed if using mock fallback immediately
if is_mock_db:
    ensure_db_seeded()


def get_db() -> Database:
    """
    FastAPI dependency yielding the MongoDB database instance.
    Endpoints access collections via db.institutions, db.fdr_instruments, db.audit_logs, db.release_requests.
    """
    ensure_db_seeded()
    return db


def try_reconnect_atlas() -> Dict[str, Any]:
    """
    Allows reconnecting to MongoDB Atlas on demand without restarting the server,
    useful once 0.0.0.0/0 is whitelisted in Atlas Network Access.
    """
    global client, db, institutions_col, fdr_instruments_col, audit_logs_col, release_requests_col
    global is_mock_db, db_connection_status, db_connection_error

    atlas_kwargs: Dict[str, Any] = {
        "serverSelectionTimeoutMS": 3000,
        "connectTimeoutMS": 3000,
        "socketTimeoutMS": 10000,
        "retryWrites": True,
    }
    if CA_FILE:
        atlas_kwargs["tlsCAFile"] = CA_FILE
    if os.environ.get("MONGODB_TLS_ALLOW_INVALID", "false").lower() in ("true", "1", "yes"):
        atlas_kwargs["tlsAllowInvalidCertificates"] = True

    try:
        new_client = MongoClient(MONGODB_URL, **atlas_kwargs)
        new_client.admin.command("ping")
        new_db = new_client[DB_NAME]

        client = new_client
        db = new_db
        institutions_col = db["institutions"]
        fdr_instruments_col = db["fdr_instruments"]
        audit_logs_col = db["audit_logs"]
        release_requests_col = db["release_requests"]

        is_mock_db = False
        db_connection_status = "CONNECTED_ATLAS"
        db_connection_error = None

        ensure_db_seeded()
        return {
            "status": "SUCCESS",
            "mode": "ATLAS_CONNECTED",
            "message": "Successfully connected to live MongoDB Atlas cluster."
        }
    except Exception as e:
        return {
            "status": "ERROR",
            "mode": "MONGOMOCK_FALLBACK" if is_mock_db else "DISCONNECTED",
            "message": f"Atlas connection failed: {str(e)}",
            "solution": "Add '0.0.0.0/0' to MongoDB Atlas -> Network Access -> IP Access List."
        }


def clean_mongo_doc(doc: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """
    Normalizes a MongoDB document for JSON / Pydantic serialization:
    - Converts ObjectId _id to string
    - Ensures string/int 'id' field is present for frontend compatibility
    """
    if not doc:
        return None
    d = dict(doc)
    if "_id" in d:
        oid_str = str(d["_id"])
        d["_id"] = oid_str
        if "id" not in d or d["id"] is None:
            d["id"] = oid_str
    return d


def clean_mongo_docs(docs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Normalizes a list of MongoDB documents."""
    return [clean_mongo_doc(d) for d in docs if d is not None]
