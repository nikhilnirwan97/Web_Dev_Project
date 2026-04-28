# db.py — this file handles connecting to our Supabase database
# psycopg2 is a library that lets Python talk to PostgreSQL databases
# learned about this from the psycopg2 docs and a YouTube tutorial

import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()  # this reads our .env file

# this function gives us a fresh connection to the database
def get_connection():
    # fetch url from environment variable
    conn = psycopg2.connect(os.getenv("DATABASE_URL"))
    return conn
