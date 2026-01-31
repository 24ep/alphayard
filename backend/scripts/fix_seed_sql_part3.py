import re

SEED_FILE = 'src/database/seed.sql'

def fix_seed_3():
    with open(SEED_FILE, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    new_lines = []
    
    in_notes = False
    in_members = False
    
    for line in lines:
        stripped = line.strip()
        
        # 1. TRUNCATE notes
        if stripped == 'notes,':
            # Remove line
            continue
            
        # 2. INSERT INTO notes
        if stripped.startswith('INSERT INTO notes'):
            in_notes = True
            continue
        
        if in_notes:
            if stripped.endswith(';'):
                in_notes = False
            continue
            
        # 3. circle_members 'active' removal (stronger regex)
        if stripped.startswith('INSERT INTO circle_members'):
            in_members = True
            # Header fix: check if 'status' still there (complex fix might have missed)
            # line = ... (..., role, status, joined_at...
            line = line.replace(' role, status, ', ' role, ')
            line = line.replace(', status,', ',') # generalized
            new_lines.append(line)
            continue
            
        if in_members and stripped.startswith('('):
            # Values: ... 'admin', 'active', NOW() ...
            # Regex to remove 'active' (or "active"?) usually single quotes in SQL.
            # Remove any string literal that looks like status?
            # 'active', 'pending', 'inactive'?
            # seed.sql uses 'active'.
            # replace `'active',` with explicit empty string? No, remove.
            
            # match `'active', `
            line = re.sub(r"'active',\s*", "", line)
            
            new_lines.append(line)
            if line.strip().endswith(';'):
                in_members = False
            continue

        new_lines.append(line)

    with open(SEED_FILE, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    print("Fixed seed.sql part 3")

if __name__ == '__main__':
    fix_seed_3()
