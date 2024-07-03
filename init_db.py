import sqlite3
from werkzeug.security import generate_password_hash

connection = sqlite3.connect('database.db')

with connection:
    connection.execute("""
        CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            password TEXT NOT NULL
        );
    """)

# 插入一些測試用戶
with connection:
    hashed_password = generate_password_hash('testpassword', method='pbkdf2:sha256')
    connection.execute("INSERT INTO users (username, password) VALUES (?, ?)", ('testuser', hashed_password))

connection.close()
