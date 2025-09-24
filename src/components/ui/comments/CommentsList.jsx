import React from 'react';
import CommentItem from './CommentItem';

const CommentsList = React.memo(({ comments, onPostReply, onDelete, onUpdate, onVote, onOpenAuth }) => {
    return (
        <div className="comments-list">
            {comments.map(comment => (
                <CommentItem
                    key={comment.comment_id}
                    comment={comment}
                    onPostReply={onPostReply}
                    onDelete={onDelete}
                    onUpdate={onUpdate}
                    onVote={onVote}
                    onOpenAuth={onOpenAuth}
                />
            ))}
        </div>
    );
});

export default CommentsList;
