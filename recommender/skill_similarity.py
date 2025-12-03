import numpy as np
from core.embeddings import generate_embedding
from core.vector_store import VectorStore

"""
Skill Similarity Calculator (Upgraded)
----------------------------------------------------
Uses Vector Embeddings (Sentence-Transformers) and FAISS
to find semantically similar skills.
"""

# Initialize Vector Store
vector_store = VectorStore()

def find_similar_skills(skill_name: str, k=5):
    """
    Find skills similar to the input skill name.
    
    Args:
        skill_name (str): Name of the skill (e.g., "React")
        k (int): Number of similar skills to return
        
    Returns:
        list: List of similar skill IDs
    """
    # 1. Generate embedding for the query skill
    embedding = generate_embedding(skill_name)
    
    # 2. Search in FAISS
    results = vector_store.search(embedding, k)
    
    # 3. Return just the IDs
    return [r[0] for r in results]

def calculate_similarity_score(skill1_name: str, skill2_name: str) -> float:
    """
    Calculate semantic similarity between two skills (0 to 1).
    
    Args:
        skill1_name (str): First skill
        skill2_name (str): Second skill
        
    Returns:
        float: Similarity score (Cosine Similarity)
    """
    emb1 = generate_embedding(skill1_name)
    emb2 = generate_embedding(skill2_name)
    
    # Cosine Similarity: (A . B) / (||A|| * ||B||)
    norm1 = np.linalg.norm(emb1)
    norm2 = np.linalg.norm(emb2)
    
    if norm1 == 0 or norm2 == 0:
        return 0.0
        
    return np.dot(emb1, emb2) / (norm1 * norm2)
