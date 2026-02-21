import os
import re

directories = [
    r'e:\GitCloneProject\boundary\bondary-backend\src',
    r'e:\GitCloneProject\boundary\appkit\src',
    r'e:\GitCloneProject\boundary\bondary-backend\prisma',
    r'e:\GitCloneProject\boundary\appkit\prisma'
]

# regex to find core. and replace with public.
ts_regex = re.compile(r'\bcore\.([a-zA-Z_0-9]+)\b')
prisma_schema_regex = re.compile(r'@@schema\("core"\)')

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = content
    if filepath.endswith('.ts') or filepath.endswith('.tsx'):
        new_content = ts_regex.sub(r'public.\1', new_content)
    elif filepath.endswith('.prisma'):
        new_content = prisma_schema_regex.sub('@@schema("public")', new_content)
        # Fix the schemas array in bondary-backend
        if 'bondary-backend' in filepath and 'schemas  = [' in new_content:
            new_content = new_content.replace('"core",', '"public",')
            new_content = new_content.replace('"core"', '"public"')
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'Updated: {filepath}')

for directory in directories:
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.ts') or file.endswith('.tsx') or file.endswith('.prisma'):
                process_file(os.path.join(root, file))
print('Done!')
