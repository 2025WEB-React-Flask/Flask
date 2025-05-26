from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
from functools import wraps
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy_utils import database_exists, create_database
import traceback
from openai import OpenAI
import os

# .env 로드 및 API 키 설정
load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=openai_api_key)

# Flask 앱 초기화
app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"], supports_credentials=True)

# 환경 설정
app.config['SECRET_KEY'] = "your-secret-key"
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://root:2021563047!@localhost/free_board'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# DB 존재 여부 확인 후 생성
engine = create_engine(app.config['SQLALCHEMY_DATABASE_URI'])
if not database_exists(engine.url):
    print("DB가 존재하지 않아 새로 생성합니다.")
    create_database(engine.url)
else:
    print("DB가 이미 존재합니다.")

# DB 초기화
db = SQLAlchemy(app)

# ------------------ 모델 정의 ------------------

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)

class Post(db.Model):
    __tablename__ = 'posts'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)
    author = db.Column(db.String(80), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    views = db.Column(db.Integer, default=0)

class Comment(db.Model):
    __tablename__ = 'comments'
    id = db.Column(db.Integer, primary_key=True)
    post_id = db.Column(db.Integer, db.ForeignKey('posts.id'), nullable=False)
    author = db.Column(db.String(80), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

# ------------------ JWT 인증 데코레이터 ------------------

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split()[1]
        if not token:
            return jsonify({"message": "토큰 없음"}), 401
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.filter_by(id=data['user_id']).first()
        except Exception as e:
            return jsonify({"message": "유효하지 않은 토큰"}), 401
        if not current_user:
            return jsonify({"message": "사용자 없음"}), 404
        return f(current_user, *args, **kwargs)
    return decorated

# ------------------ 사용자 API ------------------

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data['username']
    email = data['email']
    password = generate_password_hash(data['password'])

    if User.query.filter((User.username == username) | (User.email == email)).first():
        return jsonify({"message": "이미 존재하는 사용자입니다."}), 400

    new_user = User(username=username, email=email, password=password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "회원가입 성공"})

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data['username']
    password = data['password']

    user = User.query.filter_by(username=username).first()
    if not user or not check_password_hash(user.password, password):
        return jsonify({"message": "아이디 또는 비밀번호 오류"}), 401

    token = jwt.encode({
        'user_id': user.id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1)
    }, app.config['SECRET_KEY'], algorithm="HS256")

    return jsonify({
        "token": token,
        "user": {"id": user.id, "username": user.username, "is_admin": user.is_admin}
    })

@app.route('/logout', methods=['POST'])
def logout():
    return jsonify({"message": "로그아웃 완료"})

# ------------------ 게시글 API ------------------

@app.route('/api/posts', methods=['GET'])
def get_posts():
    search = request.args.get('search', '')
    if search:
        posts = Post.query.filter(
            (Post.title.ilike(f'%{search}%')) | (Post.author.ilike(f'%{search}%'))
        ).order_by(Post.created_at.desc()).all()
    else:
        posts = Post.query.order_by(Post.created_at.desc()).all()

    return jsonify([{
        "id": p.id,
        "title": p.title,
        "content": p.content,
        "author": p.author,
        "created_at": p.created_at.isoformat(),
        "views": p.views
    } for p in posts])

@app.route('/api/posts', methods=['POST'])
@token_required
def create_post(current_user):
    data = request.json
    new_post = Post(
        title=data.get('title'),
        content=data.get('content'),
        author=current_user.username
    )
    db.session.add(new_post)
    db.session.commit()
    return jsonify({"message": "게시글 작성 완료"})

@app.route('/api/posts/<int:post_id>', methods=['PUT'])
@token_required
def update_post(current_user, post_id):
    data = request.json
    post = Post.query.get(post_id)
    if not post:
        return jsonify({"message": "게시글 없음"}), 404
    if post.author != current_user.username:
        return jsonify({"message": "수정 권한 없음"}), 403

    post.title = data.get('title')
    post.content = data.get('content')
    db.session.commit()
    return jsonify({
        "id": post.id,
        "title": post.title,
        "content": post.content,
        "author": post.author,
        "created_at": post.created_at.isoformat(),
        "views": post.views
    })

