package entity;

import java.sql.Timestamp;

public class Comments {
    private int CommentID;
    private int LostPostID;
    private int UserID;
    private String Content;
    private Timestamp CreatedAt;

    public Comments() {}

    public Comments(int CommentID, int LostPostID, int UserID, String Content, Timestamp CreatedAt) {
        this.CommentID = CommentID;
        this.LostPostID = LostPostID;
        this.UserID = UserID;
        this.Content = Content;
        this.CreatedAt = CreatedAt;
    }

    public int getCommentID() { return CommentID; }
    public void setCommentID(int CommentID) { this.CommentID = CommentID; }

    public int getLostPostID() { return LostPostID; }
    public void setLostPostID(int LostPostID) { this.LostPostID = LostPostID; }

    public int getUserID() { return UserID; }
    public void setUserID(int UserID) { this.UserID = UserID; }

    public String getContent() { return Content; }
    public void setContent(String Content) { this.Content = Content; }

    public Timestamp getCreatedAt() { return CreatedAt; }
    public void setCreatedAt(Timestamp CreatedAt) { this.CreatedAt = CreatedAt; }
}