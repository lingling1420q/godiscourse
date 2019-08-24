package views

import (
	"satellity/internal/models"
	"net/http"
	"time"
)

// CommentView is the response body of comment
type CommentView struct {
	CommentID string    `json:"comment_id,pk"`
	Body      string    `json:"body"`
	TopicID   string    `json:"topic_id"`
	UserID    string    `json:"user_id"`
	Score     int       `json:"score,notnull"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	User      UserView  `json:"user"`
}

func buildComment(comment *models.Comment) CommentView {
	view := CommentView{
		CommentID: comment.CommentID,
		Body:      comment.Body,
		TopicID:   comment.TopicID,
		UserID:    comment.UserID,
		Score:     comment.Score,
		CreatedAt: comment.CreatedAt,
		UpdatedAt: comment.UpdatedAt,
	}
	if comment.User != nil {
		view.User = buildUser(comment.User)
	}
	return view
}

// RenderComment response a comment
func RenderComment(w http.ResponseWriter, r *http.Request, comment *models.Comment) {
	RenderResponse(w, r, buildComment(comment))
}

// RenderComments response a bundle of comments
func RenderComments(w http.ResponseWriter, r *http.Request, comments []*models.Comment) {
	views := make([]CommentView, len(comments))
	for i, comment := range comments {
		views[i] = buildComment(comment)
	}
	RenderResponse(w, r, views)
}
