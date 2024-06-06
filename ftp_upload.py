from flask import Flask, request, jsonify
from ftplib import FTP
import os
from werkzeug.utils import secure_filename
import urllib.parse
from flask_cors import CORS

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024  # 設置為500MB
CORS(app, resources={r"/*": {"origins": "*"}})  # 配置 CORS

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
                    ftp.storbinary(f'STOR {filename_encoded}', f)
                ftp.quit()
            except Exception as e:
                return jsonify({"error": f"FTP上傳失敗: {e}"}), 500
            finally:
                ftp.close()
                os.remove(filename)  # 上傳完成後刪除本地文件

            return jsonify({"message": f"文件 {filename} 已成功上傳到FTP伺服器"})
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

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
