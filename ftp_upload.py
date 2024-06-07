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
CORS(app, resources={r"/*": {"origins": "*"}})  # 允許所有來源

# 設置FTP伺服器信息
FTP_HOST = '114.32.65.180'
FTP_USER = 'Henry'
FTP_PASS = '123456'

def compress_file(filename):
    compressed_filename = f"{filename}.zip"
    with zipfile.ZipFile(compressed_filename, 'w') as zipf:
        zipf.write(filename, compress_type=zipfile.ZIP_DEFLATED)
    return compressed_filename

def retry_on_failure(func, retries=3, delay=5):
    for i in range(retries):
        try:
            return func()
        except Exception as e:
            print(f"Retrying due to error: {e}")
            time.sleep(delay)
    raise Exception("Max retries reached")

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
            compressed_filename = compress_file(filename)
            file.save(compressed_filename)

            ftp = FTP()
            ftp.set_debuglevel(0)  # 禁用詳細的調試日誌
            try:
                ftp.connect(FTP_HOST, timeout=3600)
                ftp.login(FTP_USER, FTP_PASS)
                ftp.set_pasv(True)  # 啟用被動模式
                with open(compressed_filename, 'rb') as f:
                    retry_on_failure(lambda: ftp.storbinary(f'STOR {filename_encoded}.zip', f))
                ftp.quit()
            except Exception as e:
                return jsonify({"error": f"FTP上傳失敗: {e}"}), 500
            finally:
                ftp.close()
                os.remove(compressed_filename)  # 上傳完成後刪除本地文件

            return jsonify({"message": f"文件 {filename} 已成功上傳到FTP伺服器"})
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
        files = ftp.nlst()
        ftp.quit()
        files_decoded = [urllib.parse.unquote(f) for f in files]
        return jsonify({"files": files_decoded})
    except Exception as e:
        print(f"Error in list_files: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001, ssl_context=('C:/openssl/cert.pem', 'C:/openssl/key.pem'))