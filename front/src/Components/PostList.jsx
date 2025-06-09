import { useState, useEffect } from "react";
import { Search, Edit3 } from "lucide-react"; // 아이콘 라이브러리

export default function PostList({ posts, onNewPost, onSelectPost }) {
  const [searchTerm, setSearchTerm] = useState(""); // 검색어 상태
  const [filteredPosts, setFilteredPosts] = useState(posts); // 필터링된 게시물 목록

  // posts가 변경되면 필터 초기화
  useEffect(() => {
    setFilteredPosts(posts);
  }, [posts]);

  // 검색 처리 함수
  const handleSearch = () => {
    const filtered = posts.filter((post) => {
      const title = post.title || "";
      const writer = post.author || ""; // writer 없으면 author 사용
      return (
        title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        writer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
    setFilteredPosts(filtered);
  };

  // 엔터 키로 검색 실행
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="bg-white w-full max-w-5xl rounded-xl shadow-lg p-6 flex flex-col space-y-6">
      {/* 검색 & 글쓰기 */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <div className="relative flex-grow md:w-80">
            <input
              type="text"
              placeholder="검색어를 입력하세요"
              className="w-full border pl-10 pr-4 py-2 rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} // 검색어 상태 업데이트
              onKeyDown={handleKeyPress} // 엔터 키 처리
            />
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={18}
            />
          </div>
          <button
            className="bg-indigo-500 text-white px-4 py-2 rounded-lg"
            onClick={handleSearch} // 검색 버튼 클릭 시 검색 실행
          >
            검색
          </button>
        </div>

        <button
          onClick={onNewPost} // 글쓰기 버튼 클릭 시 새로운 게시물 작성 화면으로 이동
          className="bg-emerald-500 text-white px-5 py-2 rounded-lg flex items-center space-x-2"
        >
          <Edit3 size={18} />
          <span>글쓰기</span>
        </button>
      </div>
      {/* 테이블 헤더 */}
      <div className="grid grid-cols-12 text-center font-medium text-gray-600 border-b border-gray-200 pb-3">
        <div className="col-span-7 text-left pl-4">제목</div>
        <div className="col-span-2">작성자</div>
        <div className="col-span-2">작성일</div>
        <div className="col-span-1">조회수</div>
      </div>
      {/* 게시물 목록 출력 */}
      <ul>
        {filteredPosts.map((post) => (
          <li
            key={post.id}
            className="grid grid-cols-12 text-center items-center border-b py-3 hover:bg-gray-50"
          >
            <div className="col-span-7 text-left pl-4">
              <button
                className="truncate w-full text-left hover:text-indigo-600"
                onClick={() => onSelectPost(post.id)} // 게시물 선택 시 상세보기로 이동
              >
                {post.title}
              </button>
            </div>
            <div className="col-span-2">{post.author}</div>
            <div className="col-span-2">
              {new Date(
                new Date(post.created_at).getTime() + 9 * 60 * 60 * 1000
              ).toLocaleString("ko-KR", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
            </div>
            <div className="col-span-1">{post.views}</div>
          </li>
        ))}
      </ul>

      {/* 게시물이 없을 경우 */}
      {filteredPosts.length === 0 && (
        <div className="py-16 text-gray-400 border border-dashed rounded-lg text-center">
          게시글이 없습니다.
        </div>
      )}
    </div>
  );
}