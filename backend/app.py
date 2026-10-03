from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Railway MySQL connection using PyMySQL
mysql_url = os.getenv("MYSQL_URL")

if mysql_url:
    mysql_url = mysql_url.replace(
        "mysql://",
        "mysql+pymysql://",
        1
    )

app.config["SQLALCHEMY_DATABASE_URI"] = mysql_url
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)


# User database model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)


# Create database tables
with app.app_context():
    db.create_all()


# Register API
@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()

    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({
            "error": "Username and password are required"
        }), 400

    existing_user = User.query.filter_by(username=username).first()

    if existing_user:
        return jsonify({
            "error": "Username already exists"
        }), 409

    new_user = User(
        username=username,
        password=password
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({
        "message": "User registered successfully!"
    }), 201


# Home API
# Login API
@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()

    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({
            "error": "Username and password are required"
        }), 400

    user = User.query.filter_by(username=username).first()

    if not user:
        return jsonify({
            "error": "Invalid username or password"
        }), 401

    if user.password != password:
        return jsonify({
            "error": "Invalid username or password"
        }), 401

    return jsonify({
        "message": "Login successful!",
        "username": user.username
    }), 200
@app.route("/")
def home():
    return jsonify({
        "message": "Grow100 Backend is running!"
    })


# Test database connection
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


# Run Flask app
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))

    app.run(
        host="0.0.0.0",
        port=port
    )