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

# Disable FP16 and use FP32
os.environ["WHISPER_DISABLE_F16"] = "1"

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SECRET_KEY'] = 'supersecretkey'  # Used for session and login system
app.config['MAX_CONTENT_LENGTH'] = 2048 * 1024 * 1024  # Set to 2048MB
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'poseidon@poseidonllp.com'
app.config['MAIL_PASSWORD'] = 'qqlq ckwh cyiw spuf'

mail = Mail(app)
db = SQLAlchemy(app)

# Confirm if GPU is available and load the model to GPU
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Using device: {device}")
model = whisper.load_model("large-v3").to(device)

# Initialize translator
translator = GoogleTranslator(source='auto', target='zh-TW')
# Simplified to Traditional Chinese converter
cc = OpenCC('s2twp')

executor = ThreadPoolExecutor(max_workers=8)

# Set FTP server info
FTP_HOST = '114.32.65.180'
FTP_USER = 'Henry'
FTP_PASS = '123456'

# Create a global Lock
lock = Lock()

# Create transcription queue
transcription_queue = deque()
current_transcription = None

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), nullable=False, unique=True)
    password = db.Column(db.String(150), nullable=False)

@app.before_request
def log_request_info():
    ip_address = request.remote_addr
    print(f"New request from IP: {ip_address}")

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
                    alert("Login successful!");
                    window.location.href = "/home";
                </script>
            '''
        else:
            return '''
                <script>
                    alert("Invalid username or password");
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
                alert("Registration successful! You can now login.");
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
        return jsonify({"error": "Missing file or filename"}), 400

    file = request.files['file']
    original_filename = request.form['originalFileName']

    if file.filename == '':
        return jsonify({"error": "Filename is empty"}), 400

    filename = secure_filename(file.filename)
    filename_encoded = urllib.parse.quote(filename, safe='', encoding='utf-8')
    original_filename_encoded = urllib.parse.quote(original_filename, safe='', encoding='utf-8')

    temp_path = tempfile.mktemp()

    try:
        with open(temp_path, 'wb') as temp_file:
            file.save(temp_file)
    except Exception as e:
        print(f"File save failed: {e}")
        return jsonify({"error": f"File save failed: {e}"}), 500

    def upload():
        try:
            ftp = FTP()
            ftp.connect(FTP_HOST)
            ftp.login(FTP_USER, FTP_PASS)
            ftp.set_pasv(True)
            ftp.cwd('audio_files')

            with open(temp_path, 'rb') as f:
                ftp.storbinary(f"STOR {filename_encoded}", f)

            with io.BytesIO(original_filename.encode('utf-8')) as meta_file:
                ftp.storbinary(f"STOR {filename_encoded}.meta", meta_file)

            with io.BytesIO(original_filename.encode('utf-8')) as meta_file:
                ftp.cwd('/Text_File')
                ftp.storbinary(f"STOR {filename_encoded}.meta", meta_file)

            ftp.quit()
            os.remove(temp_path)
            return {"message": f"File {original_filename} successfully uploaded to server"}
        except Exception as e:
            print(f"FTP upload failed: {e}")
            os.remove(temp_path)
            return {"error": f"FTP upload failed: {e}"}

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
                return jsonify({"error": "Upload timeout"}), 500
            except Exception as e:
                return jsonify({"error": str(e)}), 500
            finally:
                lock.release()
            break
        else:
            if attempt < max_retries - 1:
                time.sleep(2)  # Wait 2 seconds before retrying
            else:
                return jsonify({"error": "Another transcription process is in progress, please try again later"}), 503

