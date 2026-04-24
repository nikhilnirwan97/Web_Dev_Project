# Dev-Links 🚀

Hey! This is my 1st-year B.Tech project. It's a simple bookmarking tool where developers can save and organize their coding links.

---

## 🎨 My Rough Plan

Before coding, I made a rough plan of how things would connect. Here is how it all works:

### How everything connects
The website has three main parts:
1. **Frontend**: The actual website you see (built with basic HTML, CSS, and JS). It sends form data like your new links to the backend.
2. **Backend**: This is the brain of the app (built with Python and Flask). It handles the logic and talks to the database.
3. **Database**: I'm using Supabase PostgreSQL to store all the users and their saved links.

### How the app works (User Flow)
When you visit the site, here is what you can do:
- First, you either log in or register for a new account.
- Once you are logged in, you go to your "My Links Dashboard".
- From the dashboard, you can add a new link, edit an existing link, or delete a link.

### Database Tables
I kept the database super simple. It just has two tables:
- **USERS**: Stores your `id`, `username`, and `password`.
- **LINKS**: Stores the `id`, `title`, `url`, `tag`, and the `user_id` so we know who saved it.

---

## 🛠️ What I Used (Tech Stack)
- **Backend:** Python + Flask
- **Database:** Supabase (PostgreSQL) using psycopg2
- **Frontend:** Basic HTML, CSS (Flexbox), and Vanilla JavaScript
- *Note:* No React, no SQLAlchemy, just simple code!

---

## ⚙️ How to Run This Project

### Supabase Database Setup
1. Go to [Supabase](https://supabase.com) and make a free account.
2. Click **"New Project"**, name it, set a password, and pick a region.
3. Once it loads, go to **Settings > Database**.
4. Copy the **Connection String (URI format)** (it looks like `postgresql://...`).
5. Make a `.env` file in the folder and put your URL inside:
   `DATABASE_URL=your_connection_url_here`
6. Run this SQL in the Supabase SQL Editor to make the tables:

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

### Running Locally
1. **Install python packages:**
   ```bash
   pip install -r requirements.txt
   ```
2. **Start the server:**
   ```bash
   python app.py
   ```
3. **Open the app:** Go to your browser and type `http://127.0.0.1:5000`
