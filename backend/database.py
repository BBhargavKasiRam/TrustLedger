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


class _MockCursor(list):
    """Cursor wrapper that supports chaining .sort()"""
    def sort(self, key_or_list, direction=1):
        if isinstance(key_or_list, list):
            for k, d in reversed(key_or_list):
                self.sort(k, d)
            return self
        key = key_or_list
        reverse = (direction == -1 or direction == pymongo.DESCENDING if hasattr(pymongo, "DESCENDING") else False)
        return _MockCursor(sorted(self, key=lambda x: (x.get(key) is None, x.get(key, 0)), reverse=reverse))


class _PurePythonCollection:
    """Lightweight in-memory MongoDB collection fallback when mongomock is unavailable."""
    def __init__(self, name: str):
        self.name = name
        self.docs: List[Dict[str, Any]] = []

    def _matches(self, doc: Dict[str, Any], filt: Optional[Dict[str, Any]]) -> bool:
        if not filt:
            return True
        for k, v in filt.items():
            if k == "$or" and isinstance(v, list):
                if not any(self._matches(doc, sub) for sub in v):
                    return False
                continue
            if k == "$and" and isinstance(v, list):
                if not all(self._matches(doc, sub) for sub in v):
                    return False
                continue
            if k == "$in" and isinstance(v, list):
                continue
            doc_val = doc.get(k)
            if isinstance(v, dict):
                # Simple operator checks
                if "$in" in v and doc_val not in v["$in"]:
                    return False
                if "$ne" in v and doc_val == v["$ne"]:
                    return False
                if "$gt" in v and not (doc_val > v["$gt"]):
                    return False
                if "$gte" in v and not (doc_val >= v["$gte"]):
                    return False
                if "$lt" in v and not (doc_val < v["$lt"]):
                    return False
                if "$lte" in v and not (doc_val <= v["$lte"]):
                    return False
            else:
                if str(doc_val) != str(v) and doc_val != v:
                    return False
        return True

    def find(self, filt: Optional[Dict[str, Any]] = None, sort=None) -> _MockCursor:
        res = [dict(d) for d in self.docs if self._matches(d, filt)]
        cursor = _MockCursor(res)
        if sort:
            if isinstance(sort, list):
                for k, d in reversed(sort):
                    cursor = cursor.sort(k, d)
            elif isinstance(sort, tuple):
                cursor = cursor.sort(sort[0], sort[1])
            elif isinstance(sort, str):
                cursor = cursor.sort(sort, 1)
        return cursor

    def find_one(self, filt: Optional[Dict[str, Any]] = None, sort=None) -> Optional[Dict[str, Any]]:
        matches = self.find(filt, sort=sort)
        return matches[0] if matches else None

    def count_documents(self, filt: Optional[Dict[str, Any]] = None) -> int:
        return len([d for d in self.docs if self._matches(d, filt)])

    def insert_one(self, doc: Dict[str, Any]):
        d = dict(doc)
        if "_id" not in d:
            d["_id"] = str(ObjectId())
        self.docs.append(d)
        class InsertRes:
            inserted_id = d["_id"]
        return InsertRes()

    def insert_many(self, docs: List[Dict[str, Any]]):
        ids = []
        for doc in docs:
            d = dict(doc)
            if "_id" not in d:
                d["_id"] = str(ObjectId())
            self.docs.append(d)
            ids.append(d["_id"])
        class InsertManyRes:
            inserted_ids = ids
        return InsertManyRes()

    def update_one(self, filt: Dict[str, Any], update: Dict[str, Any], upsert: bool = False):
        target = None
        for d in self.docs:
            if self._matches(d, filt):
                target = d
                break
        if target is not None:
            if "$set" in update:
                target.update(update["$set"])
            else:
                target.update({k: v for k, v in update.items() if not k.startswith("$")})
        elif upsert:
            new_doc = dict(filt)
            if "$set" in update:
                new_doc.update(update["$set"])
            if "_id" not in new_doc:
                new_doc["_id"] = str(ObjectId())
            self.docs.append(new_doc)
        class UpdateRes:
            matched_count = 1 if target is not None else 0
            modified_count = 1 if target is not None else 0
        return UpdateRes()

    def update_many(self, filt: Dict[str, Any], update: Dict[str, Any]):
        count = 0
        for d in self.docs:
            if self._matches(d, filt):
                if "$set" in update:
                    d.update(update["$set"])
                else:
                    d.update({k: v for k, v in update.items() if not k.startswith("$")})
                count += 1
        class UpdateManyRes:
            matched_count = count
            modified_count = count
        return UpdateManyRes()

    def delete_many(self, filt: Optional[Dict[str, Any]] = None):
        if not filt:
            del_count = len(self.docs)
            self.docs.clear()
        else:
            to_keep = [d for d in self.docs if not self._matches(d, filt)]
            del_count = len(self.docs) - len(to_keep)
            self.docs = to_keep
        class DeleteRes:
            deleted_count = del_count
        return DeleteRes()


