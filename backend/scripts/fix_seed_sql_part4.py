import re

SEED_FILE = 'src/database/seed.sql'

def fix_seed_4():
    with open(SEED_FILE, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    new_lines = []
    
    in_chat = False
    
    for line in lines:
        stripped = line.strip()
        
        # chat_rooms
        if stripped.startswith('INSERT INTO chat_rooms'):
            # Header fix
            # replace 'description, type, created_by,' with 'type,'
            line = line.replace('description, type, created_by,', 'type,')
            new_lines.append(line)
            in_chat = True
            continue
            
        if in_chat and stripped.startswith('('):
            # Parse values.
            # ('uuid', 'uuid', 'name', 'desc', 'type', 'creator', NOW(), NOW())
            # Split by comma is risky if description has comma.
            # Description is quoted: 'Main hourse group chat'.
            # Name: 'Doe hourse Chat'.
            # Type: 'hourse'.
            # Creator: 'uuid'.
            
            # Simple approach: Description is 4th item. Type 5th. Creator 6th.
            # But wait, header replacement was: desc, type, created_by removed.
            # Indices:
            # 0: id
            # 1: circle_id
            # 2: name
            # 3: description
            # 4: type
            # 5: created_by
            # 6: created_at
            # 7: updated_at
            
            # Regex to match `'([^']*)', '([^']*)', '([^']*)', '([^']*)', '([^']*)', '([^']*)'` ...
            # 6 quoted strings?
            # 0: id
            # 1: circle_id
            # 2: name
            # 3: desc
            # 4: type
            # 5: creator
            
            # We want to remove 3 and 5.
            # Regex: `('...', '...', '...'), '...', ('...', '...', ...)`
            # Replace: `\1, \3, ...`
            
            # Let's try matching the sequence.
            # matches = re.findall(r"'[^']*'", line)
            # if len(matches) >= 6:
            #    desc = matches[3]
            #    creator = matches[5]
            #    line = line.replace(f", {desc}", "")
            #    line = line.replace(f", {creator}", "")
            
            # This is safer than split.
            matches = re.findall(r"'[^']*'", line)
            if len(matches) >= 6:
                desc = matches[3]
                creator = matches[5]
                # Assuming comma and space before.
                # Remove `(comma) (space) (desc)`
                line = line.replace(f", {desc}", "", 1)
                # Remove `(comma) (space) (creator)`
                line = line.replace(f", {creator}", "", 1)
                
            new_lines.append(line)
            if line.strip().endswith(';'):
                in_chat = False
            continue

        new_lines.append(line)

    with open(SEED_FILE, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    print("Fixed seed.sql part 4")

if __name__ == '__main__':
    fix_seed_4()
