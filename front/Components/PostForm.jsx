import { useState, useEffect } from "react";
import { ArrowLeft, Save, Trash2 } from "lucide-react"; // 아이콘 라이브러리

export default function PostForm({ post, onCancel, onSave, onDelete }) {
  const isEditMode = !!post; // post가 있으면 수정 모드, 없으면 새 글 작성 모드

  const [title, setTitle] = useState(""); // 제목 상태
  const [content, setContent] = useState(""); // 내용 상태

  // post 데이터가 있을 때 제목과 내용을 폼에 반영
  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setContent(post.content);
    } else {
      setTitle("");
      setContent("");
    }
  }, [post]);

  // 저장 버튼 클릭 시 실행
  const handleSave = () => {
    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }
    onSave(title, content); // 부모 컴포넌트로 저장 요청
  };

  return (
    <div className="bg-white w-full max-w-5xl rounded-xl shadow-lg p-6">
      {/* 상단 버튼 */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div className="flex items-center space-x-3">
          {/* 뒤로 가기 버튼 */}
          <button
            onClick={onCancel} // onCancel 함수가 호출되어 게시물 목록 화면으로 돌아감
            className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-2 rounded-lg"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-2xl font-bold text-gray-800">
            {isEditMode ? "게시글 수정" : "새 글 작성"}
          </h2>
        </div>
        <div className="flex space-x-3">
          {/* 저장 버튼 */}
          <button
            className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 flex items-center space-x-2"
            onClick={handleSave}
          >
            <Save size={18} />
            <span>저장하기</span>
          </button>
          {/* 수정 모드에서만 삭제 버튼 */}
          {isEditMode && onDelete && (
            <button
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 flex items-center space-x-2"
              onClick={onDelete}
            >
              <Trash2 size={18} />
              <span>삭제하기</span>
            </button>
          )}
        </div>
      </div>

      {/* 입력 폼 */}
      <div className="space-y-4">
        <input
          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
          placeholder="제목을 입력하세요"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)} // 제목 상태 업데이트
        />
        <textarea
          className="w-full h-96 px-4 py-3 border border-gray-300 rounded-lg resize-none"
          placeholder="내용을 입력하세요"
          value={content}
          onChange={(e) => setContent(e.target.value)} // 내용 상태 업데이트
        />
      </div>
    </div>
  );
}