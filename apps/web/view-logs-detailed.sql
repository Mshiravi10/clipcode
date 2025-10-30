SELECT 
    el.id,
    el.level,
    el.message,
    el."stackTrace",
    el.context,
    el."sessionData",
    el.environment,
    el."ipAddress",
    el."userAgent",
    el."createdAt",
    u.email as user_email,
    u.name as user_name
FROM "ErrorLog" el
LEFT JOIN "User" u ON el."userId" = u.id
ORDER BY el."createdAt" DESC
LIMIT 20;

