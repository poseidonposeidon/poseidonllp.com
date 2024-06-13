from flask import Flask, request, jsonify
from flask_cors import CORS
from ftplib import FTP
import os
from werkzeug.utils import secure_filename
import urllib.parse
import tempfile
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FuturesTimeoutError

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 1024 * 1024 * 1024  # 設置為1024MB
CORS(app, resources={r"/*": {"origins": "*"}})

# 設置FTP伺服器信息
FTP_HOST = '114.32.65.180'
FTP_USER = 'Henry'
FTP_PASS = '123456'

executor = ThreadPoolExecutor(max_workers=4)

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
            with tempfile.NamedTemporaryFile(delete=False) as temp_file:
                temp_path = temp_file.name
                file.save(temp_path)

            def upload():
                try:
                    ftp = FTP()
                    ftp.set_debuglevel(1)  # 打開調試日誌來捕捉更多信息
                    ftp.connect(FTP_HOST)
                    ftp.login(FTP_USER, FTP_PASS)
                    ftp.set_pasv(True)

                    # 切換到"錄音檔"資料夾
                    ftp.cwd('錄音檔')

                    with open(temp_path, 'rb') as f:
                        ftp.storbinary(f'STOR {urllib.parse.quote(filename)}', f)
                    ftp.quit()
                except Exception as e:
                    return jsonify({"error": f"FTP上傳失敗: {str(e)}"}), 500
                finally:
                    ftp.close()
                    os.remove(temp_path)  # 上傳完成後刪除本地文件
                return jsonify({"message": f"文件 {filename} 已成功上傳到FTP伺服器"}), 200

            future = executor.submit(upload)
            try:
                return future.result(timeout=6000)  # 設置超時時間為6000秒
            except FuturesTimeoutError:
                return jsonify({"error": "上傳超時"}), 500
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

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
