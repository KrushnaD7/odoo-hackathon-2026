# Dayflow HRMS Setup Guide

## Quick Setup Steps

### 1. Install Dependencies ✅
```bash
npm install
```
**Status**: Completed

### 2. Environment Configuration ✅
The `.env` file has been created with default values. 

**⚠️ IMPORTANT**: Update the following in `.env`:
- `DATABASE_URL`: Update with your PostgreSQL credentials
  - Format: `postgresql://username:password@host:port/database_name`
  - Default: `postgresql://postgres:postgres@localhost:5432/dayflow_db`
  - **Update the username and password** if different

### 3. PostgreSQL Setup

Make sure PostgreSQL is installed and running on your system.

#### Option A: Using the Setup Script (Recommended)
```bash
npm run setup-db
```

This script will:
- Create the database if it doesn't exist
- Run all migrations
- Set up the schema

#### Option B: Manual Setup
```bash
# 1. Create database
createdb dayflow_db

# 2. Run migration
psql -d dayflow_db -f src/migrations/001_initial_schema.sql
```

**On Windows (if psql is in PATH):**
```powershell
# Create database
createdb -U postgres dayflow_db

# Run migration
psql -U postgres -d dayflow_db -f src\migrations\001_initial_schema.sql
```

### 4. Seed Initial Data (Optional)
Create a default admin user:
```bash
npm run seed
```

This creates:
- **Employee ID**: ADMIN001
- **Email**: admin@dayflow.com
- **Password**: Admin@123 (or set ADMIN_PASSWORD in .env)

**⚠️ Change the default password after first login!**

### 5. Start the Server
```bash
npm run dev
```

The server will start on `http://localhost:3000`

### 6. Verify Setup
Test the health endpoint:
```bash
curl http://localhost:3000/api/health
```

Or open in browser: http://localhost:3000/api/health

## Troubleshooting

### Database Connection Errors

**Error: "password authentication failed"**
- Update the DATABASE_URL in `.env` with correct credentials
- Make sure PostgreSQL is running

**Error: "database does not exist"**
- Run the setup script: `npm run setup-db`
- Or manually create: `createdb dayflow_db`

**Error: "relation does not exist"**
- Run the migration: `npm run setup-db`
- Or manually: `psql -d dayflow_db -f src/migrations/001_initial_schema.sql`

### Port Already in Use

If port 3000 is already in use:
- Change PORT in `.env` file
- Or stop the service using port 3000

## Next Steps

1. ✅ Dependencies installed
2. ✅ Environment file created
3. ⏭️ Set up database (run `npm run setup-db`)
4. ⏭️ Seed admin user (optional, run `npm run seed`)
5. ⏭️ Start server (run `npm run dev`)
6. ⏭️ Test API endpoints (see TEST_API.md)

## API Documentation

Once the server is running, you can:
- View API documentation: See `TEST_API.md`
- Test endpoints: Use Postman, curl, or any HTTP client
- Health check: `GET http://localhost:3000/api/health`

## Default Admin Credentials (After Seeding)

```
Employee ID: ADMIN001
Email: admin@dayflow.com
Password: Admin@123
```

**Remember to change the password after first login!**

