I'll help you create a one-sheet pitch and recommend a tech stack that balances your privacy concerns with practical development needs.

**ONE-SHEET PITCH: Personal Health Optimizer**

**Problem:**
I need a centralized way to track my diet, supplements, and health metrics while managing gout and food allergies. Existing apps like MyFitnessPal lack personalized health optimization and don't account for medical conditions or supplement interactions.

**Solution:**
A personal health dashboard that tracks meals, supplements, and health metrics while providing intelligent recommendations based on my specific health profile (gout, allergies, age 40, active lifestyle).

**MVP Features:**

1. Personal health profile (age, weight, height, allergies, conditions)
2. Daily meal logging with nutritional breakdown
3. Supplement tracker with daily logging
4. Food allergy conflict detection
5. Health score based on nutritional gaps and targets
6. Simple recommendations for supplement/diet improvements
7. Historical timeline of all logged data
8. Macro/micronutrient tracking against targets

**Out of Scope (V1):**

- AI integrations
- Workout tracking
- Bloodwork interpretation
- Meal planning
- Social features
- Mobile apps (web-first)

**Success Metrics:**

- Can log a meal in under 30 seconds
- Daily health score provides actionable insight
- Catches allergy conflicts before logging
- Clear visibility into nutritional gaps
- 2-week historical trend analysis

---

**RECOMMENDED TECH STACK**

Given your privacy concerns and vibe coding approach, here's what I'd recommend:

**Architecture: Hybrid Local + Cloud**

**Frontend:**

- **React** (or Next.js for simplicity) - You mentioned vibe coding, React is great for this
- **Tailwind CSS** - Fast styling without thinking too hard
- **Recharts or Chart.js** - For visualizing health trends
- **shadcn/ui** - Pre-built components to move fast

**Backend/Database Strategy:**

- **Supabase** (public instance) - For the food/nutrition database only
  - Store: USDA foods, recipes, nutritional values
  - This data isn't personal, so cloud storage is fine
- **Local Storage** (your machine) - For personal health data
  - **Option A: SQLite** - Local database file, easy to backup, SQL queries
  - **Option B: JSON files** - Simple, human-readable, version control friendly
  - Store: your profile, daily logs, supplement intake, health metrics

**Why this hybrid approach works:**

- Supabase handles the heavy nutritional database (thousands of foods)
- Your personal data never leaves your machine
- You can still access the food database from anywhere
- Easy to backup your local data (just copy the file)

**Development Setup:**

- **Next.js** - My top recommendation
  - Built-in API routes (can query Supabase and local data)
  - Easy to deploy as static site or run locally
  - File-based routing is intuitive
- **Electron** (optional) - If you want a true desktop app
  - Wraps your web app as a native application
  - Better file system access for local database
  - Can run completely offline

**Specific Tech Stack Recommendation:**

```
Frontend: Next.js + React + Tailwind + shadcn/ui
Charts: Recharts
Food Database: Supabase (PostgreSQL)
Personal Data: SQLite (local file) or JSON files
State Management: React Context or Zustand (lightweight)
Forms: React Hook Form
Date handling: date-fns
Deployment: Run locally or Vercel (frontend only, data stays local)
```

**Data Flow:**

1. User logs meal → App queries Supabase for food nutrition data
2. App calculates nutritional totals
3. App saves log entry to local SQLite/JSON
4. Dashboard reads from local database to display trends/scores

**Local Data Storage Structure (JSON approach):**

```
/data
  /profile.json (your health profile)
  /logs
    /2026-01-17.json (daily log)
    /2026-01-18.json
  /supplements.json (your supplement list)
  /allergies.json (your allergen list)
```

**Local Data Storage (SQLite approach):**

```
health.db
  - profile table
  - daily_logs table
  - meals table
  - supplements_taken table
  - allergies table
```

**My recommendation: Start with SQLite**

- More structured than JSON
- Easy queries for trends/analytics
- Still just a single file you control
- Better performance as data grows
- Tools like DB Browser for SQLite let you manually inspect data

**Supabase Setup (Food Database):**

```
Tables:
  - foods (usda_id, name, calories, protein, carbs, fat, vitamins, minerals)
  - recipes (user_created meal combinations)
  - allergens (which foods contain which allergens)
```

**MVP Development Flow:**

**Phase 1: Foundation (Week 1)**

- Set up Next.js project
- Create basic layout/navigation
- Set up local SQLite connection
- Design database schema

**Phase 2: Profile & Setup (Week 1-2)**

- Build profile input form
- Store allergies and health conditions
- Set nutritional targets based on profile

**Phase 3: Food Database (Week 2)**

- Import USDA data to Supabase
- Build food search interface
- Display nutritional breakdown

**Phase 4: Daily Logging (Week 2-3)**

- Meal logging interface
- Supplement logging
- Save to local database
- Allergy conflict checker

**Phase 5: Dashboard & Scoring (Week 3-4)**

- Calculate daily nutritional totals
- Create health scoring algorithm
- Build trend visualizations
- Generate recommendations

**Alternative: All-Local Approach**

If you want EVERYTHING local:

- Download USDA database once (it's ~500MB JSON)
- Store in local SQLite
- No internet required after initial setup
- Complete privacy but larger initial setup

**Backup Strategy:**

- Local SQLite/JSON files backed up to encrypted external drive
- Or: Git repository (if using JSON files)
- Never commit to public repos

**Why NOT use MySQL locally:**

- SQLite is simpler for single-user apps
- No server to run
- Just a file
- MySQL is overkill for personal use

**Quick Start Command:**

```bash
npx create-next-app@latest health-optimizer
cd health-optimizer
npm install better-sqlite3 recharts date-fns
```

Does this align with your vision? Would you prefer SQLite or JSON for your personal data? And do you want to start with Next.js or would you rather use plain React?
