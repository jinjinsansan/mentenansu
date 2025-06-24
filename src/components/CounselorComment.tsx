import React, { useState } from 'react';
import { MessageCircle, Edit3, Save, Trash2, X } from 'lucide-react';
import { CounselorComment as CounselorCommentType } from '../lib/supabase';

interface CounselorCommentProps {
  comment: CounselorCommentType;
  isEditable?: boolean;
  onUpdate?: (id: string, comment: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

const CounselorComment: React.FC<CounselorCommentProps> = ({
  comment,
  isEditable = false,
  onUpdate,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedComment, setEditedComment] = useState(comment.comment);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleUpdate = async () => {
    if (!onUpdate || !editedComment.trim()) return;
    
    setIsUpdating(true);
    try {
      await onUpdate(comment.id, editedComment);
      setIsEditing(false);
    } catch (error) {
      console.error('コメント更新エラー:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    if (window.confirm('このコメントを削除しますか？')) {
      setIsDeleting(true);
      try {
        await onDelete(comment.id);
      } catch (error) {
        console.error('コメント削除エラー:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <MessageCircle className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-jp-medium text-blue-900">
            カウンセラーコメント
          </span>
        </div>
        {isEditable && !isEditing && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsEditing(true)}
              className="text-blue-600 hover:text-blue-700 p-1"
              title="編集"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-600 hover:text-red-700 p-1"
              title="削除"
            >
              {isDeleting ? (
                <div className="w-4 h-4 border-2 border-t-transparent border-red-600 rounded-full animate-spin"></div>
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </button>
          </div>
        )}
        {isEditable && isEditing && (
          <button
            onClick={() => {
              setIsEditing(false);
              setEditedComment(comment.comment);
            }}
            className="text-gray-500 hover:text-gray-700 p-1"
            title="キャンセル"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={editedComment}
            onChange={(e) => setEditedComment(e.target.value)}
            className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-jp-normal text-sm resize-none"
            rows={3}
            placeholder="コメントを入力..."
          />
          <div className="flex justify-end">
            <button
              onClick={handleUpdate}
              disabled={isUpdating || !editedComment.trim()}
              className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded text-sm font-jp-medium transition-colors"
            >
              {isUpdating ? (
                <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Save className="w-3 h-3" />
                  <span>保存</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-blue-800 text-sm font-jp-normal leading-relaxed mb-2">
            {comment.comment}
          </p>
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span className="font-jp-medium">
              {comment.counselor?.name || 'カウンセラー'}
            </span>
            <span>{formatDate(comment.created_at)}</span>
          </div>
        </>
      )}
    </div>
  );
};

export default CounselorComment;