from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
import os

app = Flask(__name__)

# CORSを全オリジンに対して有効化（特定ドメインのみ許可したい場合は origins=... を使う）
CORS(app, resources={r"/correct": {"origins": "*"}})

# OpenAI APIキーを環境変数から取得（例: export OPENAI_API_KEY=sk-xxxxx）
openai.api_key = os.environ.get("OPENAI_API_KEY")

@app.route('/correct', methods=['POST'])
def correct():
    try:
        data = request.get_json()
        print("✅ 受信データ:", data)

        if not data or 'text' not in data:
            print("⚠️ エラー: 'text'がリクエストに含まれていません")
            return jsonify({'error': 'No input text provided'}), 400

        original_text = data['text']
        print("📝 添削対象テキスト:", original_text)

        prompt = f"Please correct the following English sentence and provide the improved version:\n\n\"{original_text}\""

        print("📤 OpenAI API 送信中...")

        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",  # または gpt-4
            messages=[
                {"role": "system", "content": "You are an English teacher that corrects grammar and fluency."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
        )

        corrected_text = response['choices'][0]['message']['content'].strip()
        print("✅ GPTからの応答:", corrected_text)

        return jsonify({'correction': corrected_text})

    except Exception as e:
        print("❌ 例外発生:", str(e))
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # ローカル開発用に 0.0.0.0 で起動
    app.run(host='0.0.0.0', port=5002, debug=True)