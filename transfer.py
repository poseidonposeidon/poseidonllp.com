import whisper
import os
from opencc import OpenCC
import shutil
import datetime
from deep_translator import GoogleTranslator
from tqdm import tqdm

# 初始化 Whisper 模型
model = whisper.load_model("large-v2")
# 初始化翻譯器
translator = GoogleTranslator(source='auto', target='zh-TW')

# 指定路徑
directory_path = r"C:\Users\User\Desktop\錄音檔"
processed_directory = r"C:\Users\User\Desktop\錄音檔(已轉檔)"
output_directory = r"C:\Users\User\Desktop\法說會逐字稿\0603"

# 獲取所有符合條件的文件
files = [f for f in os.listdir(directory_path) if f.endswith((".mp3", ".m4a", ".mp4", ".mov"))]

# 使用 tqdm 顯示進度條
pbar = tqdm(total=len(files), desc="Processing files")
for filename in files:
    audio_filename = os.path.join(directory_path, filename)
    base_name = os.path.splitext(os.path.basename(audio_filename))[0]
    output_txt_filename = f"{base_name}.txt"
    output_txt_path = os.path.join(output_directory, output_txt_filename)

    # 語音識別
    result = model.transcribe(audio_filename)
    pbar.update(1)  # 更新進度條，表示一個文件處理完畢

    # 獲取語言
    language = result["language"]

    # 處理每段的文字和時間
    segments = result['segments']
    cc = OpenCC('s2twp')  # 簡體轉繁體

    with open(output_txt_path, "w", encoding="utf-8") as text_file:
        for segment in segments:
            text = segment["text"]
            start = segment["start"]
            end = segment["end"]

            # 如果是英文，進行翻譯
            if language == "en":
                transcription_traditional = translator.translate(text)
            else:
                transcription_traditional = cc.convert(text)

            start_time = datetime.datetime.fromtimestamp(start)
            end_time = datetime.datetime.fromtimestamp(end)
            start_formatted = start_time.strftime("%H:%M:%S")
            end_formatted = end_time.strftime("%H:%M:%S")
            text_file.write(f"{start_formatted}-{end_formatted}: {transcription_traditional}\n")

    # 移動到指定資料夾
    processed_audio_path = os.path.join(processed_directory, filename)
    shutil.move(audio_filename, processed_audio_path)

    print(f"文字檔已成功保存到 {output_txt_path}")
    print(f"音檔已移動到 {processed_audio_path}")
pbar.close()  # 結束進度條
