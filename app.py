from flask import Flask, render_template, request, redirect, url_for, flash, jsonify, send_file, session, copy_current_request_context
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from flask_mail import Mail, Message
from ftplib import FTP
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FuturesTimeoutError
from collections import deque
import tempfile
import os
import urllib.parse
import uuid
import whisper
from opencc import OpenCC
from deep_translator import GoogleTranslator
import torch
import subprocess
import io
import time
from threading import Lock

# 禁用 FP16 使用 FP32
os.environ["WHISPER_DISABLE_F16"] = "1"

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SECRET_KEY'] = 'supersecretkey'  # 用於 session 和登入系統
app.config['MAX_CONTENT_LENGTH'] = 2048 * 1024 * 1024  # 設置為2048MB
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'poseidon@poseidonllp.com'
app.config['MAIL_PASSWORD'] = 'poseidon52369168'
mail = Mail(app)

db = SQLAlchemy(app)

# 確認 GPU 是否可用，並將模型加載到 GPU 上
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"使用設備: {device}")
model = whisper.load_model("large-v3").to(device)

# 初始化翻譯器
translator = GoogleTranslator(source='auto', target='zh-TW')
# 簡體轉繁體轉換器
cc = OpenCC('s2twp')

executor = ThreadPoolExecutor(max_workers=8)

# 設置FTP伺服器信息
FTP_HOST = '114.32.65.180'
FTP_USER = 'Henry'
FTP_PASS = '123456'

# 創建全局的 Lock
lock = Lock()

# 創建轉錄排程隊列
transcription_queue = deque()
current_transcription = None

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), nullable=False, unique=True)
    password = db.Column(db.String(150), nullable=False)

@app.before_request
def log_request_info():
    ip_address = request.remote_addr
    print(f"來自IP的新請求: {ip_address}")

@app.route('/')
def index():
    return redirect(url_for('home'))

