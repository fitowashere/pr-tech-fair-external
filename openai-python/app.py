from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import openai
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

endpoint = os.getenv("ENDPOINT")
api_key = os.getenv("API_KEY")
deployment = os.getenv("DEPLOYMENT")
search_endpoint = os.getenv("SEARCH_ENDPOINT")
search_api_key = os.getenv("SEARCH_API_KEY")
search_index_name = os.getenv("SEARCH_INDEX_NAME")

client = openai.AzureOpenAI(
    base_url=f"{endpoint}/openai/deployments/{deployment}/extensions",
    api_key=api_key,
    api_version="2023-08-01-preview",
)

@app.route('/')
def index():
    return render_template('tempindex.html')

@app.route('/chat', methods=['POST'])
def chat():
    message = request.json.get('message')
    completion = client.chat.completions.create(
        model=deployment,
        messages=[{"role": "user", "content": message}],
        extra_body={
            "dataSources": [{
                "type": "AzureCognitiveSearch",
                "parameters": {
                    "endpoint": search_endpoint,
                    "key": search_api_key,
                    "indexName": search_index_name
                }
            }]
        }
    )
    response = [choice.message.content for choice in completion.choices if choice.message.role == "assistant"]
    return jsonify({'response': response[0] if response else ''})

if __name__ == '__main__':
    app.run(debug=True)
