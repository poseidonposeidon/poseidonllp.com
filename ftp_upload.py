from flask import Flask, request, jsonify
from ftplib import FTP
import os
from werkzeug.utils import secure_filename
import urllib.parse
from flask_cors import CORS
import zipfile
import time

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024  # 设置为500MB
app.config['UPLOAD_TIMEOUT'] = 3600  # 设置超时为1小时（单位：秒）
CORS(app, resources={r"/*": {"origins": "*"}})  # 允许所有来源

# 设置FTP服务器信息
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
            return jsonify({"error": "没有上传文件"}), 400
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "文件名为空"}), 400
        if file:
            filename = secure_filename(file.filename)
            # 确保文件名以UTF-8格式进行编码
            filename_encoded = urllib.parse.quote(filename)
            compressed_filename = compress_file(filename)
            file.save(compressed_filename)

            ftp = FTP()
            ftp.set_debuglevel(0)  # 禁用详细的调试日志
            try:
                ftp.connect(FTP_HOST, timeout=3600)
                ftp.login(FTP_USER, FTP_PASS)
                ftp.set_pasv(True)  # 启用被动模式
                with open(compressed_filename, 'rb') as f:
                    retry_on_failure(lambda: ftp.storbinary(f'STOR {filename_encoded}.zip', f))
                ftp.quit()
            except Exception as e:
                return jsonify({"error": f"FTP上传失败: {e}"}), 500
            finally:
                ftp.close()
                os.remove(compressed_filename)  # 上传完成后删除本地文件

            return jsonify({"message": f"文件 {filename} 已成功上传到FTP服务器"})
        return jsonify({"error": "无效的文件"}), 400
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

        # 列出所有文件和文件夹
        files = ftp.nlst()

        # 过滤掉 `ssl` 文件夹
        filtered_files = [file for file in files if file != 'ssl']

        ftp.quit()

        # 确保文件名以UTF-8格式进行解码
        files_decoded = [urllib.parse.unquote(f) for f in filtered_files]
        return jsonify({"files": files_decoded})
    except Exception as e:
        print(f"Error in list_files: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)  # 确保 port 为 5001
