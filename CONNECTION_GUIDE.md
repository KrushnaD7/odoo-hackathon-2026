# Frontend-Backend Connection Guide

## ✅ Connection Status

**Backend is running and accessible!**
- Health check endpoint: ✅ Working
- Backend URL: `http://localhost:3000/api`
- Frontend URL: `http://localhost:5173` (Vite default)

## 🔍 Issues Found

### 1. Rate Limiting (429 Errors)
The backend has strict rate limiting on auth endpoints:
- **5 signup/login attempts per 15 minutes** per IP address
- This is why you're seeing "Too many requests" errors

**Solution:**
- Wait 15 minutes after hitting the rate limit
- Or restart the backend server to reset the rate limit counter
- Or modify the rate limit in `Backend/src/app.js` (lines 35-45)

### 2. Network Connection
The frontend is correctly configured to connect to:
- `http://localhost:3000/api` (from `Frontend/src/utils/constants.js`)

## 🧪 Testing Connection

### Test 1: Backend Health Check
```bash
curl http://localhost:3000/api/health
```
Expected: `{"success":true,"message":"API is running",...}`

### Test 2: Frontend Connection
1. Open browser DevTools (F12)
2. Go to Network tab
3. Try to sign up or sign in
4. Check if requests are going to `http://localhost:3000/api/auth/signup` or `/signin`

### Test 3: Check Console Errors
Look for:
- `ECONNREFUSED` = Backend not running
- `429 Too Many Requests` = Rate limit hit (wait 15 minutes)
- `CORS error` = CORS configuration issue
- `401 Unauthorized` = Invalid credentials

## 🔧 Troubleshooting Steps

### Step 1: Verify Backend is Running
```bash
cd Backend
npm run dev
```
You should see: `Server is running on port 3000`

### Step 2: Verify Frontend is Running
```bash
cd Frontend
npm run dev
```
You should see: `Local: http://localhost:5173`

### Step 3: Check Rate Limit
If you've been testing multiple times, you may have hit the rate limit:
- **Wait 15 minutes** OR
- **Restart the backend server** to reset the counter

### Step 4: Test with Fresh Attempt
1. Make sure both servers are running
2. Wait if you hit rate limit
3. Try creating a new account with unique email/employee_id
4. Check browser console for detailed error messages

## 📋 Common Issues & Solutions

### Issue: "Cannot connect to server"
**Cause:** Backend not running
**Solution:** Start backend with `npm run dev` in Backend folder

### Issue: "Too many requests" (429)
**Cause:** Rate limit exceeded
**Solution:** Wait 15 minutes or restart backend

### Issue: "Email already registered" (409)
**Cause:** Email/Employee ID already exists
**Solution:** Use a different email/employee_id

### Issue: CORS Error
**Cause:** CORS not properly configured
**Solution:** Check `Backend/src/app.js` line 16-19, ensure `FRONTEND_URL` is set or allow all origins

## 🎯 Quick Fix: Reset Rate Limit

If you need to test immediately, you can temporarily increase the rate limit:

**Edit `Backend/src/app.js` line 37:**
```javascript
max: 5, // Change to 100 for testing
```

Or remove rate limiting temporarily for development.

## ✅ Verification Checklist

- [ ] Backend server running on port 3000
- [ ] Frontend server running on port 5173
- [ ] No rate limit errors (wait 15 min if needed)
- [ ] Using unique email/employee_id for signup
- [ ] Browser console shows no CORS errors
- [ ] Network tab shows requests reaching backend

## 📞 Next Steps

1. **If backend not running:** Start it with `npm run dev` in Backend folder
2. **If rate limited:** Wait 15 minutes or restart backend
3. **If still not working:** Check browser console for specific error messages
4. **Test connection:** Use the health check endpoint to verify backend is accessible

