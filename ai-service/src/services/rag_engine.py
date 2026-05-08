import json
import os
from typing import List, Dict

DATA_FILE = "data/vocabularies.json"

class RAGEngine:
    def __init__(self):
        self.vocabularies: List[Dict] = []
        self._load_data()

    def _load_data(self):
        if os.path.exists(DATA_FILE):
            try:
                with open(DATA_FILE, "r", encoding="utf-8") as f:
                    self.vocabularies = json.load(f)
            except Exception as e:
                print(f"Error loading vocabularies: {e}")

    def train_vocabularies(self, vocabularies: List[Dict]):
        os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
        self.vocabularies = vocabularies
        try:
            with open(DATA_FILE, "w", encoding="utf-8") as f:
                json.dump(self.vocabularies, f, ensure_ascii=False, indent=2)
            return True
        except Exception as e:
            print(f"Error saving vocabularies: {e}")
            return False

    def get_vocabulary_context(self) -> str:
        if not self.vocabularies:
            return ""
        
        context_parts = ["Here is the core vocabulary of the course. You should prioritize using these words in your explanations and examples:"]
        for v in self.vocabularies:
            word = v.get("word", "")
            definition = v.get("definition", "")
            example = v.get("example", "")
            if word:
                entry = f"- {word}: {definition}"
                if example:
                    entry += f" (Example: {example})"
                context_parts.append(entry)
                
        return "\n".join(context_parts)

rag_engine = RAGEngine()
