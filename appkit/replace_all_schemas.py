import re
import os

filepath = r"e:\GitCloneProject\boundary\appkit\prisma\schema.prisma"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace any @@schema(...) with @@schema("public")
new_content = re.sub(r'@@schema\("[^"]+"\)', '@@schema("public")', content)

if new_content != content:
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Updated schema.prisma")
else:
    print("No changes needed.")