@app.route('/home')
def home():
    return render_template('home.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        user = User.query.filter_by(username=username).first()
        if user and check_password_hash(user.password, password):
            return '''
                <script>
                    alert("登入成功！");
                    window.location.href = "/home";
                </script>
            '''
        else:
            return '''
                <script>
                    alert("無效的用戶名或密碼");
                    window.location.href = "/login";
                </script>
            '''
    return render_template('index.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
        new_user = User(username=username, password=hashed_password)
        db.session.add(new_user)
        db.session.commit()
        return '''
            <script>
                alert("註冊成功！你現在可以登入了。");
                window.location.href = "/login";
            </script>
        '''
    return render_template('register.html')

@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    user = User.query.filter_by(username=username).first()
    if user and check_password_hash(user.password, password):
        return jsonify({"message": "Login successful!"}), 200
    else:
        return jsonify({"message": "Invalid username or password"}), 401

@app.route('/api/register', methods=['POST'])
def api_register():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    if User.query.filter_by(username=username).first():
        return jsonify({"message": "User already exists"}), 400
    hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
    new_user = User(username=username, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "Registration successful!"}), 201

@app.route('/view_users', methods=['GET'])
def view_users():
    users = User.query.all()
    user_list = [{'id': user.id, 'username': user.username, 'password': user.password} for user in users]
    return jsonify(user_list)

@app.route('/clear_users', methods=['POST'])
def clear_users():
    try:
        num_rows_deleted = db.session.query(User).delete()
        db.session.commit()
        return jsonify({"message": f"Successfully deleted {num_rows_deleted} users."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/api/contact', methods=['POST'])
def contact():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    message = data.get('message')

    if not name or not email or not message:
        return jsonify({"success": False, "message": "All fields are required"}), 400

    msg = Message('New Contact Form Submission',
                  sender=email,
                  recipients=['poseidon@poseidonllp.com'])
    msg.body = f"Name: {name}\nEmail: {email}\nMessage: {message}"
    mail.send(msg)

    return jsonify({"success": True, "message": "Message sent successfully"}), 200

@app.route('/upload_to_ftp', methods=['POST'])
def upload_to_ftp():
    if 'file' not in request.files or 'originalFileName' not in request.form:
        return jsonify({"error": "缺少文件或文件名"}), 400

    file = request.files['file']
    original_filename = request.form['originalFileName']

    if file.filename == '':
        return jsonify({"error": "文件名為空"}), 400

    filename = secure_filename(file.filename)
    filename_encoded = urllib.parse.quote(filename, safe='', encoding='utf-8')
    original_filename_encoded = urllib.parse.quote(original_filename, safe='', encoding='utf-8')

    temp_path = tempfile.mktemp()

    try:
        with open(temp_path, 'wb') as temp_file:
            file.save(temp_file)
    except Exception as e:
        print(f"文件保存失敗: {e}")
        return jsonify({"error": f"文件保存失敗: {e}"}), 500

    def upload():
        try:
            ftp = FTP()
            ftp.connect(FTP_HOST)
            ftp.login(FTP_USER, FTP_PASS)
            ftp.set_pasv(True)
            ftp.cwd('錄音檔')

            with open(temp_path, 'rb') as f:
                ftp.storbinary(f"STOR {filename_encoded}", f)

            with io.BytesIO(original_filename.encode('utf-8')) as meta_file:
                ftp.storbinary(f"STOR {filename_encoded}.meta", meta_file)

            with io.BytesIO(original_filename.encode('utf-8')) as meta_file:
                ftp.cwd('/Text_File')
                ftp.storbinary(f"STOR {filename_encoded}.meta", meta_file)

            ftp.quit()
            os.remove(temp_path)
            return {"message": f"文件 {original_filename} 已成功上傳到伺服器"}
        except Exception as e:
            print(f"FTP上傳失敗: {e}")
            os.remove(temp_path)
            return {"error": f"FTP上傳失敗: {e}"}

    max_retries = 5
    for attempt in range(max_retries):
        if lock.acquire(blocking=False):
            try:
                future = executor.submit(upload)
                result = future.result(timeout=6000)
                if "error" in result:
                    return jsonify(result), 500
                else:
                    return jsonify(result), 200
            except FuturesTimeoutError:
                return jsonify({"error": "上傳超時"}), 500
            except Exception as e:
                return jsonify({"error": str(e)}), 500
            finally:
                lock.release()
            break
        else:
            if attempt < max_retries - 1:
                time.sleep(2)  # 等待2秒後重試
            else:
                return jsonify({"error": "另一個轉檔過程正在進行中，請稍後再試"}), 503

@app.route('/list_files', methods=['GET'])
def list_files():
    try:
        ftp = FTP()
        ftp.connect(FTP_HOST)
        ftp.login(FTP_USER, FTP_PASS)
        ftp.cwd('錄音檔')
        files = ftp.nlst()
        ftp.quit()
        return jsonify(files)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/list_text_files', methods=['GET'])
def list_text_files():
    try:
        ftp = FTP()
        ftp.connect(FTP_HOST)
        ftp.login(FTP_USER, FTP_PASS)
        ftp.cwd('/Text_File')
        files = ftp.nlst()
        ftp.quit()
        return jsonify(files)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/download/<path:filename>', methods=['GET'])
def download(filename):
    try:
        ftp = FTP()
        ftp.connect(FTP_HOST)
        ftp.login(FTP_USER, FTP_PASS)
        ftp.set_pasv(True)

        temp_path = os.path.join(tempfile.gettempdir(), filename)

        with open(temp_path, 'wb') as temp_file:
            ftp.retrbinary('RETR ' + filename, temp_file.write)

        ftp.quit()
        return send_file(temp_path, as_attachment=True, attachment_filename=filename)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/transcribe', methods=['POST'])
def transcribe():
    if 'file' not in request.files:
        return jsonify({"error": "沒有找到上傳的文件"}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({"error": "文件名為空"}), 400

    filename = secure_filename(file.filename)
    temp_path = os.path.join(tempfile.gettempdir(), filename)
    file.save(temp_path)

    original_filename = request.form.get('originalFileName', filename)

    global transcription_queue

    transcription_queue.append((filename, temp_path, original_filename))

    return jsonify({"message": "文件已添加到轉錄隊列"}), 200

@app.route('/transcription_progress', methods=['GET'])
def transcription_progress():
    global transcription_queue, current_transcription
    queue_length = len(transcription_queue)
    if current_transcription:
        return jsonify({
            "current_file": current_transcription[0],
            "queue_length": queue_length
        })
    else:
        return jsonify({
            "current_file": None,
            "queue_length": queue_length
        })

def process_transcriptions():
    global transcription_queue, current_transcription

    while True:
        if transcription_queue:
            current_transcription = transcription_queue.popleft()
            filename, file_path, original_filename = current_transcription

            print(f"開始轉錄文件: {filename}")

            try:
                result = model.transcribe(file_path, fp16=False, language="zh")

                text = result["text"]

                simplified_text = translator.translate(text)
                traditional_text = cc.convert(simplified_text)

                text_filename = os.path.splitext(filename)[0] + ".txt"
                text_file_path = os.path.join(tempfile.gettempdir(), text_filename)

                with open(text_file_path, "w", encoding="utf-8") as text_file:
                    text_file.write(traditional_text)

                print(f"轉錄完成: {filename}")

                def upload_transcription():
                    try:
                        ftp = FTP()
                        ftp.connect(FTP_HOST)
                        ftp.login(FTP_USER, FTP_PASS)
                        ftp.set_pasv(True)

                        with open(text_file_path, 'rb') as text_file:
                            ftp.cwd('/Text_File')
                            ftp.storbinary(f'STOR {text_filename}', text_file)

                        with io.BytesIO(original_filename.encode('utf-8')) as meta_file:
                            ftp.storbinary(f"STOR {text_filename}.meta", meta_file)

                        ftp.quit()
                        os.remove(file_path)
                        os.remove(text_file_path)
                        return {"message": f"文件 {filename} 已成功轉錄並上傳到伺服器"}
                    except Exception as e:
                        print(f"轉錄文件上傳失敗: {e}")
                        os.remove(file_path)
                        os.remove(text_file_path)
                        return {"error": f"轉錄文件上傳失敗: {e}"}

                max_retries = 5
                for attempt in range(max_retries):
                    if lock.acquire(blocking=False):
                        try:
                            future = executor.submit(upload_transcription)
                            result = future.result(timeout=6000)
                            if "error" in result:
                                print(result)
                            else:
                                print(result)
                        except FuturesTimeoutError:
                            print("轉錄文件上傳超時")
                        except Exception as e:
                            print(str(e))
                        finally:
                            lock.release()
                        break
                    else:
                        if attempt < max_retries - 1:
                            time.sleep(2)
                        else:
                            print("另一個轉錄過程正在進行中，請稍後再試")

            except Exception as e:
                print(f"轉錄失敗: {e}")
                os.remove(file_path)

            current_transcription = None
        else:
            time.sleep(5)

if __name__ == '__main__':
    db.create_all()
    import threading
    threading.Thread(target=process_transcriptions, daemon=True).start()
    app.run(debug=True)
