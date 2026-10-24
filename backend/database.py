import os
import pymongo
from pymongo import MongoClient
from pymongo.database import Database
from typing import Optional, Dict, Any, List
from bson import ObjectId
import dotenv

try:
    import certifi
    CA_FILE = certifi.where()
except Exception:
    CA_FILE = None

# Load environment configuration
_curr_dir = os.path.dirname(os.path.abspath(__file__))
dotenv.load_dotenv(os.path.join(_curr_dir, ".env"))
dotenv.load_dotenv(os.path.join(_curr_dir, "..", ".env"))
dotenv.load_dotenv()

MONGODB_URL = os.environ.get(
    "MONGODB_URL",
    "mongodb+srv://kasiram5473_db_user:fYFogOohovmKvoo7@cluster0.xjmr7ob.mongodb.net/"
)

def create_mongo_client() -> MongoClient:
    """Creates a resilient MongoDB client with TLS certificate authority and timeout handling."""
    kwargs: Dict[str, Any] = {
        "serverSelectionTimeoutMS": 10000,
        "connectTimeoutMS": 10000,
        "socketTimeoutMS": 20000,
        "retryWrites": True,
    }
    if CA_FILE:
        kwargs["tlsCAFile"] = CA_FILE

    # If explicitly requested, allow relaxed TLS certificate checks
    if os.environ.get("MONGODB_TLS_ALLOW_INVALID", "false").lower() in ("true", "1", "yes"):
        kwargs["tlsAllowInvalidCertificates"] = True

    try:
        return MongoClient(MONGODB_URL, **kwargs)
    except Exception as e:
        print(f"[DATABASE WARNING] Initial MongoClient initialization notice: {e}")
        return MongoClient(MONGODB_URL, serverSelectionTimeoutMS=10000)

# Connect to MongoDB Atlas cluster
client: MongoClient = create_mongo_client()

DB_NAME = "aicte_fdr_db"
db: Database = client[DB_NAME]

# Explicit collection references
institutions_col = db["institutions"]
fdr_instruments_col = db["fdr_instruments"]
audit_logs_col = db["audit_logs"]
release_requests_col = db["release_requests"]

def get_db() -> Database:
    """
    FastAPI dependency yielding the MongoDB database instance.
    Endpoints access collections via db.institutions, db.fdr_instruments, db.audit_logs, db.release_requests.
    """
    return db

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
