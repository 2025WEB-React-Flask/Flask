import { useState } from "react";
import { X } from "lucide-react";
import { register } from "./PostService"; // 회원가입 API

export default function SignupModal({ onClose, onClickLogging, isLoading }) {
  const [username, setUsername] = useState(""); // 아이디 입력 상태
  const [email, setEmail] = useState(""); // 이메일 입력 상태
  const [password, setPassword] = useState(""); // 비밀번호 입력 상태

  // 회원가입 처리 함수
  const handleRegister = async () => {
    if (!username || !email || !password) {
      alert("모든 항목을 입력해주세요.");
      return;
    }

    try {
      await register(username, email, password); // 회원가입 API 호출
      alert("회원가입 성공! 로그인해주세요.");
      onClickLogging(); // 로그인 모달로 이동
    } catch (error) {
      alert(
        "회원가입 실패: " + error?.response?.data?.message || error?.message
      ); // 오류 처리
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose} // 모달 닫기
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-2xl font-bold text-center mb-6">회원가입</div>

        {/* 입력 필드들 */}
        <div className="space-y-4">
          <input
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="text"
            placeholder="ID"
            value={username}
            onChange={(e) => setUsername(e.target.value)} // 아이디 상태 관리
          />

          <input
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="password"
            placeholder="PASSWORD"
            value={password}
            onChange={(e) => setPassword(e.target.value)} // 비밀번호 상태 관리
          />

          <input
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="email"
            placeholder="EMAIL"
            value={email}
            onChange={(e) => setEmail(e.target.value)} // 이메일 상태 관리
          />
        </div>

        {/* 회원가입 버튼 */}
        <div className="my-4">
          <button
            className="w-full px-4 py-2 bg-blue-500 rounded-md shadow text-white"
            onClick={handleRegister} // 회원가입 처리 함수 호출
            disabled={isLoading} // 로딩 중 버튼 비활성화
          >
            {isLoading ? "로딩 중..." : "회원가입"}
          </button>
        </div>

        {/* 로그인 모달로 전환 */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            계정이 있으신가요?{" "}
            <button
              className="text-blue-600 hover:text-blue-800 font-medium"
              onClick={onClickLogging} // 로그인 모달로 이동
            >
              로그인
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}