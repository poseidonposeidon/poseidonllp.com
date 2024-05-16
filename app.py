from flask import Flask, request, jsonify, render_template, session
import whisper
from opencc import OpenCC
from deep_translator import GoogleTranslator
import os
import datetime
from flask_cors import CORS
import tempfile
import torch

# 禁用 FP16 使用 FP32
os.environ["WHISPER_DISABLE_F16"] = "1"

app = Flask(__name__)
app.secret_key = 'supersecretkey'  # 用於 session
CORS(app)

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
    return render_template('index.html')

@app.route('/transcribe', methods=['POST'])
def transcribe_handler():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "沒有上傳文件"}), 400
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "文件名為空"}), 400
        if file and file.filename.endswith((".mp3", ".m4a", ".mp4", ".mov")):
            session['progress'] = 0
            transcription_result = transcribe_audio(file)
            return jsonify({"text": transcription_result})
        return jsonify({"error": "無效的文件格式"}), 400
    except Exception as e:
        print(f"Error in transcribe_handler: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/progress')
def progress():
    return jsonify({"progress": session.get('progress', 0)})

def transcribe_audio(file):
    try:
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            temp_path = temp_file.name
            file.save(temp_path)

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

            # 更新進度
            session['progress'] = int(((i + 1) / total_segments) * 100)

        os.remove(temp_path)  # 刪除臨時文件
        session['progress'] = 100  # 設置為 100%，表示完成
        return "\n".join(transcriptions)
    except Exception as e:
        print(f"Error in transcribe_audio: {e}")
        raise

def format_time(seconds):
    hours, remainder = divmod(seconds, 3600)
    minutes, seconds = divmod(remainder, 60)
    return f"{int(hours):02}:{int(minutes):02}:{int(seconds):02}"

if __name__ == '__main__':
    app.run(debug=True, port=5000)
