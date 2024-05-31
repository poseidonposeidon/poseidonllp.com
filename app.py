from flask import Flask, request, jsonify, session
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
from flask import copy_current_request_context
from waitress import serve

# 禁用 FP16 使用 FP32
os.environ["WHISPER_DISABLE_F16"] = "1"

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024  # 設置為500MB
app.secret_key = 'supersecretkey'  # 用於 session
CORS(app, resources={r"/*": {"origins": "*"}})  # 配置 CORS

# 確認 GPU 是否可用，並將模型加載到 GPU 上
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Using device: {device}")
model = whisper.load_model("large-v2").to(device)

# 初始化翻譯器
translator = GoogleTranslator(source='auto', target='zh-TW')
# 簡體轉繁體轉換器
cc = OpenCC('s2twp')

executor = ThreadPoolExecutor(max_workers=4)

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/login')
def login():
    return send_from_directory('.', 'login.html')

@app.route('/transcribe', methods=['POST'])
def transcribe_handler():
    try:
        if 'file' not in request.files or 'chunkNumber' not in request.form or 'totalChunks' not in request.form or 'fileName' not in request.form:
            return jsonify({"error": "缺少必要的參數"}), 400

        file = request.files['file']
        chunk_number = int(request.form['chunkNumber'])
        total_chunks = int(request.form['totalChunks'])
        file_name = secure_filename(request.form['fileName'])

        if chunk_number == 1:
            session_id = str(uuid.uuid4())
            session['session_id'] = session_id
            session['file_path'] = tempfile.mktemp()
        else:
            session_id = session.get('session_id')
            if not session_id:
                return jsonify({"error": "Session ID not found"}), 400

        file_path = session['file_path']

        with open(file_path, 'ab') as f:
            f.write(file.read())

        if chunk_number == total_chunks:
            @copy_current_request_context
            def transcribe_and_store(file_path, session_id):
                return transcribe_audio(file_path, session_id)

            future = executor.submit(transcribe_and_store, file_path, session_id)
            try:
                transcription_result = future.result(timeout=3600)  # 設置超時時間為3600秒
            except FuturesTimeoutError:
                return jsonify({"error": "轉錄超時"}), 500
            return jsonify({"text": transcription_result, "sessionID": session_id})  # 返回 session ID

        return jsonify({"sessionID": session_id}), 200

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

def transcribe_audio(file_path, session_id):
    try:
        print(f"Transcribing file at {file_path}")  # 添加日誌

        # 語音識別
        result = model.transcribe(file_path)

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

        session[session_id] = 100
        os.remove(file_path)  # 刪除臨時文件
        return "\n".join(transcriptions)
    except Exception as e:
        print(f"Error in transcribe_audio: {e}")
        raise

def format_time(seconds):
    hours, remainder = divmod(seconds, 3600)
    minutes, seconds = divmod(remainder, 60)
    return f"{int(hours):02}:{int(minutes):02}:{int(seconds):02}"

if __name__ == '__main__':
    serve(app, host='0.0.0.0', port=5000)