@app.route('/list_files', methods=['GET'])
def list_files():
    try:
        ftp = FTP()
        ftp.connect(FTP_HOST)
        ftp.login(FTP_USER, FTP_PASS)
        ftp.set_pasv(True)
        ftp.cwd('audio_files')

        files = ftp.nlst()
        files_decoded = []
        for file in files:
            if not file.endswith('.meta'):
                meta_file = f"{file}.meta"
                original_filename = file
                try:
                    with tempfile.NamedTemporaryFile() as temp_file:
                        ftp.retrbinary(f"RETR {meta_file}", temp_file.write)
                        temp_file.seek(0)
                        original_filename = temp_file.read().decode('utf-8')
                except Exception:
                    pass
                files_decoded.append({"encoded": file, "original": original_filename})
        ftp.quit()
        return jsonify({"files": files_decoded})
    except Exception as e:
        print(f"Error listing files: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/list_text_files', methods=['GET'])
def list_text_files():
    try:
        ftp = FTP()
        ftp.connect(FTP_HOST)
        ftp.login(FTP_USER, FTP_PASS)
        ftp.set_pasv(True)
        ftp.cwd('/Text_File')

        text_files = ftp.nlst()
        text_files_decoded = [urllib.parse.unquote(f, encoding='utf-8') for f in text_files if not f.endswith('.meta')]
        text_files_encoded = [{"encoded": urllib.parse.quote(f, safe=''), "original": f} for f in text_files_decoded]
        ftp.quit()
        return jsonify({"files": text_files_encoded})
    except Exception as e:
        print(f"Error listing text files: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/check_transcription_status', methods=['POST'])
def check_transcription_status():
    if 'filename' not in request.json:
        return jsonify({"error": "Filename not specified"}), 400
    filename = request.json['filename']

    if current_transcription and current_transcription['filename'] == filename:
        if current_transcription['status'] == 'completed':
            return jsonify({"status": "completed"})
        elif current_transcription['status'] == 'in_progress':
            return jsonify({"status": "in_progress"})

    if any(queued_filename == filename for queued_filename, _ in transcription_queue):
        return jsonify({"status": "queued"})

    return jsonify({"status": "not_found"})

@app.route('/transcribe_from_ftp', methods=['POST'])
def transcribe_handler():
    if 'filename' not in request.json:
        return jsonify({"error": "Filename not specified"}), 400

    filename = request.json['filename']
    session_id = str(uuid.uuid4())
    session[session_id] = 0

    if not lock.acquire(blocking=False):
        transcription_queue.append((filename, session_id))
        return jsonify({"message": "Added to the queue"}), 202

    @copy_current_request_context
    def transcribe_and_store(filename, session_id):
        global current_transcription
        current_transcription = {'filename': filename, 'status': 'in_progress'}
        result, original_filename = transcribe_audio_from_ftp(filename, session_id)
        current_transcription = {'filename': filename, 'status': 'completed', 'result': result}
        return result, original_filename

    try:
        future = executor.submit(transcribe_and_store, filename, session_id)
        transcription_result, original_filename = future.result(timeout=6000)
        return jsonify({"text": transcription_result, "sessionID": session_id, "originalFilename": original_filename})
    except FuturesTimeoutError:
        return jsonify({"error": "Transcription timeout"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        lock.release()
        process_next_in_queue()

@app.route('/get_transcription_result', methods=['POST'])
def get_transcription_result():
    if 'filename' not in request.json:
        return jsonify({"error": "Filename not specified"}), 400
    filename = request.json['filename']

    if current_transcription and current_transcription['filename'] == filename:
        return jsonify({"text": current_transcription.get('result', '')})
    else:
        return jsonify({"error": "Result not available or filename mismatch"}), 404

def transcribe_audio_from_ftp(filename, session_id):
    try:
        ftp = FTP()
        ftp.connect(FTP_HOST)
        ftp.login(FTP_USER, FTP_PASS)
        ftp.set_pasv(True)
        ftp.cwd('audio_files')

        decoded_filename = urllib.parse.unquote(filename, encoding='utf-8')
        temp_path = tempfile.mktemp()

        with open(temp_path, 'wb') as temp_file:
            ftp.retrbinary(f"RETR {decoded_filename}", temp_file.write)

        try:
            meta_file_path = tempfile.mktemp()
            with open(meta_file_path, 'wb') as meta_file:
                ftp.retrbinary(f"RETR {decoded_filename}.meta", meta_file.write)
            with open(meta_file_path, 'r', encoding='utf-8') as meta_file:
                original_filename = meta_file.read().strip()
        except Exception as e:
            print(f"Reading .meta file failed: {e}")
            original_filename = decoded_filename

        converted_path = tempfile.mktemp(suffix=".wav")
        try:
            subprocess.run(['ffmpeg', '-i', temp_path, '-ar', '16000', '-ac', '1', converted_path], check=True)
        except subprocess.CalledProcessError as e:
            print(f"Audio conversion failed: {e}")
            raise

        result = model.transcribe(converted_path)

        segments = result['segments']
        total_segments = len(segments)
        transcriptions = []

        for i, segment in enumerate(segments):
            text = segment["text"]
            start = segment["start"]
            end = segment["end"]

            if result["language"] == "en":
                transcription_traditional = translator.translate(text)
            else:
                transcription_traditional = cc.convert(text)

            start_formatted = format_time(start)
            end_formatted = format_time(end)

            transcriptions.append(f"{start_formatted}-{end_formatted}: {transcription_traditional}")

            session[session_id] = int(((i + 1) / total_segments) * 100)

        os.remove(temp_path)
        os.remove(converted_path)

        text_filename = f"{original_filename}.txt"
        with tempfile.NamedTemporaryFile(delete=False) as text_file:
            text_file.write("\n".join(transcriptions).encode('utf-8'))

        ftp.cwd('/Text_File')
        with open(text_file.name, 'rb') as f:
            ftp.storbinary(f"STOR {urllib.parse.quote(text_filename, encoding='utf-8')}", f)

        os.remove(text_file.name)

        ftp.quit()

        return "\n".join(transcriptions), original_filename
    except Exception as e:
        print(f"Transcribing audio error: {e}")
        return f"{{'error': '{str(e)}'}}", original_filename

def process_next_in_queue():
    if transcription_queue:
        next_filename, next_session_id = transcription_queue.popleft()
        @copy_current_request_context
        def transcribe_and_store():
            global current_transcription
            current_transcription = {'filename': next_filename, 'status': 'in_progress'}
            result, original_filename = transcribe_audio_from_ftp(next_filename, next_session_id)
            current_transcription = {'filename': next_filename, 'status': 'completed', 'result': result}
            return result, original_filename
        future = executor.submit(transcribe_and_store)
        try:
            future.result(timeout=6000)
        except Exception as e:
            print(f"Error processing next queue item: {e}")
        finally:
            process_next_in_queue()

def format_time(seconds):
    hours, remainder = divmod(seconds, 3600)
    minutes, seconds = divmod(remainder, 60)
    return f"{int(hours):02}:{int(minutes):02}:{int(seconds):02}"

@app.route('/download_text_file/<filename>', methods=['GET'])
def download_text_file(filename):
    try:
        ftp = FTP(FTP_HOST)
        ftp.login(FTP_USER, FTP_PASS)
        ftp.set_pasv(True)
        ftp.cwd('Text_File')

        decoded_filename = urllib.parse.unquote(filename, encoding='utf-8')
        local_filename = tempfile.mktemp()

        with open(local_filename, 'wb') as f:
            ftp.retrbinary(f"RETR {urllib.parse.quote(decoded_filename, encoding='utf-8')}", f.write)

        ftp.quit()
        return send_file(local_filename, as_attachment=True, download_name=decoded_filename)
    except FileNotFoundError as e:
        print(f"File not found error: {e}")
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        print(f"Error downloading text file: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/queue_length', methods=['GET'])
def queue_length():
    return jsonify({"queueLength": len(transcription_queue)})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Create database and tables
    app.run(debug=True, host='0.0.0.0', port=5000)
