from flask import Flask, request, jsonify, send_file, send_from_directory, session, copy_current_request_context
from ftplib import FTP
from werkzeug.utils import secure_filename
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FuturesTimeoutError
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
app.config['MAX_CONTENT_LENGTH'] = 2048 * 1024 * 1024  # 設置為2048MB
app.secret_key = 'supersecretkey'  # 用於 session

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
transcription_queue = []

@app.before_request
def log_request_info():
    ip_address = request.remote_addr
    print(f"來自IP的新請求: {ip_address}")

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

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

            ftp.cwd('/Text_File')
            with io.BytesIO(original_filename.encode('utf-8')) as meta_file:
                ftp.storbinary(f"STOR {filename_encoded}.meta", meta_file)

            ftp.quit()
            os.remove(temp_path)
            return {"message": f"<div class='alert'>文件 {original_filename} 已成功上傳到伺服器<span class='closebtn' onclick='this.parentElement.style.display=\"none\";'>&times;</span></div>"}
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
        ftp.set_pasv(True)
        ftp.cwd('錄音檔')

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
                        # 正確解碼
                        original_filename = temp_file.read().decode('utf-8')
                except Exception:
                    pass
                files_decoded.append({"encoded": file, "original": original_filename})
        ftp.quit()
        return jsonify({"files": files_decoded})
    except Exception as e:
        print(f"列出文件錯誤: {e}")
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
        text_files_decoded = [urllib.parse.unquote(f, encoding='utf-8') for f in text_files if not f.endswith('.meta')]  # 過濾掉 .meta 文件
        ftp.quit()
        return jsonify({"files": text_files_decoded})
    except Exception as e:
        print(f"列出文字文件錯誤: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/check_transcription_status', methods=['POST'])
def check_transcription_status():
    if 'filename' not in request.json:
        return jsonify({"error": "沒有指定文件名"}), 400
    filename = request.json['filename']

    for queued_filename, session_id in transcription_queue:
        if queued_filename == filename:
            return jsonify({"status": "queued"})

    if session.get('current_filename') == filename:
        return jsonify({"status": "in_progress"})

    return jsonify({"status": "completed"})

@app.route('/transcribe_from_ftp', methods=['POST'])
def transcribe_handler():
    if 'filename' not in request.json:
        return jsonify({"error": "沒有指定文件名"}), 400
    filename = request.json['filename']

    session_id = str(uuid.uuid4())
    session[session_id] = 0

    @copy_current_request_context
    def transcribe_and_store(filename, session_id):
        session['current_filename'] = filename
        result, original_filename = transcribe_audio_from_ftp(filename, session_id)
        session.pop('current_filename', None)
        return result, original_filename

    if not lock.acquire(blocking=False):
        transcription_queue.append((filename, session_id))
        return jsonify({"message": "已加入排程隊列"}), 202

    try:
        future = executor.submit(transcribe_and_store, filename, session_id)
        transcription_result, original_filename = future.result(timeout=6000)
        return jsonify({"text": transcription_result, "sessionID": session_id, "originalFilename": original_filename})
    except FuturesTimeoutError:
        return jsonify({"error": "轉錄超時"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        lock.release()
        process_next_in_queue()

def transcribe_audio_from_ftp(filename, session_id):
    try:
        ftp = FTP()
        ftp.connect(FTP_HOST)
        ftp.login(FTP_USER, FTP_PASS)
        ftp.set_pasv(True)
        ftp.cwd('錄音檔')

        decoded_filename = urllib.parse.unquote(filename, encoding='utf-8')
        temp_path = tempfile.mktemp()

        # 下載原始音頻文件
        with open(temp_path, 'wb') as temp_file:
            ftp.retrbinary(f"RETR {decoded_filename}", temp_file.write)

        # 嘗試從 .meta 文件中讀取原始檔名
        try:
            meta_file_path = tempfile.mktemp()
            with open(meta_file_path, 'wb') as meta_file:
                ftp.retrbinary(f"RETR {decoded_filename}.meta", meta_file.write)
            with open(meta_file_path, 'r', encoding='utf-8') as meta_file:
                original_filename = meta_file.read().strip()
        except Exception as e:
            print(f"讀取 .meta 文件失敗: {e}")
            original_filename = decoded_filename

        # 將音頻轉換為 WAV 格式
        converted_path = tempfile.mktemp(suffix=".wav")
        try:
            subprocess.run(['ffmpeg', '-i', temp_path, '-ar', '16000', '-ac', '1', converted_path], check=True)
        except subprocess.CalledProcessError as e:
            print(f"音頻轉換失敗: {e}")
            raise

        # 進行轉錄
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

        # 使用 .meta 文件中的原始檔名來保存轉錄的文本文件
        text_filename = f"{original_filename}.txt"
        with tempfile.NamedTemporaryFile(delete=False) as text_file:
            text_file.write("\n".join(transcriptions).encode('utf-8'))

        # 上傳轉錄文本文件到 "Text_File" 資料夾
        ftp.cwd('/Text_File')
        with open(text_file.name, 'rb') as f:
            ftp.storbinary(f"STOR {urllib.parse.quote(text_filename, encoding='utf-8')}", f)

        os.remove(text_file.name)

        ftp.quit()

        return "\n".join(transcriptions), original_filename
    except Exception as e:
        print(f"轉錄音頻錯誤: {e}")
        return f"{{'error': '{str(e)}'}}", original_filename

def process_next_in_queue():
    if transcription_queue:
        next_filename, next_session_id = transcription_queue.pop(0)
        @copy_current_request_context
        def transcribe_and_store():
            return transcribe_audio_from_ftp(next_filename, next_session_id)
        future = executor.submit(transcribe_and_store)
        try:
            future.result(timeout=6000)
        except Exception as e:
            print(f"處理下一個排程時出錯: {e}")

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

        # 解碼 URL 編碼的文件名
        decoded_filename = urllib.parse.unquote(filename, encoding='utf-8')
        local_filename = tempfile.mktemp()

        # 嘗試從 FTP 下載文件
        with open(local_filename, 'wb') as f:
            ftp.retrbinary(f"RETR {urllib.parse.quote(decoded_filename, encoding='utf-8')}", f.write)

        ftp.quit()
        return send_file(local_filename, as_attachment=True, download_name=decoded_filename)
    except FileNotFoundError as e:
        print(f"文件未找到錯誤: {e}")
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        print(f"下載文字文件錯誤: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/queue_length', methods=['GET'])
def queue_length():
    return jsonify({"queueLength": len(transcription_queue)})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
