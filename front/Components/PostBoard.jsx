import { useEffect, useState } from "react";
import PostList from "./PostList"; // 게시물 목록 컴포넌트
import PostForm from "./PostForm"; // 게시물 작성/수정 폼 컴포넌트
import PostDetail from "./PostDetail"; // 게시물 상세보기 컴포넌트
import AuthModal from "./AuthModal"; // 로그인/회원가입 모달

import { User } from "lucide-react";
import {
  logout,
  fetchPosts,
  createPost,
  updatePost,
  deletePost,
  incrementPostView,
} from "./PostService"; // API 함수들

export default function PostBoard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태
  const [user, setUser] = useState(null); // 사용자 정보
  const [currentTab, setCurrentTab] = useState("LIST"); // 현재 탭 상태 (LIST, FORM, DETAIL)
  const [isOpenModal, setIsOpenModal] = useState(false); // 로그인 모달 상태
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]); // 게시물 목록
  const [selectedPost, setSelectedPost] = useState(null); // 선택된 게시물

  // 게시물 목록 화면으로 전환
  const handleListTab = () => {
    setCurrentTab("LIST");
    setSelectedPost(null);
  };

  // 새 게시물 작성 화면으로 전환
  const handleNewPostTab = () => {
    // 로그인하지 않은 경우 경고창 표시 및 로그인 모달 오픈
    if (!isLoggedIn) {
      alert("로그인이 필요합니다.");
      setIsOpenModal(true);
      return;
    }

    // 로그인한 경우에만 글쓰기 화면으로 전환
    setSelectedPost(null);
    setCurrentTab("FORM");
  };

  // 게시물 상세 화면으로 전환
  const handleDetailTab = async (postId) => {
    try {
      // 백엔드에 조회수 증가 요청
      const updatedViewData = await incrementPostView(postId);

      // 서버에서 최신 게시물 목록을 다시 가져와서 조회수 반영
      const updatedPosts = await fetchPosts();
      setPosts(updatedPosts);

      // 업데이트된 게시물 찾기
      const updatedPost = updatedPosts.find((p) => p.id === postId);
      if (updatedPost) {
        setSelectedPost(updatedPost);
        setCurrentTab("DETAIL");
      }
    } catch (error) {
      console.error("조회수 증가 실패", error);
      // 조회수 실패해도 일단 게시물 보여주기
      const post = posts.find((p) => p.id === postId);
      if (post) {
        setSelectedPost(post);
        setCurrentTab("DETAIL");
      }
    }
  };

  // 게시물 수정 화면으로 전환
  const handleEditTab = () => {
    setCurrentTab("FORM");
  };

  // 게시물 불러오기
  useEffect(() => {
    const storedUser = localStorage.getItem("user"); // 로컬 스토리지에서 사용자 정보 가져오기
    loadPosts();
    if (storedUser) {
      setUser(JSON.parse(storedUser)); // 로그인된 사용자 정보 로딩
      setIsLoggedIn(true); // 로그인 상태 변경
    }
  }, []);

  // 게시물 불러오기 API 호출
  const loadPosts = async () => {
    try {
      setLoading(true); // 로딩 시작
      const data = await fetchPosts();
      setPosts(data);
      setLoading(false); // 로딩 완료 후 상태 업데이트
    } catch (error) {
      console.error("게시물 불러오기 실패", error);
      setLoading(false); // 오류 발생 시에도 로딩 상태 종료
    }
  };

  // 로그인 성공 시 처리
  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    console.log("로그인 성공 처리됨:", userData);
  };

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      await logout(); // 로그아웃 API 호출
      setIsLoggedIn(false);
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      console.log("로그아웃 처리됨");
    } catch (error) {
      console.error("로그아웃 실패", error);
    }
  };

  const handlePostSave = async (title, content) => {
    if (selectedPost) {
      // 수정 모드
      try {
        await updatePost(selectedPost.id, title, content);
        // 서버에서 최신 게시물 목록을 다시 가져옵니다
        const updatedPosts = await fetchPosts();
        setPosts(updatedPosts);

        // 업데이트된 게시물을 찾아 selectedPost 업데이트
        const updatedPost = updatedPosts.find((p) => p.id === selectedPost.id);
        if (updatedPost) {
          setSelectedPost(updatedPost);
        }

        setCurrentTab("DETAIL");
      } catch (error) {
        console.error("게시물 수정 실패", error);
      }
    } else {
      // 새 게시물 작성
      try {
        const newPost = await createPost(title, content);
        // 서버에서 최신 게시물 목록을 새로 불러옵니다
        await loadPosts();
        setCurrentTab("LIST");
      } catch (error) {
        console.error("게시물 추가 실패", error);
      }
    }
  };

  const handlePostDelete = async (postId) => {
    try {
      await deletePost(postId); // 삭제 API 호출
      // 삭제 후 서버에서 최신 게시물 목록을 불러옵니다
      await loadPosts();
      setSelectedPost(null);
      setCurrentTab("LIST");
    } catch (error) {
      console.error("게시물 삭제 실패", error);
    }
  };

  // 로그인 상태 변경 시 로그 출력
  useEffect(() => {
    console.log("로그인 상태 변경됨:", isLoggedIn);
  }, [isLoggedIn]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* 상단 타이틀과 로그인/로그아웃 버튼 */}
      <header className="bg-indigo-600 py-4 px-6 flex justify-between items-center shadow-md">
        <div className="text-3xl font-bold text-white">게시판</div>
        <div className="flex items-center space-x-4">
          {/* 로그인된 경우 사용자 이름 표시 */}
          {isLoggedIn && user && (
            <div className="text-white font-medium">
              환영합니다, {user.username}님!
            </div>
          )}
          <button
            className="bg-white hover:bg-gray-100 text-indigo-600 font-medium px-4 py-2 rounded-lg transition-colors duration-200 shadow-sm flex items-center space-x-2"
            onClick={() => (isLoggedIn ? handleLogout() : setIsOpenModal(true))}
          >
            <User size={18} />
            <span>{isLoggedIn ? "로그아웃" : "로그인"}</span>
          </button>
        </div>
      </header>

      <main className="flex-grow flex justify-center items-start px-4 py-8 bg-gray-50">
        {loading ? (
          <div className="flex justify-center items-center w-full h-full">
            <div className="flex flex-col items-center">
              {/* 로딩 스피너 */}
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid mb-4"></div>
              <div className="text-lg text-gray-600">로딩 중...</div>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-7xl flex justify-center">
            {currentTab === "LIST" && (
              <PostList
                posts={posts}
                onNewPost={handleNewPostTab}
                onSelectPost={handleDetailTab}
              />
            )}
            {currentTab === "FORM" && (
              <PostForm
                post={selectedPost}
                onCancel={handleListTab}
                onSave={handlePostSave}
                onDelete={
                  selectedPost ? () => handlePostDelete(selectedPost.id) : null
                }
              />
            )}
            {currentTab === "DETAIL" && selectedPost && (
              <PostDetail
                post={selectedPost}
                onBack={handleListTab}
                onEdit={
                  user?.username === selectedPost.author ? handleEditTab : null
                }
                onDelete={
                  user?.username === selectedPost.author || user?.is_admin
                    ? () => handlePostDelete(selectedPost.id)
                    : null
                }
              />
            )}
            {isOpenModal && (
              <AuthModal
                onClose={() => setIsOpenModal(false)}
                onLoginSuccess={handleLoginSuccess}
              />
            )}
          </div>
        )}
      </main>

      <footer className="bg-gray-800 text-gray-300 py-4 px-6 w-full text-center text-sm">
        © 2025 게시판
      </footer>
    </div>
  );
}
