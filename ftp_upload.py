from flask import Flask, request, jsonify
from flask_cors import CORS
from ftplib import FTP
import os
from werkzeug.utils import secure_filename
import urllib.parse
import tempfile

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024  # 設置為500MB
CORS(app, resources={r"/*": {"origins": "*"}})

# 設置FTP伺服器信息
FTP_HOST = '114.32.65.180'
FTP_USER = 'Henry'
FTP_PASS = '123456'

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

            ftp = FTP()
            ftp.set_debuglevel(1)  # 打開調試日誌來捕捉更多信息
            try:
                ftp.connect(FTP_HOST)
                ftp.login(FTP_USER, FTP_PASS)
                ftp.set_pasv(True)
                with open(temp_path, 'rb') as f:
                    ftp.storbinary(f'STOR {urllib.parse.quote(filename)}', f)
                ftp.quit()
            except Exception as e:
                print(f"FTP上傳失敗: {e}")
                return jsonify({"error": f"FTP上傳失敗: {e}"}), 500
            finally:
                ftp.close()
                os.remove(temp_path)  # 上傳完成後刪除本地文件

            return jsonify({"message": f"文件 {filename} 已成功上傳到FTP伺服器"}), 200
        return jsonify({"error": "無效的文件"}), 400
    except Exception as e:
        print(f"上傳過程中出錯: {e}")
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

        # 過濾掉不需要顯示的資料夾
        excluded_directories = ['ssl']
        files_filtered = [file for file in files if not any(file.startswith(dir) for dir in excluded_directories)]

        # 確保文件名以UTF-8格式進行解碼
        files_decoded = [urllib.parse.unquote(f) for f in files_filtered]
        return jsonify({"files": files_decoded})
    except Exception as e:
        print(f"Error in list_files: {e}")  # 添加日誌
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
