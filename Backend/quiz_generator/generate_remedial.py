import os
import json
import time
import google.generativeai as genai
from dotenv import load_dotenv

# Load env from parent directory
dotenv_path = os.path.join(os.path.dirname(__file__), "../.env")
load_dotenv(dotenv_path=dotenv_path, override=True)

api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    print("Error: GOOGLE_API_KEY not found in .env")
    exit(1)

genai.configure(api_key=api_key)

# Configuration for the model
generation_config = {
  "temperature": 0.3, # Low temp for factual consistency
  "top_p": 0.95,
  "top_k": 64,
  "max_output_tokens": 8192,
  "response_mime_type": "application/json",
}

# Try to use the requested model
model_name = "gemini-2.5-flash" 

model = genai.GenerativeModel(
  model_name=model_name,
  generation_config=generation_config,
)

def generate_remedial_content():
    classes = [9, 10]
    
    for class_num in classes:
        input_file = f"quiz_data_class_{class_num}.json"
        output_file = f"remedial_data_class_{class_num}.json"
        
        # Check if input exists
        if not os.path.exists(os.path.join(os.path.dirname(__file__), input_file)):
            print(f"Skipping Class {class_num}: {input_file} not found.")
            continue
            
        print(f"\nProcessing Class {class_num}...")
        
        with open(os.path.join(os.path.dirname(__file__), input_file), "r") as f:
            questions = json.load(f)
            
        remedial_data = []
        
        # Process questions in batches to avoid rate limits efficiency, 
        # but for quality/structure, we'll do one big prompt or chunks.
        # Let's try sending ALL 30 questions in one prompt to get a mapped JSON response.
        # This is faster and usually works well with Gemini Flash context window.
        
        questions_stripped = [
            {
                "id": q["id"],
                "subject": q["subject"],
                "question": q["question"],
                "correct_answer": q["options"][q["answer"]]
            }
            for q in questions
        ]
        
        final_results = []
        BATCH_SIZE = 5
        
        for i in range(0, len(questions_stripped), BATCH_SIZE):
            batch = questions_stripped[i:i+BATCH_SIZE]
            print(f"  - Processing Batch {i//BATCH_SIZE + 1} ({len(batch)} questions)...")
            
            prompt = f"""
            You are an expert tutor creating remedial study content.
            I will provide a small batch of {len(batch)} questions from a Class {class_num} quiz.
            
            For EACH question, you must provide:
            1. **Concept Title**: The core topic (e.g., "Pythagoras Theorem").
            2. **Concept Explanation**: A clear, concise explanation (2-3 sentences).
            3. **Key Formula/Rule**: Plain text formula or rule.
            
            Input Questions:
            {json.dumps(batch)}
            
            Requirements:
            - Output must be a VALID JSON Array of objects.
            - Structure: {{ "question_id": <int>, "concept": "...", "explanation": "...", "formula": "..." }}
            
            CRITICAL FORMATTING RULES (PLAIN TEXT ONLY):
            1. **NO LaTeX**: Do NOT use backslashes, dollar signs, or latex commands like \\frac.
            2. **NO Markdown**: No bold/italics.
            3. Use simple readable text:
               - "a / b" for fractions.
               - "sqrt(x)" for roots.
               - "^" or "squared" for powers.
               - "->" for arrows.
            """
            
            retries = 5
            for attempt in range(retries):
                try:
                    response = model.generate_content(prompt)
                    text = response.text.strip()
                    if text.startswith("```json"): text = text[7:]
                    if text.startswith("```"): text = text[3:]
                    if text.endswith("```"): text = text[:-3]
                    
                    batch_results = json.loads(text.strip())
                    final_results.extend(batch_results)
                    print(f"    - Success.")
                    
                    # Save Incrementally
                    try:
                        out_path = os.path.join(os.path.dirname(__file__), output_file)
                        with open(out_path, "w") as out_f:
                            json.dump(final_results, out_f, indent=4)
                    except Exception as e:
                         print(f"    - Save failed: {e}")
                    
                    time.sleep(1) # Polite delay
                    break # Success
                except Exception as e:
                    is_rate_limit = "429" in str(e) or "ResourceExhausted" in str(e) or "quota" in str(e).lower()
                    if is_rate_limit:
                         print(f"    - Rate Limit Hit! Sleeping for 60s... (Attempt {attempt+1}/{retries})")
                         time.sleep(60)
                    else:
                        print(f"    - Attempt {attempt+1} failed: {e}")
                        time.sleep(5)
            else:
                 print(f"    - FAILED BATCH after {retries} attempts.")
        
        # Save
        try:
            out_path = os.path.join(os.path.dirname(__file__), output_file)
            with open(out_path, "w") as out_f:
                json.dump(final_results, out_f, indent=4)
            print(f"  - Saved {len(final_results)} items to {output_file}")
        except Exception as e:
             print(f"  - Error saving file: {e}")

    print("\nAll done!")

if __name__ == "__main__":
    generate_remedial_content()
