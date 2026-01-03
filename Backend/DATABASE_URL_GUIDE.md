# PostgreSQL Connection URL Guide

## URL Format

```
postgresql://username:password@host:port/database_name
```

## For Your HR_TOOL Database

Based on your setup, the URL should be:

```
postgresql://postgres:postgres@localhost:5432/HR_TOOL
```

**Breakdown:**
- `postgresql://` - Protocol
- `postgres` - Username (first occurrence)
- `postgres` - Password (second occurrence)
- `localhost` - Host (your local machine)
- `5432` - Port (default PostgreSQL port)
- `HR_TOOL` - Database name

## ⚠️ Important Notes

### If Your Credentials Are Different:

1. **Find your PostgreSQL username:**
   - Usually `postgres` by default
   - Or check your PostgreSQL installation settings

2. **Find your PostgreSQL password:**
   - The password you set during PostgreSQL installation
   - Or check your PostgreSQL configuration

3. **Update the URL:**
   ```
   postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/HR_TOOL
   ```

### Common Variations:

**If PostgreSQL is on a different port:**
```
postgresql://postgres:postgres@localhost:5433/HR_TOOL
```

**If PostgreSQL is on a remote server:**
```
postgresql://postgres:postgres@192.168.1.100:5432/HR_TOOL
```

**If no password (not recommended for production):**
```
postgresql://postgres@localhost:5432/HR_TOOL
```

## Update .env File

Your `.env` file should have:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/HR_TOOL
```

**Replace `postgres:postgres` with your actual username and password!**

## Test Connection

After updating `.env`, test the connection:

```bash
node -e "const {Client} = require('pg'); require('dotenv').config(); const client = new Client({connectionString: process.env.DATABASE_URL}); client.connect().then(() => {console.log('✅ Connected to HR_TOOL database!'); client.end();}).catch(err => {console.log('❌ Connection failed:', err.message);});"
```

## Next Steps

1. ✅ Database created: `HR_TOOL`
2. ⏭️ Update `.env` with correct credentials
3. ⏭️ Run migrations: `npm run setup-db`
4. ⏭️ Start server: `npm run dev`