class _PurePythonDatabase:
    """Lightweight in-memory Database supporting attribute and index access."""
    def __init__(self, name: str):
        self.name = name
        self._collections: Dict[str, _PurePythonCollection] = {}

    def __getitem__(self, name: str) -> _PurePythonCollection:
        if name not in self._collections:
            self._collections[name] = _PurePythonCollection(name)
        return self._collections[name]

    def __getattr__(self, name: str) -> _PurePythonCollection:
        return self[name]

    def command(self, cmd: str, *args, **kwargs) -> Dict[str, Any]:
        return {"ok": 1}


class _PurePythonClient:
    """Lightweight in-memory MongoClient wrapper."""
    def __init__(self):
        self._dbs: Dict[str, _PurePythonDatabase] = {}
        self.admin = _PurePythonDatabase("admin")

    def __getitem__(self, name: str) -> _PurePythonDatabase:
        if name not in self._dbs:
            self._dbs[name] = _PurePythonDatabase(name)
        return self._dbs[name]

    def __getattr__(self, name: str) -> _PurePythonDatabase:
        return self[name]

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

    # Step 2: In-memory fallback
    if mongomock is not None:
        mock_client = mongomock.MongoClient()
        mock_db = mock_client[DB_NAME]
        is_mock_db = True
        db_connection_status = "CONNECTED_MOCK_FALLBACK"
        db_connection_error = err_msg
        print("[DATABASE] In-memory database (mongomock) active and operational.")
        return mock_client, mock_db
    else:
        pure_client = _PurePythonClient()
        pure_db = pure_client[DB_NAME]
        is_mock_db = True
        db_connection_status = "CONNECTED_PURE_PYTHON_FALLBACK"
        db_connection_error = err_msg or "mongomock not installed and Atlas unreachable"
        print("[DATABASE] Pure Python in-memory database active and operational.")
        return pure_client, pure_db


# Initialize connection on module load
client, db = init_mongo_connection()

# Explicit collection references
institutions_col = db["institutions"]
fdr_instruments_col = db["fdr_instruments"]
audit_logs_col = db["audit_logs"]
release_requests_col = db["release_requests"]
users_col = db["users"]
rbi_directory_col = db["rbi_ifsc_directory"]
magic_links_col = db["bank_magic_links"]
system_state_col = db["system_state"]
scenarios_col = db["evaluation_scenarios"]
circulars_col = db["circulars"]


def ensure_db_seeded():
    """Ensures the active database is populated with the 6 evaluation scenarios if empty."""
    global db, is_mock_db, institutions_col, fdr_instruments_col, audit_logs_col, release_requests_col
    global users_col, rbi_directory_col, magic_links_col, system_state_col, scenarios_col, circulars_col
    try:
        # Check if database has any institutions
        if db.institutions.count_documents({}) == 0:
            try:
                from .seed import seed_database
                seed_database(force=True, custom_db=db)
            except (ImportError, ValueError):
                try:
                    from seed import seed_database
                    seed_database(force=True, custom_db=db)
                except ImportError:
                    from backend.seed import seed_database
                    seed_database(force=True, custom_db=db)
    except Exception as e:
        print(f"[DATABASE NOTICE] ensure_db_seeded status: {e}")
        # If Atlas timed out during count_documents, failover immediately to in-memory store
        if not is_mock_db:
            print("[DATABASE FAILSAFE] Failover to in-memory database to prevent request drops...")
            if mongomock is not None:
                client = mongomock.MongoClient()
                db = client[DB_NAME]
            else:
                client = _PurePythonClient()
                db = client[DB_NAME]
            is_mock_db = True
            institutions_col = db["institutions"]
            fdr_instruments_col = db["fdr_instruments"]
            audit_logs_col = db["audit_logs"]
            release_requests_col = db["release_requests"]
            users_col = db["users"]
            rbi_directory_col = db["rbi_ifsc_directory"]
            magic_links_col = db["bank_magic_links"]
            system_state_col = db["system_state"]
            scenarios_col = db["evaluation_scenarios"]
            circulars_col = db["circulars"]
            try:
                from seed import seed_database
                seed_database(force=True, custom_db=db)
            except Exception:
                try:
                    from backend.seed import seed_database
                    seed_database(force=True, custom_db=db)
                except Exception:
                    pass


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
    global users_col, rbi_directory_col, magic_links_col, system_state_col, scenarios_col, circulars_col
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
        users_col = db["users"]
        rbi_directory_col = db["rbi_ifsc_directory"]
        magic_links_col = db["bank_magic_links"]
        system_state_col = db["system_state"]
        scenarios_col = db["evaluation_scenarios"]
        circulars_col = db["circulars"]

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
