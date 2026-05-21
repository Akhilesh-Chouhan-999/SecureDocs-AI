# Postman Collection - Quick Reference

**SecureDocs AI Authentication API - Testing Guide**

---

## 📌 Setup (First Time Only)

### Step 1: Import Collection

1. Open Postman
2. Click **Import**
3. Select `SecureDocs-Auth-API.postman_collection.json`

### Step 2: Import Environment

1. Click **Environments** tab
2. Click **Import**
3. Select `Development.postman_environment.json`

### Step 3: Select Environment

- Click dropdown (top right)
- Select **"SecureDocs AI - Development"**

---

## 🎯 Quick Test (2 Minutes)

### Run in Order:

```
1. Click "1. Register"
   - Click "Send"
   - ✓ Should see 201 status
   - ✓ Tokens auto-saved

2. Click "3. Get Profile"
   - Click "Send"
   - ✓ Should see 200 status
   - ✓ Returns user data

3. Click "5. Logout"
   - Click "Send"
   - ✓ Should see 200 status
```

---

## 📊 Available Endpoints

| #   | Method | Endpoint                  | Auth Required |
| --- | ------ | ------------------------- | ------------- |
| 1   | POST   | `/api/auth/register`      | No            |
| 2   | POST   | `/api/auth/login`         | No            |
| 3   | GET    | `/api/auth/profile`       | **Yes** ✓     |
| 4   | POST   | `/api/auth/refresh-token` | No            |
| 5   | POST   | `/api/auth/logout`        | **Yes** ✓     |

---

## 🔑 Default Test Data

Use this to test (modify email each time):

```
Email:    testuser@example.com
Password: TestPass123!
Name:     Test User
Company:  Test Corp
Role:     admin
```

---

## 📝 Request Templates

### Register Request

```json
{
  "email": "testuser@example.com",
  "password": "TestPass123!",
  "name": "Test User",
  "company": "Test Corp",
  "role": "admin"
}
```

### Login Request

```json
{
  "email": "testuser@example.com",
  "password": "TestPass123!"
}
```

### Refresh Token Request

```json
{
  "refreshToken": "{{refreshToken}}"
}
```

---

## 🔐 Token Info

| Token             | Duration | Usage                       |
| ----------------- | -------- | --------------------------- |
| **Access Token**  | 1 hour   | Add to Authorization header |
| **Refresh Token** | 7 days   | Use to get new access token |

### How to Use Token

All protected endpoints need this header:

```
Authorization: Bearer {{accessToken}}
```

Postman auto-adds this when using `{{accessToken}}` variable.

---

## ✅ Success Indicators

### Register / Login Success

- ✓ Status: **201** (Register) or **200** (Login)
- ✓ Response includes: `token` and `refreshToken`
- ✓ Tokens appear in environment variables

### Get Profile Success

- ✓ Status: **200**
- ✓ Response includes: `user` object with name, email, etc.

### Refresh Token Success

- ✓ Status: **200**
- ✓ Response includes: new `token` and `refreshToken`
- ✓ New tokens updated in environment

### Logout Success

- ✓ Status: **200**
- ✓ Response message: "Logged out successfully"

---

## ❌ Common Errors

| Status  | Problem           | Fix                                 |
| ------- | ----------------- | ----------------------------------- |
| **400** | Bad request       | Check JSON syntax                   |
| **401** | Unauthorized      | Token expired? Use Refresh endpoint |
| **422** | Validation failed | Check required fields               |
| **500** | Server error      | Restart backend server              |

---

## 🔄 Typical Testing Flow

### Fresh Start

```
1. Register (creates new account + gets tokens)
   ↓
2. Get Profile (verify you're logged in)
   ↓
3. Logout (end session)
```

### Testing Refresh

```
1. Login (get initial tokens)
   ↓
2. Refresh Token (simulate token expiry)
   ↓
3. Get Profile (verify new token works)
```

### Session Testing

```
1. Register or Login
   ↓
2. Multiple Get Profile requests (verify session persists)
   ↓
3. Logout
   ↓
4. Get Profile (should fail with 401)
```

---

## 💡 Pro Tips

### Tip 1: Use Different Emails

Each test should use a unique email:

```
✓ user1@test.com
✓ user2@test.com
✓ user3@test.com
```

### Tip 2: View Saved Tokens

Click environment dropdown → Look at values:

- `accessToken` - Currently active token
- `refreshToken` - Token refresh value
- `userId` - Current user ID

### Tip 3: Clear Environment (After Testing)

```
1. Click environment dropdown
2. Select "Edit"
3. Clear token values
4. Click "Save"
```

### Tip 4: Test Token Expiry

```
1. Note current access token
2. Wait 1 hour
3. Use same token → Should get 401
4. Use Refresh endpoint → Get new token
```

---

## 🚨 Before You Start

### Checklist

- [ ] Backend server running (`npm run dev`)
- [ ] Environment file imported
- [ ] Environment selected in dropdown
- [ ] `baseUrl` set to `http://localhost:3000` (Development)

### Test Backend Connection

```
1. Open GET request to {{baseUrl}}/api/system/health
2. Click Send
3. Should get 200 response
```

---

## 📞 Need Help?

### Check These First

1. ✓ Is backend running? (`npm run dev`)
2. ✓ Is environment selected? (dropdown top-right)
3. ✓ Is `baseUrl` correct? (should be `http://localhost:3000`)
4. ✓ Check error message in response

### Review Full Guide

See `README.md` in postman folder for detailed documentation.

---

**Remember:**

- 📝 Save all API responses for reference
- 🔐 Keep tokens secure, never commit to git
- 🔄 Token expires after 1 hour
- ✅ Test in order: Register → Profile → Logout

**Happy Testing!** 🚀

---

_Updated: May 21, 2026_
