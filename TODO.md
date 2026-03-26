# Deployment TODO

## Plan Steps:

### 1. Git Setup (Pending Git install)
- [x] Create .gitignore
- [ ] Install Git
- [ ] `git init`
- [ ] `git add .`
- [ ] `git commit -m "Initial commit"`
- [ ] Push to GitHub

### 2. Code Edits for Deploy ✅ COMPLETE
- [x] Update backend/server.js: process.env.PORT
- [x] Update frontend/vite.config.js: base='/', env API URL
- [x] Add vercel.json for rewrites
- [x] Fixed hardcoded localhost APIs in KnockoutStages.jsx
- [x] Created .env.example

### 3. Frontend Deploy (Vercel/Netlify)
- [ ] Create GitHub repo
- [ ] Connect to Vercel (frontend dir)
- [ ] Test npm run build
- [ ] Deploy

### 4. Backend Deploy (Render)
- [ ] Connect backend dir to Render Web Service
- [ ] Build: npm install
- [ ] Start: npm start
- [ ] Note: Free tier ephemeral data (resets on restart)

### 5. Connect & Test ✅
- [ ] Update vercel.json rewrite destination to backend URL
- [ ] Redeploy frontend
- [ ] Test live app (login admin/admin123)

**Progress: 3/5**
