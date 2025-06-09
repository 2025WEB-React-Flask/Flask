// SummaryModal.jsx
import { X } from "lucide-react";

export default function SummaryModal({ content, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold mb-4 text-gray-800">게시물 요약</h2>
        <div className="text-gray-700 whitespace-pre-wrap max-h-[70vh] overflow-y-auto">
          {content || "요약 내용이 없습니다."}
        </div>
      </div>
    </div>
  );
}