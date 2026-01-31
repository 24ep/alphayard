import re

SEED_FILE = 'src/database/seed.sql'

def fix_seed_admin():
    with open(SEED_FILE, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    new_lines = []
    
    in_chat_participants = False
    in_admin_circles = False
    in_admin_members = False
    
    for line in lines:
        stripped = line.strip()
        
        # 1. Remove chat_participants
        if stripped.startswith('INSERT INTO chat_participants'):
            in_chat_participants = True
            continue # skip header
            
        if in_chat_participants:
            if stripped.endswith(';'):
                in_chat_participants = False
            continue # skip values
            
        # 2. Fix Admin Circles (Line ~371)
        if stripped.startswith('INSERT INTO circles') and 'created_by' in line:
            # Check if it's the Admin one (has SELECT below it? Or distinct from top one?)
            # Top one used VALUES. Admin one uses SELECT.
            # But header is same line.
            # If I already fixed 'owner_id' in top one, this regex might match again?
            # Top one: `INSERT INTO circles (..., owner_id, ...) VALUES`
            # Admin one: `INSERT INTO circles (...)` (next line is SELECT)
            # My complex fix script checked `if stripped.startswith('INSERT INTO circles'):`.
            # And: `line = line.replace('created_by, created_at', 'created_by, owner_id, created_at')`.
            # It replaces BOTH occurrences if they match.
            # DID it match existing line?
            # If line is `INSERT INTO circles (...)` (no VALUES).
            # Then next line is `SELECT`.
            # My complex script expected `VALUES`. It checked `if in_circles and stripped.startswith('('):`.
            # Admin block has `SELECT`. So it skipped values fix for Admin block.
            # BUT it fixed the header?
            # Let's assume header has `owner_id` now.
            # Now we need to fix the SELECT line.
            pass

        if stripped.startswith('SELECT') and 'Demo Family' in line:
            # This is the circles SELECT
            # SELECT 'uuid', 'Demo Family', 'Seeded family', u.id, NOW(), NOW()
            # Need to match this line and duplicate `u.id`.
            # `u.id` is the user id.
            # Replace `u.id,` with `u.id, u.id,`
            if 'u.id, NOW(), NOW()' in line:
                line = line.replace('u.id, NOW(), NOW()', 'u.id, u.id, NOW(), NOW()')
            new_lines.append(line)
            continue
            
        # 3. Fix Admin Circle Members (Line ~378)
        if stripped.startswith('INSERT INTO circle_members') and 'SELECT' in lines[lines.index(line)+1]: 
            # This logic is tricky with iterator.
            # Just check if 'SELECT' follows?
            # Or identify by content?
            # Admin block is near end.
            pass
        
        # Simple string match for Admin Members Header
        if 'INSERT INTO circle_members' in line and 'SELECT' not in line: 
            # Header line.
            # If it still has `status`, remove it.
            # If it still has `created_at`, remove it.
            # `fix_seed_sql_part3` fixed headers globally?
            # `if stripped.startswith('INSERT INTO circle_members'):`. Yes.
            # So header should be clean: `(id, circle_id, user_id, role, joined_at)`
            # BUT the SELECT statement needs fixing.
            pass
            
        if stripped.startswith('SELECT') and 'active' in line and 'admin' in line:
            # This is the members SELECT
            # SELECT 'uuid', 'uuid', u.id, 'admin', 'active', NOW(), NOW(), NOW()
            # Remove 'active', and 2 NOWs.
            # `u.id, 'admin', 'active', NOW(), NOW(), NOW()`
            # -> `u.id, 'admin', NOW()`
            
            line = line.replace("'active', ", "")
            # Remove NOWs.
            # `NOW(), NOW(), NOW()` -> `NOW()`
            line = line.replace("NOW(), NOW(), NOW()", "NOW()")
            new_lines.append(line)
            continue
            
        new_lines.append(line)

    with open(SEED_FILE, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    print("Fixed seed.sql admin items")

if __name__ == '__main__':
    fix_seed_admin()
