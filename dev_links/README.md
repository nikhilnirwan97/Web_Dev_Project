# Dev-Links 🚀

A beginner-friendly personal resource bookmarking tool for developers.
Built for my 1st-year B.Tech project!

## Tech Stack
- **Backend:** Python + Flask
- **Database:** Supabase (PostgreSQL) via psycopg2
- **Frontend:** HTML5, CSS3 (Flexbox), Vanilla JavaScript (fetch API)
- No SQLAlchemy, no React! Just simple fetching and DB cursors.

## ⚙️ SUPABASE SETUP STEPS

This took a bit to figure out, follow these steps closely!

Step 1: Go to https://supabase.com and create a free account.
Step 2: Click "New Project", give it a name, set a DB password, choose a region.
Step 3: After the project loads, go to Settings > Database.
Step 4: Copy the "Connection String" (URI format) — it looks like:
        `postgresql://postgres:[YOUR-PASSWORD]@db.xxxx.supabase.co:5432/postgres`
Step 5: Change the password placeholder in `.env` to your actual password.
Step 6: Run the SQL below in Supabase's SQL Editor to create tables.

### SQL TO RUN IN SUPABASE SQL EDITOR

```sql
-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
);

-- Create links table
CREATE TABLE links (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  tag TEXT,
  user_id INTEGER REFERENCES users(id)
);
```

## Running the App
1. Install requirements:
   ```bash
   pip install -r requirements.txt
   ```
2. Make sure `.env` is properly set up with `DATABASE_URL`.
3. Start the Flask server:
   ```bash
   python app.py
   ```
4. Open your browser and go to `http://127.0.0.1:5000`!
