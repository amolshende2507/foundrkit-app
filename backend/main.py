import os
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# --- AI Imports ---
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate

# Load environment variables
load_dotenv()

app = FastAPI()

# --- CORS ---
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Gemini Model ---
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=os.getenv("GEMINI_API_KEY"),
    temperature=0.7,
    convert_system_message_to_human=True
)

# --- Request Body ---
class ProposalRequest(BaseModel):
    client_name: str
    project_summary: str
    tone: str

@app.get("/")
def read_root():
    return {"message": "Hello from FoundrKit Backend!"}

@app.post("/api/proposals/generate")
def generate_proposal(request: ProposalRequest):

    # ✅ Build prompt
    prompt_template = PromptTemplate(
        input_variables=["client_name", "project_summary", "tone"],
        template="""
        You are an expert business proposal writer.
        Create a professional and compelling one-page proposal based on the following details:

        **Client Name:** {client_name}
        **Project Summary:** {project_summary}
        **Desired Tone:** {tone}

        Structure the proposal with clear sections like Introduction, Scope of Work, Deliverables, and a simple Call to Action.
        Keep it concise, professional, and persuasive.
        """
    )

    # ✅ New LCEL Chain (Prompt → Gemini)
    chain = prompt_template | llm

    try:
        response = chain.invoke({
            "client_name": request.client_name,
            "project_summary": request.project_summary,
            "tone": request.tone
        })

        # `response` is a ChatMessage object → return only text
        return {"proposal_text": response.content}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
