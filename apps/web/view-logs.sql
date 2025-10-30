SELECT 
    id,
    level,
    message,
    "userId",
    environment,
    "createdAt"
FROM "ErrorLog"
ORDER BY "createdAt" DESC
LIMIT 50;

