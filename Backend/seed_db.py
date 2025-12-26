from supabase import create_client
import os
from dotenv import load_dotenv
import time

load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")

if not url or not key:
    # Try reading from supabase_credentials.env if .env fails
    try:
        with open("supabase_credentials.env", "r") as f:
            for line in f:
                if line.startswith("SUPABASE_URL="):
                    url = line.strip().split("=", 1)[1]
                elif line.startswith("SUPABASE_KEY="):
                    key = line.strip().split("=", 1)[1]
    except Exception:
        pass

if not url or not key:
    print("Error: SUPABASE_URL or SUPABASE_KEY not found.")
    exit(1)

supabase = create_client(url, key)

def wipe_existing_content():
    print("Wiping existing content (optional, might fail if restricted)...")
    # Delete in reverse order of dependency
    try:
        supabase.table("videos").delete().neq("title", "KEEP_ME_SAFE_GUARD").execute() # Hack to delete all
        # Delete prerequisites - might need manual SQL on dashboard if RLS blocks, trying best effort
        # supabase.table("chapter_prerequisites").delete().neq("chapter_id", "00000000-0000-0000-0000-000000000000").execute()
        supabase.table("chapters").delete().neq("title", "KEEP_ME_SAFE_GUARD").execute()
        supabase.table("subjects").delete().neq("name", "KEEP_ME_SAFE_GUARD").execute()
        supabase.table("standards").delete().neq("name", "KEEP_ME_SAFE_GUARD").execute()
    except Exception as e:
        print(f"Cleanup warning: {e}")

def seed_data():
    wipe_existing_content()
    print("Seeding AMEP Database for Classes 8, 9, 10 with detailed subjects...")
    
    # Curriculum Definition
    curriculum = [
        {
            "class": "Class 8",
            "subjects": {
                "English": ["The Best Christmas Present", "The Tsunami", "Glimpses of the Past", "Bepin Choudhury's Lapse of Memory", "The Summit Within"],
                "Science 1": ["Force and Pressure", "Friction", "Sound", "Chemical Effects of Electric Current", "Light"],
                "Science 2": ["Crop Production", "Microorganisms", "Conservation of Plants and Animals", "Reproduction in Animals", "Adolescence"],
                "Maths 1": ["Rational Numbers", "Linear Equations", "Understanding Quadrilaterals", "Practical Geometry", "Data Handling"],
                "Maths 2": ["Squares and Square Roots", "Cubes and Cube Roots", "Comparing Quantities", "Algebraic Expressions", "Visualising Solid Shapes"],
                "History": ["How, When and Where", "From Trade to Territory", "Ruling the Countryside", "Tribals, Dikus and the Vision", "When People Rebel"]
            }
        },
        {
            "class": "Class 9",
            "subjects": {
                "English": ["The Fun They Had", "The Sound of Music", "The Little Girl", "A Truly Beautiful Mind", "The Snake and the Mirror"],
                "Science 1": ["Matter in Our Surroundings", "Is Matter Around Us Pure", "Atoms and Molecules", "Structure of the Atom", "Motion"],
                "Science 2": ["The Fundamental Unit of Life", "Tissues", "Diversity in Living Organisms", "Why Do We Fall Ill", "Natural Resources"],
                "Maths 1": ["Number Systems", "Polynomials", "Coordinate Geometry", "Linear Equations in Two Variables", "Introduction to Euclid"],
                "Maths 2": ["Lines and Angles", "Triangles", "Quadrilaterals", "Areas of Parallelograms", "Circles"],
                "History": ["The French Revolution", "Socialism in Europe", "Nazism and the Rise of Hitler", "Forest Society and Colonialism", "Pastoralists in the Modern World"]
            }
        },
        {
            "class": "Class 10",
            "subjects": {
                "English": ["A Letter to God", "Nelson Mandela: Long Walk to Freedom", "Two Stories about Flying", "From the Diary of Anne Frank", "The Hundred Dresses"],
                "Science 1": ["Chemical Reactions", "Acids, Bases and Salts", "Metals and Non-metals", "Carbon and its Compounds", "Periodic Classification"],
                "Science 2": ["Life Processes", "Control and Coordination", "How do Organisms Reproduce", "Heredity and Evolution", "Our Environment"],
                "Maths 1": ["Real Numbers", "Polynomials", "Pair of Linear Equations", "Quadratic Equations", "Arithmetic Progressions"],
                "Maths 2": ["Triangles", "Coordinate Geometry", "Introduction to Trigonometry", "Some Applications of Trigonometry", "Circles"],
                "History": ["The Rise of Nationalism in Europe", "Nationalism in India", "The Making of a Global World", "The Age of Industrialisation", "Print Culture"]
            }
        }
    ]

    for grade in curriculum:
        grade_name = grade['class']
        print(f"Processing {grade_name}...")
        
        # 1. Create Standard
        std_res = supabase.table("standards").insert({
            "name": grade_name, 
            "description": f"Standard curriculum for {grade_name} (Maharashtra Board Pattern)"
        }).execute()
        
        if not std_res.data:
            print(f"Skipping {grade_name} (Failed to create)")
            continue
            
        std_id = std_res.data[0]['id']

        # 2. Create Subjects
        for subj_name, topics in grade['subjects'].items():
            sub_res = supabase.table("subjects").insert({
                "standard_id": std_id, 
                "name": subj_name
            }).execute()
            
            if not sub_res.data:
                continue

            sub_id = sub_res.data[0]['id']
            
            # 3. Create Chapters
            prev_ch_id = None
            for idx, title in enumerate(topics):
                ch_res = supabase.table("chapters").insert({
                    "subject_id": sub_id, 
                    "title": title, 
                    "sequence_order": idx + 1
                }).execute()
                
                if not ch_res.data:
                    continue

                curr_ch_id = ch_res.data[0]['id']
                
                # Chain prerequisites linearly
                if prev_ch_id:
                     try:
                        supabase.table("chapter_prerequisites").insert({
                            "chapter_id": curr_ch_id,
                            "prerequisite_chapter_id": prev_ch_id
                        }).execute()
                     except:
                         pass # Ignore dupe errors
                    
                prev_ch_id = curr_ch_id
                
            print(f"  - Added {subj_name} with {len(topics)} chapters.")

    print("Seeding Complete!")

if __name__ == "__main__":
    seed_data()
