import axios from "./axiosInstance"; // Axios 인스턴스 가져오기

// 로그인
export const login = async (username, password) => {
  const response = await axios.post("/login", { username, password }); // /login API에 아이디와 비밀번호를 POST 요청
  return response.data; // 응답 데이터를 반환
};

// 회원가입
export const register = async (username, email, password) => {
  const response = await axios.post("/register", { username, email, password }); // /register API에 회원가입 정보 POST 요청
  return response.data; // 응답 데이터 반환
};

// 로그아웃
export const logout = async () => {
  await axios.post("/logout"); // /logout API에 POST 요청하여 로그아웃 처리
};

// 게시물 전체 조회
export const fetchPosts = async () => {
  const response = await axios.get("/api/posts"); // /api/posts API에 GET 요청하여 게시물 목록 가져오기
  return response.data; // 응답 데이터(게시물 목록) 반환
};

// 게시물 상세 조회 (현재 사용되지 않음)
export const fetchPostById = async (id) => {
  const response = await axios.get(`/api/posts/${id}`); // 특정 게시물의 ID를 사용하여 상세 조회
  return response.data; // 게시물 상세 데이터 반환
};

// 게시물 생성
export const createPost = async (title, content) => {
  const response = await axios.post("/api/posts", { title, content }); // 게시물 제목과 내용을 POST 요청하여 생성
  return response.data; // 생성된 게시물 반환
};

// 게시물 수정
export const updatePost = async (id, title, content) => {
  const response = await axios.put(`/api/posts/${id}`, { title, content }); // 게시물 수정 요청
  return response.data; // 수정된 게시물 반환
};

// 게시물 삭제
export const deletePost = async (id) => {
  await axios.delete(`/api/posts/${id}`); // 게시물 ID를 사용하여 DELETE 요청
};

// 게시물 조회수 증가
export const incrementPostView = async (id) => {
  const response = await axios.post(`/api/posts/${id}/views`);
  return response.data;
};

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// 댓글 목록 조회
export const fetchComments = async (postId) => {
  const response = await axios.get(`/api/posts/${postId}/comments`);
  return response.data;
};

// 댓글 작성
export const createComment = async (postId, content) => {
  const response = await axios.post(`/api/posts/${postId}/comments`, {
    content,
  });
  return response.data;
};

// 댓글 삭제
export const deleteComment = async (commentId) => {
  const response = await axios.delete(`/api/comments/${commentId}`);
  return response.data;
};

// 댓글 수정
export const updateComment = async (commentId, content) => {
  const response = await axios.put(`/api/comments/${commentId}`, { content });
  return response.data;
};

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// 게시글 요약 요청
export const summarizePost = async (content) => {
  const response = await axios.post("/api/summarize", { content });
  return response.data.summary;
};