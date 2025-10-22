from flask import Flask, request, jsonify
from flask_cors import CORS
from llm import llm_response, parse_response

app = Flask(__name__)
CORS(app)

@app.route("/api/v1/resume/generate", methods=["POST"])
def generate_resume():
    try:
        data = request.get_json()
        user_description = data.get("userDescription")
        print("desc from frontend:",user_description)

        response_text = llm_response(user_description)

        parsed_response = parse_response(response_text)

        return jsonify(parsed_response), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5000, debug=True)
