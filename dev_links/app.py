from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from db import get_connection
import os

app = Flask(__name__)
# using a simple secret key since this is just a quick project
app.secret_key = 'super_secret_dev_key_123'

# --- PAGE ROUTES ---

@app.route('/')
def home():
    # If the user is not logged in, take them to the login page
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    # Otherwise go to dashboard
    return render_template('dashboard.html', username=session.get('username'))

@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/register')
def register():
    return render_template('register.html')

# --- AUTH API ROUTES ---

@app.route('/api/auth/register', methods=['POST'])
def api_register():
    # get our stuff from the form
    data = request.json
    username = data.get('username')
    password = data.get('password')  # saving plain text, learned it's bad but keeping it simple for now
    
    if not username or not password:
        return jsonify({'error': 'Missing username or password'}), 400
        
    try:
        conn = get_connection()
        cur = conn.cursor()
        
        # insert new user into DB
        cur.execute(
            "INSERT INTO users (username, password) VALUES (%s, %s)",
            (username, password)
        )
        conn.commit() # super important!
        
        cur.close()
        conn.close()
        return jsonify({'message': 'Registered successfully!'}), 201
    except Exception as e:
        # this usually means the username already exists due to UNIQUE constraint
        import traceback
        traceback.print_exc()
        print('DB ERROR:', e)
        return jsonify({'error': f'Database error: {e}'}), 400

@app.route('/api/auth/login', methods=['POST'])
def api_login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    conn = get_connection()
    cur = conn.cursor()
    
    cur.execute(
        "SELECT id, username FROM users WHERE username = %s AND password = %s",
        (username, password)
    )
    user_data = cur.fetchone()
    
    cur.close()
    conn.close()
    
    if user_data:
        # save this in session so we remember them
        session['user_id'] = user_data[0]
        session['username'] = user_data[1]
        return jsonify({'message': 'Logged in successfully'}), 200
    else:
        return jsonify({'error': 'Invalid username or password'}), 401
        
@app.route('/api/auth/logout', methods=['POST'])
def api_logout():
    session.clear() # clear everything out!
    return jsonify({'message': 'Logged out'}), 200

# --- LINKS API ROUTES (CRUD) ---

@app.route('/api/links', methods=['POST'])
def add_link():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
        
    data = request.json
    title = data.get('title')
    url = data.get('url')
    tag = data.get('tag', '')
    user_id = session['user_id']
    
    if not title or not url:
        return jsonify({'error': 'Title and URL are required'}), 400
        
    conn = get_connection()
    cur = conn.cursor()
    
    # using %s prevents SQL injection!
    cur.execute(
        "INSERT INTO links (title, url, tag, user_id) VALUES (%s, %s, %s, %s) RETURNING id",
        (title, url, tag, user_id)
    )
    new_link_id = cur.fetchone()[0]
    conn.commit()   # not sure why but without this it doesn't save — learned this the hard way
    
    cur.close()
    conn.close()
    
    return jsonify({'message': 'Link added', 'id': new_link_id}), 201

@app.route('/api/links', methods=['GET'])
def get_links():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
        
    user_id = session['user_id']
    
    conn = get_connection()
    cur = conn.cursor()
    
    cur.execute(
        "SELECT id, title, url, tag FROM links WHERE user_id = %s ORDER BY id DESC",
        (user_id,)
    )
    # fetchall gives a list of tuples, we have to make it a list of dictionaries to look nice in JSON
    rows = cur.fetchall()
    all_links = []
    
    for r in rows:
        link_dict = {
            'id': r[0],
            'title': r[1],
            'url': r[2],
            'tag': r[3]
        }
        all_links.append(link_dict)
        
    cur.close()
    conn.close()
    
    return jsonify(all_links), 200

@app.route('/api/links/<int:id>', methods=['PUT'])
def update_link(id):
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
        
    data = request.json
    title = data.get('title')
    tag = data.get('tag')
    user_id = session['user_id']
    
    conn = get_connection()
    cur = conn.cursor()
    
    # wait, make sure the logged in user actually owns this link!
    cur.execute(
        "UPDATE links SET title = %s, tag = %s WHERE id = %s AND user_id = %s",
        (title, tag, id, user_id)
    )
    conn.commit()
    
    cur.close()
    conn.close()
    
    return jsonify({'message': 'Link updated'}), 200
    
@app.route('/api/links/<int:id>', methods=['DELETE'])
def delete_link(id):
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
        
    user_id = session['user_id']
    
    conn = get_connection()
    cur = conn.cursor()
    
    cur.execute(
        "DELETE FROM links WHERE id = %s AND user_id = %s",
        (id, user_id)
    )
    conn.commit()
    
    cur.close()
    conn.close()
    
    return jsonify({'message': 'Link deleted'}), 200

if __name__ == '__main__':
    # run my app
    app.run(debug=True , port=8000)
