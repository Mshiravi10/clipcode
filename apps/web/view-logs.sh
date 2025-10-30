#!/bin/bash

echo "=== Error Logs Summary ==="
psql $DATABASE_URL -c "SELECT level, COUNT(*) as count FROM \"ErrorLog\" GROUP BY level ORDER BY count DESC;"

echo ""
echo "=== Recent Errors (Last 10) ==="
psql $DATABASE_URL -c "SELECT id, level, message, \"createdAt\" FROM \"ErrorLog\" ORDER BY \"createdAt\" DESC LIMIT 10;"

echo ""
echo "=== Errors with Stack Traces ==="
psql $DATABASE_URL -c "SELECT id, level, message, \"createdAt\" FROM \"ErrorLog\" WHERE \"stackTrace\" IS NOT NULL ORDER BY \"createdAt\" DESC LIMIT 10;"

