from flask import Flask, request, jsonify, send_file, render_template
import yt_dlp
import os
from werkzeug.utils import secure_filename
import humanize

# Create app with explicit template and static folders
app = Flask(__name__,
            template_folder='templates',
            static_folder='static')

DOWNLOAD_FOLDER = 'downloads'
if not os.path.exists(DOWNLOAD_FOLDER):
    os.makedirs(DOWNLOAD_FOLDER)

# Add root route to serve the index.html
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/convert', methods=['POST'])
def convert():
    data = request.json
    url = data.get('url')
    format_type = data.get('format', 'mp3')
    quality = data.get('quality', '320')

    if not url:
        return jsonify({'error': 'URL is required'}), 400

    try:
        filename = secure_filename(f"download_{os.urandom(4).hex()}")
        
        ydl_opts = {
            'format': 'bestaudio/best' if format_type == 'mp3' else 'bestvideo+bestaudio',
            'outtmpl': f'{DOWNLOAD_FOLDER}/{filename}.%(ext)s',
        }

        if format_type == 'mp3':
            ydl_opts.update({
                'postprocessors': [{
                    'key': 'FFmpegExtractAudio',
                    'preferredcodec': 'mp3',
                    'preferredquality': quality,
                }],
            })

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            title = info.get('title', 'Unknown Title')
            
        final_filename = f"{filename}.{'mp3' if format_type == 'mp3' else 'mp4'}"
        file_path = os.path.join(DOWNLOAD_FOLDER, final_filename)
        file_size = humanize.naturalsize(os.path.getsize(file_path))

        return jsonify({
            'success': True,
            'filename': final_filename,
            'title': title,
            'size': file_size
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/download/<filename>')
def download(filename):
    try:
        return send_file(
            f"{DOWNLOAD_FOLDER}/{filename}",
            as_attachment=True
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 404

if __name__ == '__main__':
    app.run(debug=True) 