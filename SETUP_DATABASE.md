# Database Setup Instructions

## Your PostgreSQL Configuration

```
Host: localhost
Port: 5432
Username: postgres
Password: 123
Database: clipcode
```

## Step 1: Start PostgreSQL

### Option A: If installed as service
```powershell
# Check service
Get-Service -Name *postgres*

# Start service (adjust name as needed)
Start-Service postgresql-x64-14
```

### Option B: Manual start
```powershell
# Navigate to PostgreSQL bin directory (adjust path)
cd "C:\Program Files\PostgreSQL\14\bin"

# Start PostgreSQL
.\pg_ctl.exe -D "C:\Program Files\PostgreSQL\14\data" start
```

### Option C: Check if PostgreSQL is running on port 5432
```powershell
netstat -an | findstr 5432
```

## Step 2: Create Database

Once PostgreSQL is running, create the database:

```powershell
# Connect to PostgreSQL
psql -U postgres

# In psql prompt, run:
CREATE DATABASE clipcode;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
\q
```

Or use pgAdmin:
1. Open pgAdmin
2. Connect to your server
3. Right-click "Databases" → "Create" → "Database"
4. Name: `clipcode`
5. Right-click database → Query Tool
6. Run: `CREATE EXTENSION IF NOT EXISTS pg_trgm;`

## Step 3: Run Prisma Migrations

After database is created and running:

```bash
cd apps/web
pnpm db:push
```

This will create all tables and indexes.

## Step 4: Seed Database (Optional)

Add sample data:

```bash
pnpm db:seed
```

## Step 5: Start Development Server

```bash
cd ../..
pnpm dev
```

## Troubleshooting

### Can't reach database
- Ensure PostgreSQL service is running
- Check port 5432 is not blocked
- Verify credentials in `.env` file

### Permission denied
- Check postgres user password
- Try with superuser account

### Port already in use
- Check if another PostgreSQL instance is running
- Use `netstat` to find what's using port 5432

### Extension error
- Ensure `pg_trgm` extension is available in your PostgreSQL installation

## Alternative: Docker

If PostgreSQL is not installed, use Docker:

```bash
docker run --name clipcode-postgres `
  -e POSTGRES_PASSWORD=123 `
  -e POSTGRES_DB=clipcode `
  -p 5432:5432 `
  -d postgres:14

# Create extension
docker exec -it clipcode-postgres psql -U postgres -d clipcode -c "CREATE EXTENSION IF NOT EXISTS pg_trgm;"
```

## Verify Connection

```bash
# Test connection
psql -h localhost -U postgres -d clipcode
# Password: 123

# Should show prompt: clipcode=#
```


