import { useState } from "react";
import SignupModal from "./SignupModal"; // 회원가입 모달 컴포넌트
import LoginModal from "./LoginModal"; // 로그인 모달 컴포넌트

export default function AuthModal({ onClose, onLoginSuccess }) {
  const [isRegistering, setIsRegistering] = useState(false); // true일 경우 회원가입 모드, false일 경우 로그인 모드
  const [isLoading, setIsLoading] = useState(false); // 로그인/회원가입 로딩 상태

  // 회원가입 모드로 전환
  const handleRegistering = () => {
    setIsRegistering(true);
  };

  // 로그인 모드로 전환
  const handleLogging = () => {
    setIsRegistering(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {/* isRegistering이 true면 회원가입 모달을, false면 로그인 모달을 보여줌 */}
      {isRegistering ? (
        <SignupModal
          onClose={onClose}
          onClickLogging={handleLogging}
          isLoading={isLoading} // 로딩 상태 전달
        /> // 회원가입 모달
      ) : (
        <LoginModal
          onClose={onClose}
          onClickRegisting={handleRegistering}
          onLoginSuccess={onLoginSuccess} // 로그인 성공 콜백 전달
          isLoading={isLoading} // 로딩 상태 전달
        /> // 로그인 모달
      )}
    </div>
  );
}