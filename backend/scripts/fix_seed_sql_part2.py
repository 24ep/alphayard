import re

SEED_FILE = 'src/database/seed.sql'

def fix_seed_2():
    with open(SEED_FILE, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    new_lines = []
    
    in_members = False
    
    for line in lines:
        stripped = line.strip()
        
        # 1. TRUNCATE events -> calendar_events
        # It's a list. 'events,' -> 'calendar_events,'
        if stripped == 'events,':
            line = line.replace('events,', 'calendar_events,')
        
        # 2. circle_members columns
        if stripped.startswith('INSERT INTO circle_members'):
            # remove ', created_at, updated_at'
            line = line.replace(', created_at, updated_at', '')
            in_members = True
            new_lines.append(line)
            continue
            
        if in_members and stripped.startswith('('):
            # remove last 2 values: ', NOW(), NOW())'
            # Regex: replace ', NOW(), NOW())' with ')'
            # Be careful with spacing.
            # line usually ends with: ... 'active', NOW(), NOW(), NOW());
            # Wait, I removed 'active' in complex fix.
            # Now it probably ends with: ... 'admin', NOW(), NOW(), NOW());
            # 'joined_at' is one NOW(). 'created_at', 'updated_at' are others.
            # So we have 3 NOWs?
            # 001 schema: joined_at DEFAULT NOW().
            # seed sql has `joined_at` in header.
            # So we keep ONE NOW(). Remove TWO.
            # line: ... , NOW(), NOW(), NOW());
            # replace with ... , NOW());
            
            # Use rfind to locate last part?
            # or regex sub `NOW\(\)\s*,\s*NOW\(\)\s*\)` -> `)` ?
            # line usually ends with `NOW(), NOW());` or `NOW(), NOW()),`
            
            line = re.sub(r',\s*NOW\(\)\s*,\s*NOW\(\)\s*(\)|,)', r'\1', line)
            
            new_lines.append(line)
            if line.strip().endswith(';'):
                in_members = False
            continue
            
        new_lines.append(line)

    with open(SEED_FILE, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    print("Fixed seed.sql part 2")

if __name__ == '__main__':
    fix_seed_2()
