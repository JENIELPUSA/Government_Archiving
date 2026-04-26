import React from "react";

export default React.memo(function CommentsTab({
    comments,
    commentLoading,
    newCommentText,
    setNewCommentText,
    addComment,
    currentUserId,
    onDeleteComment
}) {
    console.log("CommentsTab rendered");

    // Get user initial for avatar
    const getUserInitial = (userId) => {
        return userId?.charAt(0)?.toUpperCase() || "U";
    };

    // Format timestamp
    const formatTimestamp = (rawTimestamp) => {
        try {
            const commentDate = new Date(rawTimestamp);
            if (isNaN(commentDate.getTime())) return "Invalid Date";
            
            const now = new Date();
            const diffHours = Math.floor((now - commentDate) / (1000 * 60 * 60));
            
            if (diffHours < 24) {
                return commentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }
            return commentDate.toLocaleDateString();
        } catch {
            return "Invalid Date";
        }
    };

    return (
        <div className="comments-tab flex h-full flex-col">
            <div className="mb-4 flex items-center justify-between border-b pb-3">
                <h3 className="text-xl font-bold text-gray-800">Comments ({comments.length})</h3>
                <div className="flex items-center">
                    <i className="fas fa-comments mr-2 text-blue-500"></i>
                    <span className="text-sm font-medium text-gray-500">Share your thoughts</span>
                </div>
            </div>

            <div className="custom-scrollbar mb-4 flex-grow space-y-4 overflow-y-auto pr-2">
                {commentLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                            <div className="mb-3 flex items-center">
                                <div className="mr-3 h-10 w-10 animate-pulse rounded-full bg-gray-200"></div>
                                <div className="flex-1">
                                    <div className="mb-1 h-4 w-32 animate-pulse rounded bg-gray-200"></div>
                                    <div className="h-3 w-24 animate-pulse rounded bg-gray-200"></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
                                <div className="h-4 w-4/5 animate-pulse rounded bg-gray-200"></div>
                            </div>
                        </div>
                    ))
                ) : comments.length > 0 ? (
                    comments.map((comment) => {
                        const isCurrentUser = comment.userId === currentUserId;
                        
                        return (
                            <div
                                key={comment.id || comment._id}
                                className="group relative rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md"
                            >
                                <div className="mb-3 flex items-start">
                                    <div className="relative mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 font-bold text-white">
                                        {getUserInitial(comment.userId)}
                                        {isCurrentUser && (
                                            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs">
                                                <i className="fas fa-user"></i>
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-baseline">
                                            <strong className="text-gray-800">{comment.userId}</strong>
                                            <span className="ml-2 text-xs font-medium text-blue-500">
                                                {isCurrentUser ? "You" : "Reader"}
                                            </span>
                                            <span className="ml-auto text-xs text-gray-500">
                                                {formatTimestamp(comment.timestamp)}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-sm leading-relaxed text-gray-700">
                                            {comment.commentText}
                                        </p>
                                    </div>
                                    
                                    {isCurrentUser && onDeleteComment && (
                                        <button
                                            onClick={() => onDeleteComment(comment.id)}
                                            className="ml-2 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                                            title="Delete comment"
                                        >
                                            <i className="fas fa-trash-alt text-sm"></i>
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="flex h-full flex-col items-center justify-center py-8 text-center">
                        <i className="far fa-comments text-5xl text-gray-300 mb-4"></i>
                        <h4 className="text-lg font-medium text-gray-500">No comments yet</h4>
                        <p className="text-gray-400 mt-2 max-w-md">
                            Be the first to share your thoughts on this document
                        </p>
                    </div>
                )}
            </div>

            <div className="mt-auto rounded-lg border border-gray-200 bg-gray-50 p-4 shadow-sm">
                <div className="relative mb-3">
                    <textarea
                        className="w-full resize-y rounded-lg border border-gray-300 bg-white p-3 pr-10 text-gray-700 transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-1"
                        rows="3"
                        placeholder="Add your comment here..."
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        maxLength={500}
                    ></textarea>
                    <div className="absolute bottom-4 right-3 rounded bg-white px-2 py-0.5 text-xs text-gray-500">
                        {newCommentText.length}/500
                    </div>
                </div>
                
                <div className="flex items-center justify-between">
                    <button
                        onClick={addComment}
                        disabled={!newCommentText.trim()}
                        className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 px-5 py-2.5 font-bold text-white shadow-md transition-all duration-200 hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <i className="fas fa-paper-plane mr-2"></i>
                        Post Comment
                    </button>
                </div>
            </div>
        </div>
    );
});