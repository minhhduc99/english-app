from groq import Groq
from src.core.config import settings

client = Groq(api_key=settings.GROQ_API_KEY)

class AITutorService:
    def __init__(self):
        self.model = settings.GROQ_MODEL
        self.system_prompt = """You are an enthusiastic and supportive English tutor.
Your goal is to help students learn English effectively.
You should adjust your explanations based on the student's request.
You are capable of speaking both English and Vietnamese. If the user asks in Vietnamese, you can explain in Vietnamese but provide English examples. If the user asks in English, keep the conversation in English.
Keep your answers concise and encouraging."""

    async def get_chat_response(self, message: str, conversation_history: list = None) -> str:
        messages = [{"role": "system", "content": self.system_prompt}]
        
        if conversation_history:
            messages.extend(conversation_history)
            
        messages.append({"role": "user", "content": message})

        try:
            chat_completion = client.chat.completions.create(
                messages=messages,
                model=self.model,
                temperature=0.7,
                max_tokens=1024,
            )
            return chat_completion.choices[0].message.content
        except Exception as e:
            print(f"Error communicating with Groq API: {e}")
            raise e
