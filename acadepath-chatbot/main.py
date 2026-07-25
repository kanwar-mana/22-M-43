from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import json
import re
from groq import Groq

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

# Load structured Q&A pairs
with open("fyp_qa_pairs.json", "r", encoding="utf-8") as f:
    QA_PAIRS = json.load(f)

def get_relevant_qa(query, top_n=5):
    """Simple keyword-overlap based retrieval - finds most relevant Q&A pairs"""
    query_words = set(re.findall(r'\w+', query.lower()))
    scored = []
    for pair in QA_PAIRS:
        question_words = set(re.findall(r'\w+', pair["question"].lower()))
        overlap = len(query_words & question_words)
        scored.append((overlap, pair))
    scored.sort(key=lambda x: x[0], reverse=True)
    return [pair for score, pair in scored[:top_n] if score > 0] or [pair for _, pair in scored[:top_n]]

BASE_SYSTEM_PROMPT = """You are FYP Assistant, a helpful AI guide for Final Year Project (FYP) students.

Use the provided context below to answer the student's question accurately. If the context doesn't contain relevant information, politely say you don't have that information and suggest contacting the FYP coordinator.

Do NOT mention specific supervisor names. When asked about project ideas, recommend domains/topics based on the student's stated interests.

Answer clearly and concisely."""

class ChatRequest(BaseModel):
    message: str

@app.post("/chat")
def chat(req: ChatRequest):
    relevant_pairs = get_relevant_qa(req.message, top_n=5)
    context = "\n\n".join([f"Q: {p['question']}\nA: {p['answer']}" for p in relevant_pairs])

    full_system_prompt = f"{BASE_SYSTEM_PROMPT}\n\nRELEVANT CONTEXT:\n{context}"

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": full_system_prompt},
            {"role": "user", "content": req.message}
        ],
        temperature=0.7,
        max_tokens=350,
    )
    return {"reply": response.choices[0].message.content}

@app.get("/")
def health_check():
    return {"status": "FYP Assistant API is running"}