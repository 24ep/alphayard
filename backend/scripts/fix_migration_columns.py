import os

MIGRATIONS_DIR = 'src/database/migrations'

def fix_migrations():
    if not os.path.exists(MIGRATIONS_DIR):
        print("Migrations dir not found")
        return

    for filename in os.listdir(MIGRATIONS_DIR):
        if not filename.endswith('.sql'): continue
        filepath = os.path.join(MIGRATIONS_DIR, filename)
        
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        new_content = content
        
        # Replace table names and columns roughly
        # Note: I previously renamed 'families' -> 'circles' in some files.
        # Now I ensure 'family_id' -> 'circle_id' and 'family_members' -> 'circle_members' everywhere.
        
        new_content = new_content.replace('family_id', 'circle_id')
        new_content = new_content.replace('family_members', 'circle_members')
        new_content = new_content.replace('families', 'circles') 
        # CAUTION: 'families' -> 'circles'. If I have 'user_families', it becomes 'user_circles'. Likely desired.
        
        # Fix specific case if 'circles' replacement caused 'circle_members' to become 'circle_members' (if 'families' -> 'circles' and 'members' -> 'members'? No. 'family_members' -> 'circle_members' done first?)
        # Actually replace is sequential.
        # If I replace 'family_members' -> 'circle_members' first.
        # Then replace 'families' -> 'circles'.
        # 'family_members' (if any left) -> 'circle_members'.
        # Correct order: Specific longer matches first?
        # 'family_members' is length 14. 'families' is length 8.
        # But 'family_id' is length 9.
        
        # Just simple replaces. order:
        # 1. family_members -> circle_members
        # 2. family_id -> circle_id
        # 3. families -> circles
        
        # Wait, if I replace 'families' -> 'circles', then 'family_members' -> 'circle_members' won't work if 'families' changed to 'circles'?
        # 'family_members' contains 'family'.
        # If I replace 'families' -> 'circles'. 'family_members' stays 'family_members'.
        # If I replace 'family_id' (contains 'family').
        # So 'family' is the root.
        # Replace 'family' -> 'circle'?
        # That's too aggressive ('family_name' -> 'circle_name', 'family_tree' -> 'circle_tree').
        # But 'families' (plural) -> 'circles'.
        # 'family_members' -> 'circle_members'.
        # 'family_id' -> 'circle_id'.
        
        content_backup = new_content
        new_content = new_content.replace('family_members', 'circle_members')
        new_content = new_content.replace('family_id', 'circle_id')
        new_content = new_content.replace('families', 'circles')
        
        # Fix any potential double naming if I ran it multiple times? No, replace is idempotent if I don't run on already replaced content?
        # 'circle_members' -> 'circle_members'.
        
        # Also 'REFERENCES families' -> 'REFERENCES circles' (covered by families->circles)
        
        if content != new_content:
            print(f"Updating {filename}")
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)

if __name__ == '__main__':
    fix_migrations()
