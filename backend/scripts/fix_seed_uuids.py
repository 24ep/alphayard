import os
import re
import uuid

SEED_FILE = 'src/database/seed.sql'
ID_MAP = {}

def get_uuid(key):
    if key not in ID_MAP:
        # Generate a deterministic UUID based on integer or just random?
        # Random is fine as long as consistent within current execution for replacement
        # But if I replace 'user-1' globally, it must remain same UUID.
        ID_MAP[key] = str(uuid.uuid4())
    return ID_MAP[key]

# Manual mapping for some specific ones if needed, otherwise random.
# Actually, random is risky if 'user-1' appears as 'user-1' substring in 'user-12'?
# So I should use regex with boundary.

def fix_uuids():
    if not os.path.exists(SEED_FILE):
        print("File not found.")
        return

    with open(SEED_FILE, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find all placeholder IDs (assuming pattern like 'user-\d+', 'hourse-\d+', 'fm-\d+', 'chat-\d+', 'msg-\d+', 'loc-\d+', 'alert-\d+', 'file-\d+', 'event-\d+', 'ea-\d+', 'task-\d+', 'note-\d+', 'notif-\d+', 'album-\d+', 'item-\d+', 'demo-family', 'fm-admin-1')
    
    # Patterns
    patterns = [
        r"'user-\d+'",
        r"'hourse-\d+'",
        r"'fm-\d+'",
        r"'chat-\d+'",
        r"'cp-\d+'",
        r"'msg-\d+'",
        r"'loc-\d+'",
        r"'geo-\d+'",
        r"'alert-\d+'",
        r"'file-\d+'",
        r"'event-\d+'",
        r"'ea-\d+'",
        r"'task-\d+'",
        r"'note-\d+'",
        r"'notif-\d+'",
        r"'album-\d+'",
        r"'item-\d+'",
        r"'demo-family'",
        r"'fm-admin-1'",
        r"'admin-user'" # saw this in seed.sql line 367
    ]
    
    # We need to collect ALL unique IDs first to map them consistently.
    found_ids = set()
    for p in patterns:
        matches = re.findall(p, content)
        for m in matches:
            found_ids.add(m)
    
    # Sort by length descending to avoid substring replacement issues (e.g. user-11 vs user-1)
    sorted_ids = sorted(list(found_ids), key=len, reverse=True)
    
    new_content = content
    for old_id_quoted in sorted_ids:
        # old_id_quoted includes quotes, e.g. 'user-1'
        # Generate new UUID
        raw_uuid = str(uuid.uuid4())
        new_id_quoted = f"'{raw_uuid}'"
        
        # Replace
        new_content = new_content.replace(old_id_quoted, new_id_quoted)
        
        # Log?
        # print(f"Mapped {old_id_quoted} -> {new_id_quoted}")

    with open(SEED_FILE, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Updated UUIDs in seed.sql")

if __name__ == '__main__':
    fix_uuids()
