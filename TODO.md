# Deployment TODO

## Plan Steps (Approved - Proceeding):

### 1. Git Setup
- [ ] Install/verify Git
- [ ] `git init`
- [ ] Add remote: git remote add origin https://github.com/jessecodingprojectsbackup-boop/efootball-tournament.git
- [ ] `git add .`
- [ ] `git commit -m \"Initial commit - ready for deployment\"`
- [ ] `git branch -M main`
- [ ] `git push -u origin main`
- [ ] Create GitHub repo if not exists (check https://github.com/jessecodingprojectsbackup-boop/efootball-tournament)

### 2. Frontend Deploy (Vercel)
- [ ] Connect frontend/ to Vercel (GitHub integration)
- [ ] Test: cd frontend && npm install && npm run build
- [ ] Deploy (auto on push)

### 3. Backend Deploy (Render - https://efootball-tournament-2kyd.onrender.com)
- [ ] Connect backend/ to Render Web Service (GitHub repo)
- [ ] Build: npm install
- [ ] Start: npm start
- [ ] Verify running

### 4. Connect & Test
- [ ] Confirm vercel.json rewrites to Render URL
- [ ] Redeploy frontend if needed
- [ ] Test live: admin/admin123 login, create data, knockout flow

**Current Step: 1/4 - Git Setup**  
**Progress: 0/4**
