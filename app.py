from flask import Flask, request, jsonify, send_from_directory, session, current_app
import whisper
from opencc import OpenCC
from deep_translator import GoogleTranslator
import os
import tempfile
import torch
import uuid
from flask_cors import CORS
from werkzeug.utils import secure_filename
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FuturesTimeoutError
from ftplib import FTP
from flask import copy_current_request_context
import urllib.parse

# 禁用 FP16 使用 FP32
os.environ["WHISPER_DISABLE_F16"] = "1"

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024  # 設置為500MB
app.secret_key = 'supersecretkey'  # 用於 session
CORS(app, resources={r"/*": {"origins": "*"}})

# 確認 GPU 是否可用，並將模型加載到 GPU 上
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Using device: {device}")
model = whisper.load_model("large-v2").to(device)

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
    # print(f"New request from IP: {ip_address}")

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/upload_to_ftp', methods=['POST'])
def upload_to_ftp():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "沒有上傳文件"}), 400
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "文件名為空"}), 400
        if file:
            filename = secure_filename(file.filename)
            # 確保文件名以UTF-8格式進行編碼
            filename_encoded = urllib.parse.quote(filename)
            file.save(filename)

            ftp = FTP()
            ftp.set_debuglevel(0)  # 禁用詳細的調試日誌
            try:
                ftp.connect(FTP_HOST)
                ftp.login(FTP_USER, FTP_PASS)
                ftp.set_pasv(True)  # 啟用被動模式
                with open(filename, 'rb') as f:
                    ftp.storbinary(f'STOR %s' % filename_encoded, f)
                ftp.quit()
            except Exception as e:
                return jsonify({"error": f"FTP上傳失敗: {e}"}), 500
            finally:
                ftp.close()
                os.remove(filename)  # 上傳完成後刪除本地文件

            return jsonify({"message": f"文件 {filename} 已成功上傳到FTP伺服器"}), 200
        return jsonify({"error": "無效的文件"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/list_files', methods=['GET'])
def list_files():
    try:
        ftp = FTP()
        ftp.set_debuglevel(0)  # 禁用詳細的調試日誌
        ftp.connect(FTP_HOST)
        ftp.login(FTP_USER, FTP_PASS)
        ftp.set_pasv(True)  # 啟用被動模式
        files = ftp.nlst()
        ftp.quit()
        # 確保文件名以UTF-8格式進行解碼
        files_decoded = [urllib.parse.unquote(f) for f in files]
        return jsonify({"files": files_decoded})
    except Exception as e:
        print(f"Error in list_files: {e}")  # 添加日誌
        return jsonify({"error": str(e)}), 500

@app.route('/transcribe_from_ftp', methods=['POST'])
def transcribe_handler():
    try:
        if 'filename' not in request.json:
            return jsonify({"error": "沒有指定文件名"}), 400
        filename = request.json['filename']

        session_id = str(uuid.uuid4())  # 生成唯一 session ID
        session[session_id] = 0

        @copy_current_request_context
        def transcribe_and_store(filename, session_id):
            return transcribe_audio_from_ftp(filename, session_id)

        future = executor.submit(transcribe_and_store, filename, session_id)
        try:
            transcription_result = future.result(timeout=3600)  # 設置超時時間為3600秒
        except FuturesTimeoutError:
            return jsonify({"error": "轉錄超時"}), 500
        return jsonify({"text": transcription_result, "sessionID": session_id})  # 返回 session ID
    except Exception as e:
        print(f"Error in transcribe_handler: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/progress/<session_id>', methods=['GET'])
def progress(session_id):
    if session_id in session:
        progress = session.get(session_id, 0)  # 獲取特定 session ID 的進度
        return jsonify({"progress": progress})
    else:
        return jsonify({"error": "Session ID not found"}), 404

def transcribe_audio_from_ftp(filename, session_id):
    try:
        ftp = FTP()
        ftp.set_debuglevel(0)  # 禁用詳細的調試日誌
        ftp.connect(FTP_HOST)
        ftp.login(FTP_USER, FTP_PASS)
        ftp.set_pasv(True)  # 啟用被動模式

        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            temp_path = temp_file.name
            ftp.retrbinary(f'RETR {filename}', temp_file.write)

        print(f"Transcribing file at {temp_path}")  # 添加日誌

        # 語音識別
        result = model.transcribe(temp_path)

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

            session[session_id] = int(((i + 1) / total_segments) * 100)  # 更新特定 session ID 的進度

        os.remove(temp_path)
        session[session_id] = 100

        # 刪除 FTP 中的檔案
        filename_encoded = urllib.parse.quote(filename)
        ftp.delete(filename_encoded)
        ftp.quit()

        return "\n".join(transcriptions)
    except Exception as e:
        print(f"Error in transcribe_audio_from_ftp: {e}")
        raise

def format_time(seconds):
    hours, remainder = divmod(seconds, 3600)
    minutes, seconds = divmod(remainder, 60)
    return f"{int(hours):02}:{int(minutes):02}:{int(seconds):02}"

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
