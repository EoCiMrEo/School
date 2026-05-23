from dotenv import load_dotenv
from datetime import timedelta, datetime
from typing import Optional
import os
import pathlib
import jwt
import json
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

dotenvPath = pathlib.Path("environment/.env")
load_dotenv(dotenv_path=dotenvPath)

SECRET_KEY = os.environ.get("JWT_SECRET_KEY")
ALGORITHM = os.environ.get("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2Schema = OAuth2PasswordBearer(tokenUrl="token")

def serialLizer(obj):
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError("Serializing failed !")

def createAccessToken(data: dict, expiresDelta: Optional[timedelta] = None):
    toEncode = data.copy()
    if expiresDelta:
        expire = datetime.now() + expiresDelta
    else:
        expire = datetime.now(datetime.now().astimezone().tzinfo) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    jsonDatetime = json.dumps(expire, default=serialLizer)
    toEncode.update({"expire": jsonDatetime})
    encodedJWT = jwt.encode(toEncode, SECRET_KEY, algorithm=ALGORITHM)
    return encodedJWT

if __name__ == "__main__":
    print(createAccessToken({"sub": "johndoe"}))