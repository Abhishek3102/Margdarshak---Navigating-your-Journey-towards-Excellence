from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate
from langchain.schema.output_parser import StrOutputParser
import os
from dotenv import load_dotenv

load_dotenv()

# Check for API Key
if not os.getenv("GOOGLE_API_KEY"):
    print("Warning: GOOGLE_API_KEY not found. Agent will fail.")

llm = ChatGoogleGenerativeAI(model="gemini-flash-lite-latest", temperature=0.7)

# --- Socratic Hint Generator ---
hint_prompt = ChatPromptTemplate.from_template(
    """
    You are a Socratic Tutor for a high school student.
    The student is stuck on a question about: {concept}
    Question Text: {question_text}
    
    Student's Profile:
    - Learning Style: {learning_style} (e.g., Visual, Analogies, Mathematical)
    - Current Mastery Level: {mastery_level}/100
    
    Your Goal: Do NOT give the answer. Provide a guiding hint.
    
    Strategy:
    1. If the student likes Analogies, use a real-world comparison.
    2. If the student is Visual, describe a mental image.
    3. Keep it short (under 2 sentences).
    
    Hint:
    """
)

socratic_chain = hint_prompt | llm | StrOutputParser()

async def generate_socratic_hint(concept: str, question_text: str, learning_style: str = "Visual", mastery_level: int = 50) -> str:
    """Generates a contextual hint without giving the answer."""
    try:
        response = await socratic_chain.ainvoke({
            "concept": concept,
            "question_text": question_text,
            "learning_style": learning_style,
            "mastery_level": mastery_level
        })
        return response
    except Exception as e:
        return f"Think about the basic principles of {concept}. (AI Error: {str(e)})"
