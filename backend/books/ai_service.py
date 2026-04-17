import os
import requests
from dotenv import load_dotenv

load_dotenv()

class AIService:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.base_url = os.getenv("LLM_BASE_URL", "https://api.openai.com/v1")
        # If user has a local LLM like LM Studio, they can set LLM_BASE_URL to http://localhost:1234/v1

    def generate_summary(self, description):
        if not self.api_key and "openai" in self.base_url:
            return f"Mock Summary: This book is fascinating. (Add OPENAI_API_KEY for real AI)"
        
        try:
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers={"Authorization": f"Bearer {self.api_key}"},
                json={
                    "model": "gpt-3.5-turbo",
                    "messages": [
                        {"role": "system", "content": "You are a helpful assistant that summarizes books concisely."},
                        {"role": "user", "content": f"Summarize this book description in 2-3 sentences: {description}"}
                    ]
                },
                timeout=10
            )
            return response.json()['choices'][0]['message']['content']
        except Exception as e:
            return f"Error generating summary: {str(e)}"

    def predict_genre(self, description):
        if not self.api_key and "openai" in self.base_url:
            return "General Fiction"
            
        try:
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers={"Authorization": f"Bearer {self.api_key}"},
                json={
                    "model": "gpt-3.5-turbo",
                    "messages": [
                        {"role": "system", "content": "You are a librarian. Classify the book into a single genre based on the description."},
                        {"role": "user", "content": f"Predict the genre for this description: {description}"}
                    ]
                },
                timeout=10
            )
            return response.json()['choices'][0]['message']['content'].strip('.')
        except Exception:
            return "Uncategorized"

    def answer_question(self, context, question):
        if not self.api_key and "openai" in self.base_url:
            return f"Mock Answer: Based on the context, the answer to '{question}' is found in the description. (Add OPENAI_API_KEY for real AI)"
            
        try:
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers={"Authorization": f"Bearer {self.api_key}"},
                json={
                    "model": "gpt-3.5-turbo",
                    "messages": [
                        {"role": "system", "content": "Answer the question based ONLY on the provided context. If unsure, say you don't know."},
                        {"role": "user", "content": f"Context: {context}\n\nQuestion: {question}"}
                    ]
                },
                timeout=15
            )
            return response.json()['choices'][0]['message']['content']
        except Exception as e:
            return f"Error answering question: {str(e)}"
