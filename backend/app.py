from flask import Flask, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Railway MySQL connection
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("MYSQL_URL")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)


@app.route("/")
def home():
    return jsonify({
        "message": "Grow100 Backend is running!"
    })


@app.route("/api/test-db")
def test_db():
    try:
        db.session.execute(db.text("SELECT 1"))
        return jsonify({
            "message": "MySQL database connected successfully!"
        })
    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500


if __name__ == "__main__":
    app.run(debug=True)