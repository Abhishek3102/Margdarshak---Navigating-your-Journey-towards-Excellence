import sys
import json
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel
from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '../.env'))

def get_recommendations(course_id, num_recommendations=5):
    # Connect to MongoDB
    client = MongoClient(os.getenv('MONGO_URI'))
    db = client.get_database()
    collection = db['courses']

    # Fetch all courses
    courses = list(collection.find({}, {'_id': 1, 'title': 1, 'description': 1, 'tags': 1, 'category': 1}))
    
    if not courses:
        return []

    df = pd.DataFrame(courses)
    
    # Combine features for content-based filtering
    df['tags'] = df['tags'].apply(lambda x: ' '.join(x) if isinstance(x, list) else '')
    df['content'] = df['title'] + ' ' + df['description'] + ' ' + df['tags'] + ' ' + df['category']
    
    # TF-IDF Vectorization
    tfidf = TfidfVectorizer(stop_words='english')
    tfidf_matrix = tfidf.fit_transform(df['content'])
    
    # Compute Cosine Similarity
    cosine_sim = linear_kernel(tfidf_matrix, tfidf_matrix)
    
    # Get index of the course
    indices = pd.Series(df.index, index=df['_id'].apply(lambda x: str(x))).drop_duplicates()
    
    if course_id not in indices:
        return []

    idx = indices[course_id]

    # Get pairwise similarity scores
    sim_scores = list(enumerate(cosine_sim[idx]))

    # Sort courses based on similarity scores
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)

    # Get scores of the most similar courses (excluding itself)
    sim_scores = sim_scores[1:num_recommendations+1]

    # Get course indices
    course_indices = [i[0] for i in sim_scores]

    # Return recommended course IDs
    return df['_id'].iloc[course_indices].apply(lambda x: str(x)).tolist()

if __name__ == "__main__":
    # Expect course_id as command line argument
    if len(sys.argv) > 1:
        course_id = sys.argv[1]
        recommendations = get_recommendations(course_id)
        print(json.dumps(recommendations))
    else:
        print(json.dumps([]))
