import os
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Supabase
from supabase import create_client, Client

# LangChain (new imports)
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser

# Gemini LLM via LangChain
from langchain_google_genai import ChatGoogleGenerativeAI

load_dotenv()

app = FastAPI()

# --- CORS Middleware ---
origins = ["http://localhost:5173", "http://127.0.0.1:5173"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Supabase Setup ---
supabase_url = os.getenv("SUPABASE_URL")
supabase_service_key = os.getenv("SUPABASE_SERVICE_KEY") 
supabase: Client = create_client(supabase_url, supabase_service_key)

# ✅ Free Gemini Model
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",   # ✅ Free-tier model
    google_api_key=os.getenv("GEMINI_API_KEY"),
    temperature=0.7,
)

# User Authentication
async def get_user(request: Request):
    token = request.headers.get("authorization")
    
    if not token:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    try:
        token = token.replace("Bearer ", "")
        user_data = supabase.auth.get_user(token)
        return user_data.user
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {e}")

# Models
class ProposalRequest(BaseModel):
    client_name: str
    project_summary: str
    tone: str

@app.get("/")
def read_root():
    return {"message": "Hello from FoundrKit Backend!"}

@app.post("/api/proposals/generate")
def generate_and_save_proposal(request: ProposalRequest, user = Depends(get_user)):
    prompt_template = PromptTemplate(
        input_variables=["client_name", "project_summary", "tone"],
        template="""
        You are an expert business proposal writer. Create a compelling one-page proposal.

        **Client Name:** {client_name}
        **Project Summary:** {project_summary}
        **Desired Tone:** {tone}

        Include sections:
        - Introduction
        - Scope of Work
        - Deliverables
        - Call to Action
        """
    )

    parser = StrOutputParser()

    # ✅ New LC chain structure (no more LLMChain)
    chain = prompt_template | llm | parser

    try:
        ai_response = chain.invoke({
            "client_name": request.client_name,
            "project_summary": request.project_summary,
            "tone": request.tone
        })

        db_response = supabase.table("proposals").insert({
            "user_id": user.id,
            "client_name": request.client_name,
            "project_summary": request.project_summary,
            "content": ai_response
        }).execute()

        if len(db_response.data) == 0:
            raise HTTPException(status_code=500, detail="Failed to save proposal.")

        return {"proposal_text": ai_response, "db_data": db_response.data[0]}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
