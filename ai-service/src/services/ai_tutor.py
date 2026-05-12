from groq import Groq
from src.core.config import settings
from src.services.rag_engine import rag_engine

client = Groq(api_key=settings.GROQ_API_KEY)

class AITutorService:
    def __init__(self):
        self.model = settings.GROQ_MODEL

    async def get_chat_response(self, message: str, conversation_history: list = None, system_prompt: str = None, persona: str = None, module: str = None) -> str:
        base_prompt = system_prompt or "You are a helpful English tutor assistant."
        
        if persona:
            base_prompt += f"\n\nYou must strictly act as the persona: {persona}. Your tone and vocabulary should match this persona."
            
        if module == 'writing':
            base_prompt += "\n\nThis is a WRITING PRACTICE session. Focus on correcting the user's grammar, vocabulary, and sentence structure. Provide constructive feedback on how they can improve their writing.\n\nCRITICAL FORMATTING RULE: Whenever you provide a corrected sentence, an example paragraph, or the final polished version of their text, you MUST wrap that specific English text in double asterisks to make it bold. Example: **This is the corrected sentence.** Do not use quotes, use **."
        elif module == 'speaking':
            base_prompt += "\n\nThis is a SPEAKING PRACTICE session. Focus on conversational fluency. Keep your replies relatively short so the user can speak more.\n\nCRITICAL FORMATTING RULE: If you correct the user's sentence or provide an example sentence, you MUST wrap that specific English sentence in double asterisks to make it bold. Example: **This is the corrected sentence.** Do not use quotes, use **."
        
        vocab_context = rag_engine.get_vocabulary_context()
        if vocab_context:
            base_prompt += f"\n\n{vocab_context}"

        messages = [{"role": "system", "content": base_prompt}]
        
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
