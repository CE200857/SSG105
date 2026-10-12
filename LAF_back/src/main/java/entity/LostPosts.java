package entity;

import java.sql.Timestamp;

public class LostPosts {
    private int LostPostID;
    private int UserID;
    private String Title;
    private String Content;
    private String LocationLost;
    private Timestamp TimeLost;
    private String Status;
    private Timestamp CreatedAt;

    public LostPosts() {}

    public LostPosts(int LostPostID, int UserID, String Title, String Content, String LocationLost, Timestamp TimeLost, String Status, Timestamp CreatedAt) {
        this.LostPostID = LostPostID;
        this.UserID = UserID;
        this.Title = Title;
        this.Content = Content;
        this.LocationLost = LocationLost;
        this.TimeLost = TimeLost;
        this.Status = Status;
        this.CreatedAt = CreatedAt;
    }

    public int getLostPostID() { return LostPostID; }
    public void setLostPostID(int LostPostID) { this.LostPostID = LostPostID; }

    public int getUserID() { return UserID; }
    public void setUserID(int UserID) { this.UserID = UserID; }

    public String getTitle() { return Title; }
    public void setTitle(String Title) { this.Title = Title; }

    public String getContent() { return Content; }
    public void setContent(String Content) { this.Content = Content; }

    public String getLocationLost() { return LocationLost; }
    public void setLocationLost(String LocationLost) { this.LocationLost = LocationLost; }

    public Timestamp getTimeLost() { return TimeLost; }
    public void setTimeLost(Timestamp TimeLost) { this.TimeLost = TimeLost; }

    public String getStatus() { return Status; }
    public void setStatus(String Status) { this.Status = Status; }

    public Timestamp getCreatedAt() { return CreatedAt; }
    public void setCreatedAt(Timestamp CreatedAt) { this.CreatedAt = CreatedAt; }
}