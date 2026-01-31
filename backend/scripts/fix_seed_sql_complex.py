import re

SEED_FILE = 'src/database/seed.sql'

def fix_seed():
    with open(SEED_FILE, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    new_lines = []
    
    # State tracking
    in_circles = False
    in_members = False
    in_events = False
    skip_event_attendees = False
    
    for line in lines:
        stripped = line.strip()
        
        # 1. Fix circles insert
        if stripped.startswith('INSERT INTO circles'):
            # Update header
            line = line.replace('created_by, created_at', 'created_by, owner_id, created_at')
            new_lines.append(line)
            in_circles = True
            continue
        
        if in_circles and stripped.startswith('('):
            # Parse value line: ('uuid', 'name', 'desc', 'creator_uuid', NOW(), NOW())
            # Regex to capture content inside parens? 
            # Or just split by comma? (Names might have commas? No, names are simple in seed).
            # The UUIDs are single quoted.
            # Find the position of 'created_by' UUID. It is the 4th item.
            # Items: id, name, description, created_by, ...
            
            # Simple approach: find the 4th quoted string and insert it again.
            parts = stripped.split(',')
            # parts indices:
            # 0: ('id'
            # 1: 'name'
            # 2: 'desc'
            # 3: 'created_by'
            # 4+: dates
            
            if len(parts) >= 6:
                creator = parts[3].strip() # 'uuid'
                # Check consistency
                if "'" in creator:
                   # Insert creator after itself
                   parts.insert(4, " " + creator)
                   new_line = ",".join(parts)
                   # Fix the potential issue if last item had `);`
                   # parts[-1] would be `NOW());` or similar.
                   # If we inserted in middle, it should be fine.
                   if line.endswith(';\n') and not new_line.endswith(';\n'):
                       # Reconstruct line carefully?
                       # Just join by comma.
                       pass
                   
                   # Reconstructing:
                   # original: ('...', '...', '...', 'creator', NOW(), NOW())
                   # new:      ('...', '...', '...', 'creator', 'creator', NOW(), NOW())
                   new_lines.append(new_line)
                else:
                   new_lines.append(line) # unexpected format
            else:
                new_lines.append(line)
            
            if line.strip().endswith(';'):
                in_circles = False
            continue

        # 2. Fix circle_members insert
        if stripped.startswith('INSERT INTO circle_members'):
            # Remove status
            line = line.replace(', status,', ',')
            new_lines.append(line)
            in_members = True
            continue

        if in_members and stripped.startswith('('):
            # Remove 'active' value
            # Values: id, circle_id, user_id, role, 'active', joined_at...
            # 'active' is 5th item (index 4).
            line = line.replace(", 'active',", ",")
            new_lines.append(line)
            
            if line.strip().endswith(';'):
                in_members = False
            continue

        # 3. Fix events -> calendar_events
        if stripped.startswith('INSERT INTO events'):
            line = line.replace('INSERT INTO events', 'INSERT INTO calendar_events')
            new_lines.append(line)
            # No changes to values needed? Columns match `calendar_events` schema?
            # seed: id, circle_id, title, description, start_time, end_time, location, type, created_by, created_at, updated_at
            # schema: id, circle_id, created_by, title, description, start_time, end_time, ..., location, ...
            # Schema order differs: created_by is 3rd. Seed has it 9th.
            # INSERT statement specifies columns, so order is fine IF columns exist.
            # Schema has `type`? NO. `calendar_events` does NOT have `type`.
            # `calendar_events` has `is_all_day`, `attendees`, `reminder_minutes`, `is_recurring`.
            # Seed has `type`.
            # I must REMOVE `type` usage.
            
            # Header line: remove `type,`
            # Value lines: remove `'type_value',`
            
            # I need to process header.
            header_match = re.search(r'INSERT INTO events \((.*)\)', line) # it's now calendar_events
            # Ah I replaced line contents in `new_lines`.
            # Re-read line content from new_lines[-1] or manipulate `line` directly.
            
            line = line.replace('type, ', '') 
            # CAUTION: 'type' might be substring? 'message_type'? No, 'type' is distinct column name.
            
            # Re-replace logic above:
            # line = line.replace('INSERT INTO events', 'INSERT INTO calendar_events')
            new_lines.pop() # Remove previous append
            new_lines.append(line)
            
            in_events = True
            continue

        if in_events and stripped.startswith('('):
            # Remove type value.
            # Values: id, circle, title, desc, start, end, loc, 'type', created_by...
            # Type is 8th item (index 7).
            # e.g. 'hourse', 'medical', 'education'.
            # I can regex replace `'hourse',` etc.
            line = re.sub(r"'(hourse|medical|education)', ", "", line)
            new_lines.append(line)
            
            if line.strip().endswith(';'):
                in_events = False
            continue

        # 4. Remove event_attendees
        if stripped.startswith('INSERT INTO event_attendees'):
            skip_event_attendees = True
            # Don't append
            continue
        
        if skip_event_attendees:
            if stripped.endswith(';'):
                skip_event_attendees = False
            continue
            
        new_lines.append(line)

    with open(SEED_FILE, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    print("Fixed seed.sql complex issues")

if __name__ == '__main__':
    fix_seed()
