import chromadb

# Mock ChromaDB Interface
def retrieve_policy_context(query: str) -> str:
    # In real app: collection.query(query_texts=[query])
    return """
    Policy 4.2: Footwear Returns
    - Worn soles are not returnable.
    - Manufacturing defects (gluing, stitching) covered for 60 days.
    """
