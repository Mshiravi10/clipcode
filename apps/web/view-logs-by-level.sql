SELECT 
    level,
    COUNT(*) as count,
    MAX("createdAt") as latest_error
FROM "ErrorLog"
GROUP BY level
ORDER BY count DESC;

