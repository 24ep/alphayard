import os

SEED_FILE = 'src/database/seed.sql'

def update_seed():
    if not os.path.exists(SEED_FILE):
        print(f"File {SEED_FILE} not found (cwd: {os.getcwd()})")
        return

    with open(SEED_FILE, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace family_id with circle_id
    new_content = content.replace('family_id', 'circle_id')
    
    # Also replace index names if they contained family_id
    # e.g. idx_messages_family_id -> idx_messages_circle_id
    # The simple replace covers this!
    
    if content != new_content:
        print(f"Updating {SEED_FILE}")
        with open(SEED_FILE, 'w', encoding='utf-8') as f:
            f.write(new_content)
    else:
        print("No changes needed.")

if __name__ == '__main__':
    update_seed()
