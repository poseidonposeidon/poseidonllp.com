from flask import Flask, request, jsonify
from flask_cors import CORS
from ftplib import FTP
import os
from werkzeug.utils import secure_filename
import urllib.parse

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024  # 设置为500MB
CORS(app, resources={r"/*": {"origins": "*"}})

# 设置FTP服务器信息
FTP_HOST = '114.32.65.180'
FTP_USER = 'Henry'
FTP_PASS = '123456'

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
                return jsonify({"error": f"FTP上传失败: {e}"}), 500
            finally:
                ftp.close()
                os.remove(filename)

            return jsonify({"message": f"文件 {filename} 已成功上传到FTP服务器"}), 200
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

        files = ftp.nlst()
        filtered_files = [file for file in files if file != 'ssl']
        ftp.quit()
        files_decoded = [urllib.parse.unquote(f) for f in filtered_files]
        return jsonify({"files": files_decoded})
    except Exception as e:
        print(f"Error in list_files: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
