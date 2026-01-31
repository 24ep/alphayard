import os
import re

MIGRATIONS_DIR = 'src/database/migrations'

replacements = [
    (r'REFERENCES families', 'REFERENCES circles'),
    (r'ALTER TABLE families', 'ALTER TABLE circles'),
    (r'UPDATE families', 'UPDATE circles'),
    (r'INSERT INTO families', 'INSERT INTO circles'),
    (r'family_members', 'circle_members'), # Table name and potentially references
    (r'ids_families', 'ids_circles'), # specific index case if exists
    (r'idx_families', 'idx_circles')
]

# Careful with 'family_members' -> 'circle_members' logic.
# If I have 'families' table, I want 'circles'.
# If I have 'family_members', I want 'circle_members'.

def fix_migration(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Specific replacements
    content = content.replace('REFERENCES families', 'REFERENCES circles')
    content = content.replace('ALTER TABLE families', 'ALTER TABLE circles')
    content = content.replace('UPDATE families', 'UPDATE circles')
    content = content.replace('INSERT INTO families', 'INSERT INTO circles')
    
    # Be careful with table names
    content = content.replace('TABLE family_members', 'TABLE circle_members')
    content = content.replace('ON family_members', 'ON circle_members')
    
    # Also simple table references if they are just the word "families" or "family_members" in SQL context?
    # But I want to avoid replacing "family_id" column name unless instructed.
    
    if content != original_content:
        print(f"Updating {filepath}")
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

def main():
    if not os.path.exists(MIGRATIONS_DIR):
        print(f"Directory {MIGRATIONS_DIR} not found.")
        return

    for filename in os.listdir(MIGRATIONS_DIR):
        if filename.endswith('.sql'):
            fix_migration(os.path.join(MIGRATIONS_DIR, filename))

if __name__ == '__main__':
    main()
