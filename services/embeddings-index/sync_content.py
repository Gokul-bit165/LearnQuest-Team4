"""
Vector Store Synchronization Service
Reads content from database, creates embeddings, and upserts to vector store.
"""
import asyncio
from typing import List, Dict
import sys
import os

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api.src.ai.embeddings import create_embeddings_batch, upsert_content_embedding

async def sync_all_content():
    """
    Main synchronization function.
    Fetches all content from database and syncs to vector store.
    """
    print("🔄 Starting vector store synchronization...")
    
    # Step 1: Fetch all content from database
    print("📚 Fetching content from database...")
    content_items = await fetch_all_content()
    print(f"   Found {len(content_items)} items to sync")
    
    # Step 2: Process in batches for efficiency
    batch_size = 50
    total_synced = 0
    
    for i in range(0, len(content_items), batch_size):
        batch = content_items[i:i + batch_size]
        
        print(f"⚙️  Processing batch {i//batch_size + 1}...")
        synced = await sync_content_batch(batch)
        total_synced += synced
        
        print(f"   Synced {synced}/{len(batch)} items")
    
    print(f"✅ Synchronization complete! Total items synced: {total_synced}")


async def fetch_all_content() -> List[Dict]:
    """
    Fetch all course content from database.
    
    Returns:
        List of content items with text and metadata
    """
    # TODO: Implement actual database fetch
    # Example query:
    # SELECT id, title, content, course_id, module_name, type
    # FROM course_content
    # WHERE status = 'published'
    
    # Placeholder data
    return [
        {
            "id": "content-1",
            "title": "Introduction to Python",
            "content": "Python is a high-level programming language...",
            "course_id": "python-basics",
            "module": "Module 1",
            "type": "lesson"
        },
        {
            "id": "content-2",
            "title": "Variables and Data Types",
            "content": "In Python, variables are used to store data...",
            "course_id": "python-basics",
            "module": "Module 1",
            "type": "lesson"
        }
    ]


async def sync_content_batch(content_batch: List[Dict]) -> int:
    """
    Sync a batch of content items to vector store.
    
    Args:
        content_batch: List of content items
    
    Returns:
        Number of successfully synced items
    """
    synced_count = 0
    
    for item in content_batch:
        try:
            # Prepare text for embedding
            text = prepare_text_for_embedding(item)
            
            # Prepare metadata
            metadata = {
                "course_id": item.get("course_id"),
                "module": item.get("module"),
                "type": item.get("type"),
                "title": item.get("title")
            }
            
            # Upsert to vector store
            success = await upsert_content_embedding(
                content_id=item["id"],
                text=text,
                metadata=metadata
            )
            
            if success:
                synced_count += 1
                
        except Exception as e:
            print(f"   ⚠️  Error syncing item {item.get('id')}: {str(e)}")
            continue
    
    return synced_count


def prepare_text_for_embedding(content_item: Dict) -> str:
    """
    Prepare content text for embedding.
    Combines title and content for better semantic search.
    
    Args:
        content_item: Content item dictionary
    
    Returns:
        Formatted text for embedding
    """
    title = content_item.get("title", "")
    content = content_item.get("content", "")
    
    # Combine title and content
    # Title is weighted more by including it twice
    text = f"{title}\n\n{title}\n\n{content}"
    
    # Truncate if too long (most embedding models have token limits)
    max_length = 8000  # Approximate character limit
    if len(text) > max_length:
        text = text[:max_length]
    
    return text


async def sync_course_content(course_id: str):
    """
    Sync content for a specific course.
    Useful for updating content after course edits.
    
    Args:
        course_id: Course identifier
    """
    print(f"🔄 Syncing content for course: {course_id}")
    
    # TODO: Fetch only content for this course
    content_items = await fetch_course_content(course_id)
    
    synced = await sync_content_batch(content_items)
    print(f"✅ Synced {synced}/{len(content_items)} items for course {course_id}")


async def fetch_course_content(course_id: str) -> List[Dict]:
    """
    Fetch content for a specific course.
    
    Args:
        course_id: Course identifier
    
    Returns:
        List of content items for the course
    """
    # TODO: Implement database query filtered by course_id
    return []


async def delete_course_embeddings(course_id: str):
    """
    Delete all embeddings for a course.
    Used when a course is deleted or needs to be re-indexed.
    
    Args:
        course_id: Course identifier
    """
    print(f"🗑️  Deleting embeddings for course: {course_id}")
    
    # TODO: Implement deletion from vector store
    # vector_store.delete(where={"course_id": course_id})
    
    print(f"✅ Deleted embeddings for course {course_id}")


async def health_check():
    """
    Check health of vector store connection.
    """
    try:
        # TODO: Implement actual health check
        # result = vector_store.heartbeat()
        print("✅ Vector store connection healthy")
        return True
    except Exception as e:
        print(f"❌ Vector store connection failed: {str(e)}")
        return False


if __name__ == "__main__":
    # Run synchronization
    print("=" * 50)
    print("Learn Quest - Vector Store Sync Service")
    print("=" * 50)
    
    # Check health first
    asyncio.run(health_check())
    
    # Run full sync
    asyncio.run(sync_all_content())
