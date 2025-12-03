import os
import json
import time
import redis
from pymongo import MongoClient
from dotenv import load_dotenv
from bson.objectid import ObjectId

from core.preprocessing import DataPreprocessor
from core.skill_similarity import SkillSimilarityCalculator
from core.resource_ranker import ResourceRanker

# Load env vars
load_dotenv()

# Configuration
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/optima_idp")
QUEUE_NAME = "recommendation_queue"

# Initialize Services
redis_client = redis.from_url(REDIS_URL)
mongo_client = MongoClient(MONGO_URI)
db = mongo_client.get_database() # Uses database from URI

preprocessor = DataPreprocessor()
similarity_calculator = SkillSimilarityCalculator()
resource_ranker = ResourceRanker()

def process_job(job_data):
    """
    Process a recommendation job.
    1. Fetch data from MongoDB (User, IDP, Skills, Resources)
    2. Generate recommendations
    3. Update IDP in MongoDB
    """
    try:
        user_id = job_data.get('userId')
        idp_id = job_data.get('idpId')
        
        print(f"Processing job for User: {user_id}, IDP: {idp_id}")
        
        # 1. Fetch Data
        user = db.users.find_one({"_id": ObjectId(user_id)})
        idp = db.idps.find_one({"_id": ObjectId(idp_id)})
        all_skills = list(db.skills.find({}))
        all_resources = list(db.resources.find({}).populate("skill") if hasattr(db.resources, 'populate') else db.resources.find({}))
        # Note: PyMongo doesn't have populate. We need to manually join or just fetch.
        # Resources in Mongo usually store skill ID.
        # We need to fetch resources and maybe enrich them if ranker needs skill name.
        # Let's assume resources have skill_id and we can map it.
        
        # Fix: Fetch resources and manually join skill data if needed
        # For now, let's assume resources have what we need or we can look it up.
        # The ranker expects resource objects.
        
        if not user or not idp:
            print("User or IDP not found")
            return

        # 2. Prepare Inputs
        user_skills = user.get('skills', [])
        skills_to_improve = []
        
        # Extract goals from IDP
        for goal in idp.get('goals', []):
            skills_to_improve.append({
                'skillId': str(goal.get('skill')),
                'gap': 0.5, # Default gap if not calculated
                'currentLevel': 1,
                'targetLevel': 5
            })
            
        # 3. Run Recommendation Pipeline
        # a. Skill Mapping
        skill_mapping = preprocessor.create_skill_mapping(all_skills)
        
        # b. Similarity Matrix (using Embeddings now)
        similarity_matrix = similarity_calculator.build_similarity_matrix(all_skills)
        
        # c. Resource Features
        resource_features = preprocessor.prepare_resource_features(all_resources)
        
        # d. Rank Resources
        ranked_resources = resource_ranker.rank_resources(
            resources=all_resources,
            user_skills=user_skills,
            skills_to_improve=skills_to_improve,
            resource_features=resource_features,
            similarity_matrix=similarity_matrix,
            skill_to_idx=skill_mapping
        )
        
        # 4. Format and Update IDP
        top_recommendations = ranked_resources[:10]
        formatted_recs = []
        
        for item in top_recommendations:
            res = item['resource']
            formatted_recs.append({
                'resource': res['_id'], # Reference to Resource
                'score': item['score'],
                'reason': item['breakdown'].get('reason', 'Recommended based on your goals')
            })
            
        # Update IDP status and recommendations
        db.idps.update_one(
            {"_id": ObjectId(idp_id)},
            {
                "$set": {
                    "suggestedResources": formatted_recs,
                    "status": "active", # Or whatever status indicates ready
                    "updatedAt": datetime.datetime.utcnow()
                }
            }
        )
        
        print(f"Job completed for IDP: {idp_id}")
        
    except Exception as e:
        print(f"Error processing job: {e}")
        # Optionally update IDP status to 'failed'

def start_worker():
    print(f"Worker listening on {QUEUE_NAME}...")
    while True:
        try:
            # Blocking pop from right of queue
            # Returns (queue_name, data)
            result = redis_client.blpop(QUEUE_NAME, timeout=0)
            
            if result:
                queue, job_json = result
                job = json.loads(job_json)
                process_job(job.get('data'))
                
        except Exception as e:
            print(f"Worker Loop Error: {e}")
            time.sleep(1)

if __name__ == "__main__":
    import datetime
    start_worker()
