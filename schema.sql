CREATE DATABASE IF NOT EXISTS free_board;
USE free_board;



-- users 테이블 생성 (관리자 권한 추가)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL,
    is_admin TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

/*
사용자 정보 저장
+-----------+--------------+------+-----+-------------------+----------------+
| Field     | Type         | Null | Key | Default           | Extra          |
+-----------+--------------+------+-----+-------------------+----------------+
| id        | int(11)      | NO   | PRI | NULL              | auto_increment |
| username  | varchar(50)  | NO   |     | NULL              |                |
| password  | varchar(255) | NO   |     | NULL              |                |
| email     | varchar(100) | NO   |     | NULL              |                |
| is_admin  | tinyint(1)   | YES  |     | 0                 |                |
| created_at| timestamp    | NO   |     | CURRENT_TIMESTAMP |                |
+-----------+--------------+------+-----+-------------------+----------------+
*/


-- posts 테이블 생성 (조회수 추가)
CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    author VARCHAR(50) NOT NULL,
    views INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

/*
게시글 정보 저장
+------------+--------------+------+-----+-------------------+----------------+
| Field      | Type         | Null | Key | Default           | Extra          |
+------------+--------------+------+-----+-------------------+----------------+
| id         | int(11)      | NO   | PRI | NULL              | auto_increment |
| title      | varchar(100) | NO   |     | NULL              |                |
| content    | text         | NO   |     | NULL              |                |
| author     | varchar(50)  | NO   |     | NULL              |                |
| views      | int(11)      | YES  |     | 0                 |                |
| created_at | timestamp    | NO   |     | CURRENT_TIMESTAMP |                |
+------------+--------------+------+-----+-------------------+----------------+
*/


-- comments 테이블 생성
CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    author VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

/*
댓글 정보 저장
+------------+--------------+------+-----+-------------------+----------------+
| Field      | Type         | Null | Key | Default           | Extra          |
+------------+--------------+------+-----+-------------------+----------------+
| id         | int(11)      | NO   | PRI | NULL              | auto_increment |
| post_id    | int(11)      | NO   | MUL | NULL              |                |
| author     | varchar(50)  | NO   |     | NULL              |                |
| content    | text         | NO   |     | NULL              |                |
| created_at | timestamp    | NO   |     | CURRENT_TIMESTAMP |                |
+------------+--------------+------+-----+-------------------+----------------+
*/

-- 관리자 계정 생성
INSERT INTO users (username, password, email, is_admin) 
VALUES ('admin', 'admin123', 'admin@example.com', 1);
