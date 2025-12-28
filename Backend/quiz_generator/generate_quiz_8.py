
import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
dotenv_path = os.path.join(os.path.dirname(__file__), "../.env")
load_dotenv(dotenv_path=dotenv_path)

api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    print("Error: GOOGLE_API_KEY not found in .env file")
    exit(1)

genai.configure(api_key=api_key)

generation_config = {
  "temperature": 1,
  "top_p": 0.95,
  "top_k": 64,
  "max_output_tokens": 8192,
  "response_mime_type": "application/json",
}

model = genai.GenerativeModel(
  model_name="gemini-flash-lite-latest",
  generation_config=generation_config,
)

def generate_quiz():
    try:
        current_dir = os.path.dirname(__file__)
        syllabus_path = os.path.join(current_dir, "syllabus/class_8.txt")
        with open(syllabus_path, "r") as f:
            syllabus = f.read()
    except FileNotFoundError:
        print(f"Error: Syllabus file not found at {syllabus_path}")
        return

    prompt = f"""
    You are an expert school teacher creating a diagnostic quiz for Class 8 students.
    Based on the following syllabus, create **30** multiple-choice questions.

    Syllabus:
    {syllabus}

    Requirements:
    1. Create a mix of questions from all subjects listed.
    2. Difficulty limit: 30% Easy, 40% Medium, 30% Hard.
    3. **CRITICAL:** Output must be a purely valid JSON array of objects.
    4. **CRITICAL:** Ensure all JSON strings are valid. Double-escape backslashes for math symbols (e.g., "\\\\pi").
    5. **CRITICAL:** You MUST provide a "hint" for every question.
    6. No markdown formatting.

    Output Structure Example:
    [
        {{
            "id": 1,
            "subject": "Math",
            "difficulty": "Easy",
            "question": "Sample Question?",
            "options": {{
                "A": "Opt1",
                "B": "Opt2",
                "C": "Opt3",
                "D": "Opt4"
            }},
            "answer": "A",
            "hint": "Sample hint."
        }}
    ]

    Output JSON only.
    """

    print("Generating Class 8 Quiz...")
    try:
        response = model.generate_content(prompt)
        text_content = response.text.strip()
        
        if text_content.startswith("```json"): text_content = text_content[7:]
        if text_content.startswith("```"): text_content = text_content[3:]
        if text_content.endswith("```"): text_content = text_content[:-3]
        text_content = text_content.strip()

        try:
            quiz_data = json.loads(text_content)
        except json.JSONDecodeError as e:
            print(f"JSON Parse Error: {e}")
            print(f"Raw Response snippet:\n{text_content[:500]}...")
            return

        output_file = "backend/quiz_generator/quiz_data_class_8.json"
        os.makedirs(os.path.dirname(output_file), exist_ok=True)

        with open(output_file, "w") as f:
            json.dump(quiz_data, f, indent=4)
        
        print(f"Success! Generated {len(quiz_data)} questions in {output_file}")
        
    except Exception as e:
        print(f"Error generating quiz: {e}")

if __name__ == "__main__":
    generate_quiz()
