from pydantic import BaseModel


class ColeFitnessLoginSchema(BaseModel):
    UserName: str
    Password: str
