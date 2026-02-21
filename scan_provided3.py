import re
import json

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

prisma_regex = re.compile(r'prisma\.\$(?:executeRaw|queryRaw)(?:Unsafe<.*?>|<.*?>)?\(\s*`([^`]+)`', re.DOTALL)
table_regex = re.compile(r'(?i)\b(?:FROM|JOIN|INTO|UPDATE)\s+([a-zA-Z_][a-zA-Z0-9_]*)\b')

ok_keywords = {'select', 'where', 'as', 'group', 'by', 'order', 'left', 'right', 'inner', 'outer', 'unnest', 'lateral', 'cross', 'json_array_elements', 'json_array_elements_text', 'distinct', 'public', 'admin', 'bondarys', 'set', 'folder_path'}

results = []

for fpath in files:
    try:
        with open(fpath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        matches = prisma_regex.finditer(content)
        for match in matches:
            query = match.group(1)
            tables = table_regex.finditer(query)
            for t_match in tables:
                table_name = t_match.group(1).lower()
                full_match_end = t_match.end(1)
                
                if full_match_end < len(query) and query[full_match_end] == '.':
                    continue 

                if table_name not in ok_keywords:
                    # check if the word is followed by a dot in the original query string
                    # e.g., "public" in "public.users"
                    
                    results.append({
                        "file": fpath,
                        "unprefixed_table": table_name,
                        "query": query.strip()
                    })
    except Exception as e:
        pass

with open("scan_results.json", "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2)

print(f"Wrote {len(results)} issues to scan_results.json")
