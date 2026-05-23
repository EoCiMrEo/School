from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from typing import Optional
import jwt
import time
import logging
from pathlib import Path
import os
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
file_handler = logging.FileHandler("logs\middleware-errors.log")
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)

dotenv_path = Path("environment/.env")
load_dotenv(dotenv_path=dotenv_path)

class ColeFitnessAuthMiddleware:
    def __init__(self):
        self.SECRET_KEY = os.environ.get("JWT_SECRET_KEY")
        self.ALGORITHM = os.environ.get("ALGORITHM")
        self.ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES"))
    
    async def authenticateRequest(self, request: Request, call_next):
        try:
            #Start timing the request
            startTime = time.time()

            #Skip authentication for public routes
            if self.isPublicRoute(request.url.path):
                return await call_next(request)

            #Get the access token from the request
            access_token = self.extractToken(request)
            if not access_token:
                return JSONResponse(status_code=status.HTTP_401_UNAUTHORIZED, content={"message": "No authorization token provided"}, headers={"WWW-Authenticate": "Bearer"})
            #Verify the access token
            user = self.verifyToken(access_token)
            #Add the user to the request
            request.state.user = user
            response = await call_next(request)
            endTime = time.time()
            executionTime = endTime - startTime
            print(f"Execution time: {executionTime} seconds")
            return response
        except HTTPException as he:
            logger.error(f"authenticateRequest Error: {he.detail} !")
            return JSONResponse(status_code=he.status_code, content={"message": he.detail})
        except Exception as ex:
            logger.error(f"authenticateRequest Error: {ex} !")
            return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content={"message": f"{ex}"})
        
    def isPublicRoute(self, path: str) -> bool:
        publicRoutes = ["/colefitness/login/employee", "/colefitness/login/member", "/colefitness/register/employee", "/colefitness/register/member", "/"]
        return path in publicRoutes
    
    def extractToken(self, request: Request) -> Optional[str]:
        try:
            # Get the access token from the request
            if request.cookies.get("access_token") is not None:
                access_token = request.cookies.get("access_token")
            elif request.headers.get("Authorization") is not None:
                authorization = request.headers.get("Authorization")
                try:
                    schema, token = authorization.split()
                    if schema.lower() != "bearer":
                        logger.error(f"extractToken: Invalid authentication scheme !")
                        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication scheme")
                    return token
                except (Exception, ValueError) as ex:
                    logger.error(f"extractToken: {ex} !")
                    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authorization header")
            else:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
        except (Exception, ValueError) as ex:
            logger.error(f"extractToken: {ex} !")
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    def verifyToken(self, access_token: str) -> dict:
        try:
            payload = jwt.decode(access_token, self.SECRET_KEY, algorithms=[self.ALGORITHM])
            return payload
        except jwt.ExpiredSignatureError:
            logger.error(f"verifyToken: Access token expired !")
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Access token expired")
        except jwt.InvalidTokenError:
            logger.error(f"verifyToken: Invalid access token !")
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid access token")
        except Exception as ex:
            logger.error(f"verifyToken: {ex} !")
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")