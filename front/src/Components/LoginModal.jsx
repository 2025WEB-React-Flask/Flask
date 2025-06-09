import { useState } from "react";
import { X } from "lucide-react";
import { login } from "./PostService"; // 로그인 API

export default function LoginModal({
  onClose,
  onClickRegisting,
  onLoginSuccess,
  isLoading, // 로딩 상태
}) {
  const [username, setUsername] = useState(""); // 아이디 입력값
  const [password, setPassword] = useState(""); // 비밀번호 입력값
  const [loginLoading, setLoginLoading] = useState(false); // 로컬 로딩 상태

  // 로그인 처리 함수
  const handleLogin = async () => {
    if (!username || !password) {
      alert("아이디와 비밀번호를 입력해주세요.");
      return;
    }

    try {
      setLoginLoading(true); // 로그인 시작 시 로딩 상태 설정
      const response = await login(username, password); // login API 호출
      localStorage.setItem("token", response.token); // 로그인 성공 시 토큰 저장
      localStorage.setItem("user", JSON.stringify(response.user)); // 사용자 정보 저장
      alert("로그인 성공!");
      
      // 로그인 성공 시 콜백 함수 호출
      if (onLoginSuccess) {
        onLoginSuccess(response.user);
      }
      
      onClose(); // 모달 닫기
    } catch (error) {
      alert(
        "로그인 실패: " + (error?.response?.data?.message || error?.message)
      ); // 에러 처리
    } finally {
      setLoginLoading(false); // 로그인 완료 시 로딩 상태 해제
    }
  };

  // 실제 로딩 상태: 외부에서 전달된 상태 또는 로컬 상태
  const isActuallyLoading = isLoading || loginLoading;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose} // 모달 닫기
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-2xl font-bold text-center mb-6">로그인</div>
        {/* 아이디 입력 */}
        <div className="my-2">
          <input
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="text"
            placeholder="ID"
            value={username}
            onChange={(e) => setUsername(e.target.value)} // 아이디 입력값 상태 관리
          />
        </div>
        {/* 비밀번호 입력 */}
        <div className="my-2">
          <input
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="password"
            placeholder="PASSWORD"
            value={password}
            onChange={(e) => setPassword(e.target.value)} // 비밀번호 입력값 상태 관리
          />
        </div>
        {/* 로그인 버튼 */}
        <div className="my-4">
          <button
            className="w-full px-4 py-2 bg-blue-500 rounded-md shadow text-white"
            onClick={handleLogin} // 로그인 처리 함수 호출
            disabled={isActuallyLoading} // 로딩 중 버튼 비활성화
          >
            {isActuallyLoading ? "로딩 중..." : "로그인"}
          </button>
        </div>
        {/* 회원가입 모달로 전환 */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            계정이 없으신가요?{" "}
            <button
              className="text-blue-600 hover:text-blue-800 font-medium"
              onClick={onClickRegisting} // 회원가입 모달로 전환
            >
              회원가입
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}