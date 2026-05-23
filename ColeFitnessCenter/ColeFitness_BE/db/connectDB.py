import logging
import time
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.engine.url import URL
import psycopg2
import os
from pathlib import Path
from dotenv import load_dotenv

#Setup Logger

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
formatter = logging.Formatter("%(asctime)s:%(levelname)s:%(name)s:%(message)s")

# Log to Console
handler = logging.StreamHandler()
handler.setFormatter(formatter)
logger.addHandler(handler)

# Also log to a file
file_handler = logging.FileHandler("logs\cpy-errors.log")
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)

dotenv_path = Path("environment/.env")
load_dotenv(dotenv_path=dotenv_path)

Base = declarative_base()
DB_DICT = {
    "drivername": "postgresql+psycopg2",
    "host": os.environ.get("DOCKER_DB_HOST"),
    "port": os.environ.get("DOCKER_DB_PORT"),
    "database": os.environ.get("DOCKER_DB_NAME"),
    "username": os.environ.get("DOCKER_DB_USER"),
    "password": os.environ.get("DOCKER_DB_PSWD"),
    "query": {"sslmode": "disable"}
}

def connectDB(attempts=5, delay=2):
    attempt = 1
    while attempt <= attempts:
        try:
            #Create Engine
            if attempt > 3:
                DB_URL = os.environ.get("DB_URL")
                if not DB_URL:
                    logger.error("DB_URL environment variable is not set")
                    return None
                engine = create_engine(DB_URL)
                print("Connecting to Cloud Database...")
            else:
                engine = create_engine(URL.create(**DB_DICT))
                print("Connecting to Local Database...")
            #Create Session
            if engine:
                logger.debug("Engine created: %s", engine)
                SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
                db = SessionLocal()
                Base.metadata.create_all(engine)
                logger.info("Connected to database")
                return db
        except (Exception, psycopg2.OperationalError, RuntimeError) as error:
            if (attempts is attempt):
                # Attempts to reconnect failed; returning None
                logger.info("Failed to connect, exiting without a connection: %s", error)
                return None
            logger.info(
                "Connection failed: %s. Retrying (%d/%d)...",
                error,
                attempt,
                attempts,
            )
            # progressive reconnect delay
            time.sleep(delay ** attempt)
            attempt += 1

if __name__ == "__main__":
    connectDB() 