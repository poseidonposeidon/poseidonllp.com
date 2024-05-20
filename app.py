from flask import Flask, request, jsonify, send_from_directory, session
import whisper
from opencc import OpenCC
from deep_translator import GoogleTranslator
import os
import tempfile
import torch
import uuid
from flask_cors import CORS

# 禁用 FP16 使用 FP32
os.environ["WHISPER_DISABLE_F16"] = "1"

app = Flask(__name__)
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

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/login')
def login():
    return send_from_directory('.', 'login.html')

@app.route('/transcribe', methods=['POST'])
def transcribe_handler():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "沒有上傳文件"}), 400
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "文件名為空"}), 400
        if file and file.filename.endswith((".mp3", ".m4a", ".mp4", ".mov")):
            session_id = str(uuid.uuid4())  # 生成唯一 session ID
            session[session_id] = 0
            transcription_result = transcribe_audio(file, session_id)
            return jsonify({"text": transcription_result, "sessionID": session_id})  # 返回 session ID
        return jsonify({"error": "無效的文件格式"}), 400
    except Exception as e:
        print(f"Error in transcribe_handler: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/progress/<session_id>')
def progress(session_id):
    if session_id in session:
        progress = session.get(session_id, 0)  # 獲取特定 session ID 的進度
        return jsonify({"progress": progress})
    else:
        return jsonify({"error": "Session ID not found"}), 404

def transcribe_audio(file, session_id):
    try:
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            temp_path = temp_file.name
            file.save(temp_path)

        print(f"Transcribing file at {temp_path}")  # 添加日誌

        # 語音識別
        result = model.transcribe(temp_path)
        #print(f"Transcription result: {result}")  # 添加日誌

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
        return "\n".join(transcriptions)
    except Exception as e:
        print(f"Error in transcribe_audio: {e}")
        raise

def format_time(seconds):
    hours, remainder = divmod(seconds, 3600)
    minutes, seconds = divmod(remainder, 60)
    return f"{int(hours):02}:{int(minutes):02}:{int(seconds):02}"

# if __name__ == '__main__':
#     app.run(debug=True, port=5000)
if __name__ == '__main__':
   app.run(host='0.0.0.0', port=5000)