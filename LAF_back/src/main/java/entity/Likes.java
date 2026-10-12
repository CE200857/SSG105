package entity;

import java.sql.Timestamp;

public class Likes {
    private int LostPostID;
    private int UserID;
    private Timestamp CreatedAt;

    public Likes() {}

    public Likes(int LostPostID, int UserID, Timestamp CreatedAt) {
        this.LostPostID = LostPostID;
        this.UserID = UserID;
        this.CreatedAt = CreatedAt;
    }

    public int getLostPostID() { return LostPostID; }
    public void setLostPostID(int LostPostID) { this.LostPostID = LostPostID; }

    public int getUserID() { return UserID; }
    public void setUserID(int UserID) { this.UserID = UserID; }

    public Timestamp getCreatedAt() { return CreatedAt; }
    public void setCreatedAt(Timestamp CreatedAt) { this.CreatedAt = CreatedAt; }
}