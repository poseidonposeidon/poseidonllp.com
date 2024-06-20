from flask import Flask, request, jsonify, send_from_directory, session, copy_current_request_context
from flask_cors import CORS
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
import io  # 添加此行以解決 'Unresolved reference 'io'' 錯誤

# 禁用 FP16 使用 FP32
os.environ["WHISPER_DISABLE_F16"] = "1"

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 2048 * 1024 * 1024  # 設置為2048MB
app.secret_key = 'supersecretkey'  # 用於 session


# 確認 GPU 是否可用，並將模型加載到 GPU 上
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Using device: {device}")
model = whisper.load_model("large-v3").to(device)

# 初始化翻譯器
translator = GoogleTranslator(source='auto', target='zh-TW')
# 簡體轉繁體轉換器
cc = OpenCC('s2twp')

executor = ThreadPoolExecutor(max_workers=4)

# 設置FTP伺服器信息
FTP_HOST = '114.32.65.180'
FTP_USER = 'Henry'
FTP_PASS = '123456'

@app.before_request
def log_request_info():
    ip_address = request.remote_addr
    print(f"New request from IP: {ip_address}")

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
    # 將文件名用 UTF-8 編碼
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
            ftp.set_debuglevel(0)
            ftp.connect(FTP_HOST)
            ftp.login(FTP_USER, FTP_PASS)
            ftp.set_pasv(True)
            ftp.cwd('錄音檔')

            with open(temp_path, 'rb') as f:
                ftp.storbinary(f'STOR {filename_encoded}', f)
                # 保存原始文件名到 .meta 文件中
                ftp.storbinary(f'STOR {filename_encoded}.meta', io.BytesIO(original_filename.encode('utf-8')))
            ftp.quit()
            os.remove(temp_path)
            return {"message": f"文件 {original_filename} 已成功上傳到FTP伺服器"}
        except Exception as e:
            print(f"FTP上傳失敗: {e}")
            os.remove(temp_path)
            return {"error": f"FTP上傳失敗: {e}"}

    future = executor.submit(upload)
    try:
        result = future.result(timeout=6000)
        if "error" in result:
            return jsonify(result), 500
        else:
            return jsonify(result), 200
    except FuturesTimeoutError:
        return jsonify({"error": "上傳超時"}), 500

@app.route('/list_files', methods=['GET'])
def list_files():
    try:
        ftp = FTP()
        ftp.set_debuglevel(0)
        ftp.connect(FTP_HOST)
        ftp.login(FTP_USER, FTP_PASS)
        ftp.set_pasv(True)
        ftp.cwd('錄音檔')

        files = ftp.nlst()
        files_decoded = []
        for file in files:
            if not file.endswith('.meta'):
                original_filename = file  # 默認使用編碼的文件名
                meta_file = f"{file}.meta"
                try:
                    with tempfile.NamedTemporaryFile() as temp_file:
                        ftp.retrbinary(f'RETR {meta_file}', temp_file.write)
                        temp_file.seek(0)
                        original_filename = temp_file.read().decode('utf-8')
                except Exception:
                    pass  # 如果 .meta 文件不存在或出錯，保持文件名為編碼的狀態
                files_decoded.append({"encoded": file, "original": original_filename})
        ftp.quit()
        return jsonify({"files": files_decoded})
    except Exception as e:
        print(f"Error in list_files: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/transcribe_from_ftp', methods=['POST'])
def transcribe_handler():
    try:
        if 'filename' not in request.json:
            return jsonify({"error": "沒有指定文件名"}), 400
        filename = request.json['filename']

        session_id = str(uuid.uuid4())
        session[session_id] = 0

        @copy_current_request_context
        def transcribe_and_store(filename, session_id):
            return transcribe_audio_from_ftp(filename, session_id)

        future = executor.submit(transcribe_and_store, filename, session_id)
        try:
            transcription_result = future.result(timeout=6000)
        except FuturesTimeoutError:
            return jsonify({"error": "轉錄超時"}), 500
        except Exception as e:
            print(f"轉錄過程中出錯: {e}")
            return jsonify({"error": str(e)}), 500
        return jsonify({"text": transcription_result, "sessionID": session_id})
    except Exception as e:
        print(f"Error in transcribe_handler: {e}")
        return jsonify({"error": str(e)}), 500

def transcribe_audio_from_ftp(filename, session_id):
    try:
        ftp = FTP()
        ftp.set_debuglevel(1)
        ftp.connect(FTP_HOST)
        ftp.login(FTP_USER, FTP_PASS)
        ftp.set_pasv(True)
        ftp.cwd('錄音檔')

        # 解碼文件名以用 UTF-8 處理
        decoded_filename = urllib.parse.unquote(filename, encoding='utf-8')
        temp_path = tempfile.mktemp()

        with open(temp_path, 'wb') as temp_file:
            ftp.retrbinary(f'RETR {decoded_filename}', temp_file.write)

        converted_path = tempfile.mktemp(suffix=".wav")
        try:
            subprocess.run(['ffmpeg', '-i', temp_path, '-ar', '16000', '-ac', '1', converted_path], check=True)
        except subprocess.CalledProcessError as e:
            print(f"音頻轉換失敗: {e}")
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

        try:
            ftp.delete(urllib.parse.quote(filename, encoding='utf-8'))
        except Exception as e:
            print(f"Error deleting file from FTP: {e}")
        ftp.quit()

        return "\n".join(transcriptions)
    except Exception as e:
        print(f"Error in transcribe_audio_from_ftp: {e}")
        return f"{{'error': '{str(e)}'}}"

def format_time(seconds):
    hours, remainder = divmod(seconds, 3600)
    minutes, seconds = divmod(remainder, 60)
    return f"{int(hours):02}:{int(minutes):02}:{int(seconds):02}"

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