@app.route('/api/posts/<int:post_id>', methods=['DELETE'])
@token_required
def delete_post(current_user, post_id):
    post = Post.query.get(post_id)
    if not post:
        return jsonify({"message": "게시글 없음"}), 404
    if post.author != current_user.username and not current_user.is_admin:
        return jsonify({"message": "삭제 권한 없음"}), 403

    db.session.delete(post)
    db.session.commit()
    return jsonify({"message": "삭제 완료"})

@app.route('/api/posts/<int:post_id>/views', methods=['POST'])
def increment_views(post_id):
    post = Post.query.get(post_id)
    if not post:
        return jsonify({"message": "게시글 없음"}), 404
    post.views += 1
    db.session.commit()
    return jsonify({
        "id": post.id,
        "title": post.title,
        "content": post.content,
        "author": post.author,
        "created_at": post.created_at.isoformat(),
        "views": post.views
    })

# ------------------ 댓글 API ------------------

@app.route('/api/posts/<int:post_id>/comments', methods=['GET'])
def get_comments(post_id):
    comments = Comment.query.filter_by(post_id=post_id).order_by(Comment.created_at.asc()).all()
    return jsonify([{
        "id": c.id,
        "post_id": c.post_id,
        "author": c.author,
        "content": c.content,
        "created_at": c.created_at.isoformat()
    } for c in comments])

@app.route('/api/posts/<int:post_id>/comments', methods=['POST'])
@token_required
def add_comment(current_user, post_id):
    data = request.json
    comment = Comment(
        post_id=post_id,
        author=current_user.username,
        content=data.get('content')
    )
    db.session.add(comment)
    db.session.commit()
    return jsonify({"message": "댓글 작성 완료"})

@app.route('/api/comments/<int:comment_id>', methods=['PUT'])
@token_required
def update_comment(current_user, comment_id):
    data = request.json
    comment = Comment.query.get(comment_id)
    if not comment:
        return jsonify({"message": "댓글 없음"}), 404
    if comment.author != current_user.username:
        return jsonify({"message": "수정 권한 없음"}), 403

    comment.content = data.get('content')
    db.session.commit()
    return jsonify({
        "id": comment.id,
        "post_id": comment.post_id,
        "author": comment.author,
        "content": comment.content,
        "created_at": comment.created_at.isoformat()
    })

@app.route('/api/comments/<int:comment_id>', methods=['DELETE'])
@token_required
def delete_comment(current_user, comment_id):
    comment = Comment.query.get(comment_id)
    if not comment:
        return jsonify({"message": "댓글 없음"}), 404
    post = Post.query.get(comment.post_id)
    if not post:
        return jsonify({"message": "게시글 없음"}), 404
    if comment.author != current_user.username and post.author != current_user.username and not current_user.is_admin:
        return jsonify({"message": "삭제 권한 없음"}), 403

    db.session.delete(comment)
    db.session.commit()
    return jsonify({"message": "댓글 삭제 완료"})

# ------------------ 게시글 요약 API (OpenAI) ------------------

@app.route('/api/summarize', methods=['POST'])
@token_required
def summarize_post(current_user):
    data = request.json
    content = data.get('content')
    if not content:
        return jsonify({"message": "내용이 비어있습니다."}), 400
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "다음 게시글 내용을 간단하게 요약해줘."},
                {"role": "user", "content": content}
            ],
            temperature=0.5,
            max_tokens=300
        )
        summary = response.choices[0].message.content.strip()
        return jsonify({"summary": summary})
    except Exception as e:
        traceback.print_exc()
        return jsonify({"message": "요약 실패", "error": str(e)}), 500

# ------------------ 앱 실행 ------------------

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
