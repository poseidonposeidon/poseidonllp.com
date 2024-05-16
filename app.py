from flask import Flask, request, jsonify, send_from_directory
import whisper
from opencc import OpenCC
from deep_translator import GoogleTranslator
import os
import datetime
from flask_cors import CORS
import tempfile
import torch
from concurrent.futures import ThreadPoolExecutor
import uuid

# 禁用 FP16 使用 FP32
os.environ["WHISPER_DISABLE_F16"] = "1"

app = Flask(__name__)
app.secret_key = 'supersecretkey'  # 用於 session
CORS(app)

# 确认 GPU 是否可用，并将模型加载到 GPU 上
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Using device: {device}")
model = whisper.load_model("large-v2").to(device)

# 初始化翻译器
translator = GoogleTranslator(source='auto', target='zh-TW')
# 简体转繁体转换器
cc = OpenCC('s2twp')

# 创建线程池执行器
executor = ThreadPoolExecutor(max_workers=4)

# 用于存储进度信息的全局变量
progress_dict = {}

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
            return jsonify({"error": "没有上传文件"}), 400
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "文件名为空"}), 400
        if file and file.filename.endswith((".mp3", ".m4a", ".mp4", ".mov")):
            # 创建一个唯一的任务 ID
            task_id = str(uuid.uuid4())
            progress_dict[task_id] = 0
            # 使用线程池异步处理转录请求
            executor.submit(transcribe_audio, file, task_id)
            return jsonify({"task_id": task_id})
        return jsonify({"error": "无效的文件格式"}), 400
    except Exception as e:
        print(f"Error in transcribe_handler: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/progress/<task_id>')
def progress(task_id):
    progress = progress_dict.get(task_id, 0)
    return jsonify({"progress": progress})

def transcribe_audio(file, task_id):
    try:
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            temp_path = temp_file.name
            file.save(temp_path)

        # 语音识别
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

            # 更新进度
            progress_dict[task_id] = int(((i + 1) / total_segments) * 100)

        os.remove(temp_path)  # 删除临时文件
        progress_dict[task_id] = 100  # 设置为 100%，表示完成
        return "\n".join(transcriptions)
    except Exception as e:
        print(f"Error in transcribe_audio: {e}")
        progress_dict[task_id] = 0  # 如果出现错误，重置进度

def format_time(seconds):
    hours, remainder = divmod(seconds, 3600)
    minutes, seconds = divmod(remainder, 60)
    return f"{int(hours):02}:{int(minutes):02}:{int(seconds):02}"

if __name__ == '__main__':
    app.run(debug=True, port=5000, threaded=True)
