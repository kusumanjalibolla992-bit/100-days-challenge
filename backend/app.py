from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# =========================
# DATABASE CONNECTION
# =========================

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


# =========================
# USER TABLE
# =========================

class User(db.Model):

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    username = db.Column(
        db.String(100),
        unique=True,
        nullable=False
    )

    password = db.Column(
        db.String(255),
        nullable=False
    )


# =========================
# PROGRESS TABLE
# =========================

class Progress(db.Model):

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("user.id"),
        nullable=False
    )

    task_key = db.Column(
        db.String(100),
        nullable=False
    )

    completed = db.Column(
        db.Boolean,
        default=False,
        nullable=False
    )


# =========================
# CREATE TABLES
# =========================

with app.app_context():
    db.create_all()


# =========================
# REGISTER
# =========================

@app.route("/api/register", methods=["POST"])
def register():

    data = request.get_json()

    username = data.get("username")
    password = data.get("password")

    if not username or not password:

        return jsonify({
            "error": "Username and password are required"
        }), 400

    existing_user = User.query.filter_by(
        username=username
    ).first()

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


# =========================
# LOGIN
# =========================

@app.route("/api/login", methods=["POST"])
def login():

    data = request.get_json()

    username = data.get("username")
    password = data.get("password")

    if not username or not password:

        return jsonify({
            "error": "Username and password are required"
        }), 400

    user = User.query.filter_by(
        username=username
    ).first()

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
        "username": user.username,
        "user_id": user.id
    }), 200


# =========================
# SAVE / UPDATE PROGRESS
# =========================

@app.route("/api/progress", methods=["POST"])
def save_progress():

    data = request.get_json()

    username = data.get("username")
    task_key = data.get("taskKey")
    completed = data.get("completed")

    if not username or not task_key:

        return jsonify({
            "error": "Username and task key are required"
        }), 400

    user = User.query.filter_by(
        username=username
    ).first()

    if not user:

        return jsonify({
            "error": "User not found"
        }), 404

    progress = Progress.query.filter_by(
        user_id=user.id,
        task_key=task_key
    ).first()

    if progress:

        progress.completed = completed

    else:

        progress = Progress(
            user_id=user.id,
            task_key=task_key,
            completed=completed
        )

        db.session.add(progress)

    db.session.commit()

    return jsonify({
        "message": "Progress saved successfully!"
    }), 200


# =========================
# GET USER PROGRESS
# =========================

@app.route("/api/progress/<username>", methods=["GET"])
def get_progress(username):

    user = User.query.filter_by(
        username=username
    ).first()

    if not user:

        return jsonify({
            "error": "User not found"
        }), 404

    progress_records = Progress.query.filter_by(
        user_id=user.id,
        completed=True
    ).all()

    progress_data = {}

    for record in progress_records:

        progress_data[record.task_key] = True

    return jsonify({
        "username": username,
        "progress": progress_data
    }), 200


# =========================
# RESET USER PROGRESS
# =========================

@app.route("/api/progress/<username>", methods=["DELETE"])
def reset_progress(username):

    user = User.query.filter_by(
        username=username
    ).first()

    if not user:

        return jsonify({
            "error": "User not found"
        }), 404

    Progress.query.filter_by(
        user_id=user.id
    ).delete()

    db.session.commit()

    return jsonify({
        "message": "Progress reset successfully!"
    }), 200


# =========================
# HOME
# =========================

@app.route("/")
def home():

    return jsonify({
        "message": "Grow100 Backend is running!"
    })


# =========================
# TEST DATABASE
# =========================

@app.route("/api/test-db")
def test_db():

    try:

        db.session.execute(
            db.text("SELECT 1")
        )

        return jsonify({
            "message": "MySQL database connected successfully!"
        })

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500


# =========================
# START SERVER
# =========================

if __name__ == "__main__":

    port = int(
        os.environ.get(
            "PORT",
            5000
        )
    )

    app.run(
        host="0.0.0.0",
        port=port
    )