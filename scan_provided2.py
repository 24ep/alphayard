import re

files = [
    r"e:\GitCloneProject\boundary\appkit\src\server\models\ApplicationModel.ts",
    r"e:\GitCloneProject\boundary\appkit\src\components\database\CreateSchemaModal.tsx",
    r"e:\GitCloneProject\boundary\appkit\src\server\routes\admin\admin.ts",
    r"e:\GitCloneProject\boundary\appkit\src\server\routes\admin\adminSubscriptionsRoutes.ts",
    r"e:\GitCloneProject\boundary\appkit\src\server\routes\admin\adminUsersRoutes.ts",
    r"e:\GitCloneProject\boundary\appkit\src\server\routes\admin\dynamicContentRoutes.ts",
    r"e:\GitCloneProject\boundary\appkit\src\server\routes\admin\identityRoutes.ts",
    r"e:\GitCloneProject\boundary\appkit\src\server\routes\admin\index.ts",
    r"e:\GitCloneProject\boundary\appkit\src\server\routes\admin\common\index.ts",
    r"e:\GitCloneProject\boundary\bondary-backend\src\routes\health.ts",
    r"e:\GitCloneProject\boundary\bondary-backend\src\routes\admin\boundary\circlesRoutes.ts",
    r"e:\GitCloneProject\boundary\bondary-backend\src\routes\admin\boundary\index.ts",
    r"e:\GitCloneProject\boundary\bondary-backend\src\routes\admin\boundary\socialRoutes.ts",
    r"e:\GitCloneProject\boundary\bondary-backend\src\routes\mobile\social.ts",
    r"e:\GitCloneProject\boundary\bondary-backend\src\services\chatService.ts",
    r"e:\GitCloneProject\boundary\bondary-backend\src\services\circleService.ts",
    r"e:\GitCloneProject\boundary\bondary-backend\src\services\EntityService.ts",
    r"e:\GitCloneProject\boundary\bondary-backend\src\services\fileManagementService.ts",
    r"e:\GitCloneProject\boundary\bondary-backend\src\services\storageService.ts",
    r"e:\GitCloneProject\boundary\bondary-backend\src\services\social\enhancedFollowService.ts",
    r"e:\GitCloneProject\boundary\bondary-backend\src\services\social\bookmarksService.ts",
    r"e:\GitCloneProject\boundary\bondary-backend\src\services\social\followService.ts",
    r"e:\GitCloneProject\boundary\bondary-backend\src\services\social\hashtagsService.ts"
]

# Look for prisma.$queryRaw, prisma.$executeRaw
prisma_regex = re.compile(r'prisma\.\$(?:executeRaw|queryRaw)(?:Unsafe<.*?>|<.*?>)?\(\s*`([^`]+)`', re.DOTALL)
table_regex = re.compile(r'(?i)\b(?:FROM|JOIN|INTO|UPDATE)\s+([a-zA-Z_][a-zA-Z0-9_]*)\b')

ok_keywords = {'select', 'where', 'as', 'group', 'by', 'order', 'left', 'right', 'inner', 'outer', 'unnest', 'lateral', 'cross', 'json_array_elements', 'json_array_elements_text', 'distinct', 'public', 'admin', 'bondarys'}

issues_found = []

for fpath in files:
    try:
        with open(fpath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        matches = prisma_regex.finditer(content)
        for match in matches:
            query = match.group(1)
            
            # Find all table names following FROM, JOIN, INTO, UPDATE
            tables = table_regex.finditer(query)
            for t_match in tables:
                table_name = t_match.group(1).lower()
                
                # If table name is not prefixed with a schema, and it's not a generic SQL keyword
                # We specifically check if the matched word is NOT "public" or "admin" or "bondarys"
                # If we matched just "users" instead of "public.users"
                
                # To be sure we didn't just match the "public" part of "public.users"
                # Let's see what's after this word in the query.
                full_match_end = t_match.end(1)
                
                # Check if there is a dot right after the match
                if full_match_end < len(query) and query[full_match_end] == '.':
                    continue # it's a schema prefix basically
                
                if table_name not in ok_keywords:
                    # It's an unprefixed table
                    issues_found.append(f"[{fpath}]\nFound query:\n{query.strip()}\nUnprefixed table possible: {table_name}\n")
    except Exception as e:
        print(f"Error: {e}")

if issues_found:
    print(f"Found {len(issues_found)} potential unprefixed tables.")
    for issue in issues_found:
        print(issue)
        print("-" * 50)
else:
    print("No unprefixed tables found in `prisma.$queryRaw` backtick blocks.")
