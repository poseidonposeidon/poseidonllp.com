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

# 禁用 FP16 使用 FP32
os.environ["WHISPER_DISABLE_F16"] = "1"

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 2048 * 1024 * 1024  # 設置為2048MB
app.secret_key = 'supersecretkey'  # 用於 session

# 允許特定的域名
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
    print(f"New request from IP: {ip_address}")

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/upload_to_ftp', methods=['POST'])
def upload_to_ftp():
    if 'file' not in request.files:
        return jsonify({"error": "沒有上傳文件"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "文件名為空"}), 400

    filename = secure_filename(file.filename)
    temp_path = tempfile.mktemp()  # 生成臨時文件路徑

    try:
        with open(temp_path, 'wb') as temp_file:
            # 直接保存上傳文件，不進行編碼轉換
            file.save(temp_file)
    except Exception as e:
        print(f"文件保存失敗: {e}")
        return jsonify({"error": f"文件保存失敗: {e}"}), 500

    def upload():
        try:
            ftp = FTP()
            ftp.set_debuglevel(0)  # 禁用詳細的調試日誌
            ftp.connect(FTP_HOST)
            ftp.login(FTP_USER, FTP_PASS)
            ftp.set_pasv(True)  # 啟用被動模式

            # 切換到“錄音檔”資料夾
            ftp.cwd('錄音檔')

            with open(temp_path, 'rb') as f:
                ftp.storbinary(f'STOR %s' % urllib.parse.quote(filename), f)
            ftp.quit()
            os.remove(temp_path)  # 上傳完成後刪除本地文件
            return {"message": f"文件 {filename} 已成功上傳到FTP伺服器"}
        except Exception as e:
            print(f"FTP上傳失敗: {e}")
            os.remove(temp_path)  # 在失敗時也刪除文件
            return {"error": f"FTP上傳失敗: {e}"}

    future = executor.submit(upload)
    try:
        result = future.result(timeout=6000)  # 設置超時時間為6000秒
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
        ftp.set_debuglevel(0)  # 禁用詳細的調試日誌
        ftp.connect(FTP_HOST)
        ftp.login(FTP_USER, FTP_PASS)
        ftp.set_pasv(True)  # 啟用被動模式

        # 切換到「錄音檔」資料夾
        ftp.cwd('錄音檔')

        # 列出「錄音檔」資料夾中的檔案
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
            transcription_result = future.result(timeout=6000)  # 設置超時時間為6000秒
        except FuturesTimeoutError:
            return jsonify({"error": "轉錄超時"}), 500
        except Exception as e:
            print(f"轉錄過程中出錯: {e}")
            return jsonify({"error": str(e)}), 500
        return jsonify({"text": transcription_result, "sessionID": session_id})  # 返回 session ID
    except Exception as e:
        print(f"Error in transcribe_handler: {e}")
        return jsonify({"error": str(e)}), 500

def transcribe_audio_from_ftp(filename, session_id):
    try:
        ftp = FTP()
        ftp.set_debuglevel(1)  # 打開詳細的調試日誌
        ftp.connect(FTP_HOST)
        ftp.login(FTP_USER, FTP_PASS)
        ftp.set_pasv(True)  # 啟用被動模式

        # 切換到「錄音檔」資料夾
        ftp.cwd('錄音檔')

        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            temp_path = temp_file.name
            print(f"Downloading file: {filename} to {temp_path}")  # 添加日誌
            try:
                ftp.retrbinary(f'RETR {filename}', temp_file.write)
            except Exception as e:
                print(f"Error downloading file: {e}")
                raise

        print(f"Transcribing file at {temp_path}")  # 添加日誌

        # 確認音頻格式是否符合要求，如果需要轉換為 wav 格式
        converted_path = tempfile.mktemp(suffix=".wav")
        try:
            subprocess.run(['ffmpeg', '-i', temp_path, '-ar', '16000', '-ac', '1', converted_path], check=True)
        except subprocess.CalledProcessError as e:
            print(f"音頻轉換失敗: {e}")
            raise

        # 使用 Whisper 模型轉錄音頻
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

            session[session_id] = int(((i + 1) / total_segments) * 100)  # 更新特定 session ID 的進度

        # 刪除臨時文件
        os.remove(temp_path)
        os.remove(converted_path)

        # 刪除 FTP 中的檔案
        filename_encoded = urllib.parse.quote(filename)
        try:
            ftp.delete(filename_encoded)
        except Exception as e:
            print(f"Error deleting file from FTP: {e}")
        ftp.quit()

        return "\n".join(transcriptions)
    except Exception as e:
        print(f"Error in transcribe_audio_from_ftp: {e}")
        return f"{{'error': '{str(e)}'}}"  # 返回詳細的錯誤信息

def format_time(seconds):
    hours, remainder = divmod(seconds, 3600)
    minutes, seconds = divmod(remainder, 60)
    return f"{int(hours):02}:{int(minutes):02}:{int(seconds):02}"

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)  # 使用本地回環地址
