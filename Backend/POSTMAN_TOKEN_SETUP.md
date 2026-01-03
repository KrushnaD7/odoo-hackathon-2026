# How to Save Token in Postman - Step by Step

## 🎯 Goal
After signing in, save the JWT token so it's automatically used in all requests.

## 📍 Where is the "Tests" Tab?

The **Tests** tab is located in the request builder area, below the URL bar. You'll see these tabs:

```
[Params] [Authorization] [Headers] [Body] [Pre-request Script] [Tests] [Settings]
```

**If you don't see it:**
1. The tab bar might be scrolled - try scrolling horizontally
2. Your Postman window might be too narrow - make it wider
3. In newer Postman versions, it might be under a dropdown menu

## 🔧 Method 1: Using Tests Tab (Automatic)

### Step-by-Step:

1. **After sending Sign In request**, look at the response
2. **Find the Tests tab**:
   - Look below the URL input field
   - You'll see tabs: Params, Authorization, Headers, Body, Tests
   - Click on **"Tests"** tab

3. **Add this code** in the Tests tab:
   ```javascript
   if (pm.response.code === 200) {
       var jsonData = pm.response.json();
       pm.environment.set("token", jsonData.data.token);
       console.log("Token saved:", jsonData.data.token);
   }
   ```

4. **Click "Send" again** - the token will be saved automatically!

5. **Verify it worked**:
   - Go to **Environments** (left sidebar)
   - Click on "Dayflow Local"
   - You should see `token` with a value

## 🔧 Method 2: Manual Copy-Paste (Easiest - Recommended)

### Step-by-Step:

1. **Send the Sign In request** (Step 3 from the guide)

2. **Look at the Response**:
   ```json
   {
     "success": true,
     "data": {
       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
     }
   }
   ```

3. **Copy the token**:
   - Select the entire token string (the long text starting with "eyJ...")
   - Copy it (Ctrl+C)

4. **Open Environment Variables**:
   - Click **"Environments"** icon in left sidebar (looks like an eye or folder)
   - Click on **"Dayflow Local"** environment

5. **Set the token**:
   - Find the `token` variable (or create it if it doesn't exist)
   - Click in the **"Current Value"** column
   - Paste your token (Ctrl+V)
   - Click **"Save"** (top right)

6. **Done!** Now all requests using `{{token}}` will automatically use this token.

## 🔧 Method 3: Using Collection Variables

If environment variables don't work:

1. Right-click on your collection → **"Edit"**
2. Go to **"Variables"** tab
3. Add variable:
   - Name: `token`
   - Current Value: (paste your token)
4. Click **"Save"**
5. Use `{{token}}` in Authorization header

## ✅ Verify Token is Working

1. Go to **Step 4: Get Current User**
2. In Authorization tab, select **"Bearer Token"**
3. In the Token field, type: `{{token}}`
4. Send the request
5. If you get a 200 response with user data, the token is working!

## 🐛 Troubleshooting

### "Tests tab not visible"
- **Solution**: Use Method 2 (Manual Copy-Paste) instead

### "Token not saving"
- Make sure you selected the correct environment (top right dropdown)
- Check that the environment variable name is exactly `token`
- Try refreshing Postman

### "{{token}} not working"
- Make sure you selected the environment from the dropdown (top right)
- Check that the token value is set (not empty)
- Verify the token hasn't expired (try signing in again)

## 💡 Pro Tip

After signing in, you can also:
1. Click on the response JSON
2. Right-click on the `token` value
3. Select **"Copy"**
4. Paste it directly into the Authorization header (temporary) or environment variable (permanent)

---

**For most users, Method 2 (Manual Copy-Paste) is the easiest and most reliable!**

