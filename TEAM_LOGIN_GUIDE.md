# 🔐 Team Login Credentials Guide

## ✅ **Problem Fixed!**

Your teammate's login issues have been resolved. The problem was **inconsistent password hashing** in the database.

## 👥 **Available User Accounts**

Here are all the user accounts your teammates can use:

### **Admin Accounts:**
```
Email: student@learnquest.com
Password: pass123
Role: Admin

Email: admin@learnquest.com  
Password: admin123
Role: Admin
```

### **Student Accounts:**
```
Email: gokul@gmail.com
Password: gokul123
Role: Student

Email: varun@gmail.com
Password: varun123
Role: Student

Email: test@example.com
Password: test123
Role: Student
```

## 🚀 **Setup Instructions for Teammates**

### **Step 1: Import Database**
```bash
python scripts/import_database.py database_export_20251023_092641.zip
```

### **Step 2: Start Services**
```bash
docker-compose up
```

### **Step 3: Login**
1. Go to `http://localhost:3000`
2. Use any of the credentials above
3. Click "Sign In"

## 🔧 **What Was Fixed**

- ✅ **Password hashes standardized** - All users now use proper bcrypt hashing
- ✅ **Consistent authentication** - Login works the same for all users
- ✅ **Database exported** - Latest version with fixed passwords
- ✅ **Team credentials documented** - Clear login information

## 🎯 **Recommended Login Accounts**

### **For Development/Testing:**
- Use `student@learnquest.com` (Admin access)
- Use `gokul@gmail.com` or `varun@gmail.com` (Student access)

### **For Production Demo:**
- Use `admin@learnquest.com` (Admin access)
- Use `test@example.com` (Student access)

## 🔄 **Future Updates**

When you add new users or modify existing ones:

1. **Export database:** `python scripts/export_database.py`
2. **Share new zip file** with team
3. **They import:** `python scripts/import_database.py [new_zip_file]`

## 🛠️ **Troubleshooting**

### **If login still doesn't work:**

1. **Check services are running:**
   ```bash
   docker-compose ps
   ```

2. **Check API logs:**
   ```bash
   docker-compose logs api
   ```

3. **Reset database:**
   ```bash
   docker-compose down -v
   docker-compose up
   ```

4. **Re-import database:**
   ```bash
   python scripts/import_database.py database_export_20251023_092641.zip
   ```

### **Common Issues:**

- **"Invalid credentials"** → Use exact email/password from list above
- **"Connection refused"** → Make sure `docker-compose up` is running
- **"User not found"** → Re-import the database

## 📞 **Need Help?**

If teammates still have issues:
1. Share this guide with them
2. Make sure they use the latest zip file: `database_export_20251023_092641.zip`
3. Check that all services are running properly

## 🎉 **Success!**

Your teammates should now be able to login successfully with any of the accounts listed above!
