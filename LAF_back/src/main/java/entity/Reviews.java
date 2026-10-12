package entity;

import java.sql.Timestamp;

public class Reviews {
    private int ReviewID;
    private int UserID;
    private int Rating;
    private String Content;
    private Timestamp CreatedAt;

    public Reviews() {}

    public Reviews(int ReviewID, int UserID, int Rating, String Content, Timestamp CreatedAt) {
        this.ReviewID = ReviewID;
        this.UserID = UserID;
        this.Rating = Rating;
        this.Content = Content;
        this.CreatedAt = CreatedAt;
    }

    public int getReviewID() { return ReviewID; }
    public void setReviewID(int ReviewID) { this.ReviewID = ReviewID; }

    public int getUserID() { return UserID; }
    public void setUserID(int UserID) { this.UserID = UserID; }

    public int getRating() { return Rating; }
    public void setRating(int Rating) { this.Rating = Rating; }

    public String getContent() { return Content; }
    public void setContent(String Content) { this.Content = Content; }

    public Timestamp getCreatedAt() { return CreatedAt; }
    public void setCreatedAt(Timestamp CreatedAt) { this.CreatedAt = CreatedAt; }
}