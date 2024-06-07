from flask import Flask, request, jsonify
from ftplib import FTP
import os
from werkzeug.utils import secure_filename
import urllib.parse
from flask_cors import CORS
import zipfile
import time

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024  # 設置為500MB
app.config['UPLOAD_TIMEOUT'] = 3600  # 設置超時為1小時（單位：秒）
CORS(app, resources={r"/*": {"origins": "https://www.poseidonllp.com"}})  # 允許指定來源

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
            file.save(filename)

            ftp = FTP()
            ftp.set_debuglevel(0)
            try:
                ftp.connect(FTP_HOST)
                ftp.login(FTP_USER, FTP_PASS)
                ftp.set_pasv(True)
                with open(filename, 'rb') as f:
                    ftp.storbinary(f'STOR %s' % urllib.parse.quote(filename), f)
                ftp.quit()
            except Exception as e:
                return jsonify({"error": f"FTP上傳失敗: {e}"}), 500
            finally:
                ftp.close()
                os.remove(filename)

            return jsonify({"message": f"文件 {filename} 已成功上傳到FTP伺服器"}), 200
        return jsonify({"error": "無效的文件"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/list_files', methods=['GET'])
def list_files():
    try:
        ftp = FTP()
        ftp.set_debuglevel(0)
        ftp.connect(FTP_HOST)
        ftp.login(FTP_USER, FTP_PASS)
        ftp.set_pasv(True)

        # 列出所有文件和文件夾
        files = ftp.nlst()

        # 過濾掉 `ssl` 文件夾
        filtered_files = [file for file in files if file != 'ssl']

        ftp.quit()

        # 確保文件名以UTF-8格式進行解碼
        files_decoded = [urllib.parse.unquote(f) for f in filtered_files]
        return jsonify({"files": files_decoded})
    except Exception as e:
        print(f"Error in list_files: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)  # 確保 port 為 5001
