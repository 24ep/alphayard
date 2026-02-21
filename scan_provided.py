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

sql_table_pattern = re.compile(r'(?i)\b(?:FROM|JOIN|INTO|UPDATE)\s+([a-z_][a-z0-9_]*)(?!\.)\b')
ignore_tables = {'select', 'where', 'as', 'group', 'by', 'order', 'left', 'right', 'inner', 'outer', 'unnest', 'lateral', 'cross', 'json_array_elements', 'json_array_elements_text', 'distinct', 'public', 'admin', 'bondarys'}

for fpath in files:
    try:
        with open(fpath, 'r', encoding='utf-8') as f:
            content = f.read()
            lines = content.split('\n')
            
            in_sql = False
            for i, line in enumerate(lines):
                if 'core' in line.lower() and 'score' not in line.lower():
                    print(f"[CORE_FOUND] {fpath}:{i+1} => {line.strip()}")
                
                if 'queryRaw' in line or 'executeRaw' in line or (in_sql and '`' in line):
                    if 'queryRaw' in line or 'executeRaw' in line:
                         # Very basic detection of template literals starting
                         if '`' in line:
                             in_sql = True

                    if in_sql:
                        words = line.split()
                        for j, w in enumerate(words):
                            w_upper = w.upper()
                            if w_upper in ['FROM', 'JOIN', 'INTO', 'UPDATE']:
                                if j + 1 < len(words):
                                    next_words = words[j+1]
                                    clean_nxt = re.sub(r'[^a-zA-Z0-9_\.]', '', next_words)
                                    if clean_nxt and '.' not in clean_nxt and clean_nxt.lower() not in ignore_tables:
                                        print(f"[UNPREFIXED_TABLE_POSSIBLE] {fpath}:{i+1} => {line.strip()} (Matched: {clean_nxt})")
                    
                    if '`' in line and (line.count('`') % 2 != 0 or not in_sql):
                         # this is very crude, but it might flip back to false
                         if not ('queryRaw' in line and line.count('`') == 2):
                             in_sql = not in_sql
                             
    except Exception as e:
        print(f"Error checking {fpath}: {e}")
