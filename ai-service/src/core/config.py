from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "English App AI Service"
    PORT: int = 8000
    GROQ_API_KEY: str
    GROQ_MODEL: str = "llama-3.1-8b-instant"

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
