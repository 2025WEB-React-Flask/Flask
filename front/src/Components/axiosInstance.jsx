import axios from "axios";

const instance = axios.create({
  baseURL: "http://127.0.0.1:5000", // API 기본 URL
  withCredentials: true, // 크로스 도메인 요청 시 쿠키 전달
  headers: {
    "Content-Type": "application/json", // 요청 헤더 설정
  },
});

// 요청 인터셉터: 모든 요청에 토큰을 자동으로 헤더에 추가
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // 로컬 스토리지에서 토큰 가져오기
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // 토큰을 Authorization 헤더에 추가
  }
  return config;
});

// 응답 인터셉터: 401 오류가 발생하면 로그인 화면으로 리다이렉션
instance.interceptors.response.use(
  (res) => res, // 성공적인 응답 그대로 반환
  (error) => {
    if (error.response?.status === 401) {
      alert("로그인이 필요합니다.");
      window.location.href = "/"; // 로그인 페이지로 리다이렉션
    }
    return Promise.reject(error); // 오류 반환
  }
);

export default instance;
