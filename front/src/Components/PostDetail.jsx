import { useState, useEffect } from "react";
import { ArrowLeft, Edit, Trash2, MoreVertical, Check, X } from "lucide-react";
import {
  fetchComments,
  createComment,
  deleteComment,
  updateComment,
} from "./PostService";

import { summarizePost } from "./PostService";
import SummaryModal from "./SummaryModal";

export default function PostDetail({ post, onBack, onEdit, onDelete }) {
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));

  const [summary, setSummary] = useState("");
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  // 현재 게시글에 달린 댓글들을 서버에서 불러오기
  const loadComments = async () => {
    const data = await fetchComments(post.id);
    setComments(data);
  };

  useEffect(() => {
    if (post?.id) {
      loadComments();
    }
  }, [post?.id]);

  if (!post) return null;

  // 새로운 댓글 작성 함수
  const handleAddComment = async () => {
    if (!commentText.trim()) {
      alert("댓글 내용을 입력하세요.");
      return;
    }
    await createComment(post.id, commentText); // 서버에 댓글 등록
    setCommentText(""); // 입력창 초기화
    loadComments(); // 댓글 목록 갱신
  };

  // 댓글 삭제 함수
  const handleDeleteComment = async (comment) => {
    await deleteComment(comment.id);
    loadComments(); // 삭제 후 댓글 목록 갱신
  };

  // 수정 시작 시 호출: 수정 대상 ID 설정 + 기존 내용 채우기
  const startEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditCommentText(comment.content);
    setOpenMenuId(null); // 메뉴 닫기
  };

  // 댓글 수정 최종 저장 처리
  const handleEditComment = async (comment) => {
    if (!editCommentText.trim()) {
      alert("수정할 내용을 입력하세요.");
      return;
    }
    await updateComment(comment.id, editCommentText);
    setEditingCommentId(null); // 수정 모드 종료
    loadComments(); // 갱신
  };

  const handleSummarize = async () => {
    try {
      const result = await summarizePost(post.content);
      setSummary(result);
      setIsSummaryOpen(true);
    } catch (err) {
      alert("요약 실패: " + (err.response?.data?.message || err.message));
    }
  };

  //++++++++++++++++++++++++++++++++++++++++++++++++++++++
  if (!post) return null; // 게시물이 없으면 아무것도 렌더링하지 않음
  return (
    <div className="bg-white w-full max-w-5xl rounded-xl shadow-lg p-6">
      {/* 상단 타이틀과 버튼 */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div className="flex items-center space-x-3">
          {/* 뒤로 가기 버튼 */}
          <button
            onClick={onBack} // onBack 함수가 호출되어 게시물 목록 화면으로 돌아감
            className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-2 rounded-lg transition-colors duration-200"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-2xl font-bold text-gray-800">게시글 보기</h2>
        </div>
        <div className="flex space-x-3">
          {/* 수정 버튼 (작성자일 경우만 활성화) */}
          {onEdit && (
            <button
              className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors duration-200 flex items-center space-x-2"
              onClick={onEdit}
            >
              <Edit size={18} />
              <span>수정하기</span>
            </button>
          )}
          {/* 삭제 버튼 (작성자나 관리자일 경우만 활성화) */}
          {onDelete && (
            <button
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200 flex items-center space-x-2"
              onClick={onDelete}
            >
              <Trash2 size={18} />
              <span>삭제하기</span>
            </button>
          )}
        </div>
      </div>

      {/* 본문 내용 */}
      <div className="space-y-6">
        <div className="border-b pb-4">
          {/* 제목 */}
          <h3 className="text-3xl font-semibold text-gray-900 mb-2 break-words">
            {post.title}
          </h3>
          <div className="flex justify-between items-center text-sm text-gray-600">
            <div className="flex space-x-4">
              <div>작성자: {post.author}</div>
              <div>
                작성일:{" "}
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
              <div>조회수: {post.views}</div>
            </div>

            <button
              onClick={handleSummarize}
              className="bg-blue-500 text-white px-3 py-1.5 rounded-md hover:bg-blue-600"
            >
              요약 보기
            </button>
          </div>
        </div>
        <div className="py-4">
          {/* 내용 */}
          <p className="text-gray-800 whitespace-pre-wrap leading-relaxed min-h-32">
            {post.content}
          </p>
          {isSummaryOpen && (
            <SummaryModal
              content={summary}
              onClose={() => setIsSummaryOpen(false)}
            />
          )}
        </div>
      </div>
      {/*+++++++++++++++++++++++++++*/}
      {/* 댓글 영역 */}
      <div className="mt-10 border-t pt-6">
        <h3 className="text-xl font-bold mb-4">댓글</h3>
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="flex justify-between items-start border-b py-2 relative"
          >
            <div className="flex flex-col">
              <div className="text-sm font-semibold">
                {comment.author}
                {comment.author === post.author && (
                  <span className="ml-2 text-xs bg-emerald-500 text-white px-2 py-0.5 rounded">
                    글쓴이
                  </span>
                )}
              </div>
              {editingCommentId === comment.id ? (
                <div className="flex space-x-2 mt-1">
                  <input
                    className="border px-2 py-1 rounded w-full"
                    value={editCommentText}
                    onChange={(e) => setEditCommentText(e.target.value)}
                  />
                  <button
                    className="text-green-600"
                    onClick={() => handleEditComment(comment)}
                  >
                    <Check size={16} />
                  </button>
                  <button
                    className="text-gray-500"
                    onClick={() => setEditingCommentId(null)}
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="text-gray-700">{comment.content}</div>
              )}
            </div>

            {/* ⋮ 메뉴 */}
            {user &&
            (user.username === comment.author ||
              user.username === post.author ||
              user.is_admin) ? (
              <div className="relative">
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() =>
                    setOpenMenuId(openMenuId === comment.id ? null : comment.id)
                  }
                >
                  <MoreVertical size={16} />
                </button>

                {openMenuId === comment.id ? (
                  <div className="absolute right-0 mt-1 bg-white border rounded shadow-md z-10">
                    {user.username === comment.author && (
                      <button
                        className="flex items-center space-x-1 px-4 py-2 hover:bg-gray-100 text-sm w-full text-left"
                        onClick={() => startEditComment(comment)}
                      >
                        <Edit size={14} />
                        <span>수정</span>
                      </button>
                    )}
                    <button
                      className="flex items-center space-x-1 px-4 py-2 hover:bg-gray-100 text-sm w-full text-left text-red-500"
                      onClick={() => handleDeleteComment(comment)}
                    >
                      <Trash2 size={14} />
                      <span>삭제</span>
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        ))}

        {user ? (
          <div className="mt-4 flex space-x-2">
            <input
              className="border px-3 py-2 rounded-lg w-full"
              placeholder="댓글을 입력하세요..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button
              className="flex items-center space-x-1 bg-indigo-500 text-white px-4 py-2 rounded-lg"
              onClick={handleAddComment}
            >
              <Check size={16} />
              <span>등록</span>
            </button>
          </div>
        ) : (
          <div className="text-gray-500 mt-4">
            댓글을 작성하려면 로그인하세요.
          </div>
        )}
      </div>
      {/*+++++++++++++++++++++++++++*/}
    </div>
  );
}