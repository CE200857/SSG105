package entity;

import java.sql.Timestamp;

public class FoundPosts {
    private int FoundPostID;
    private int UserID;
    private String ItemName;
    private String Description;
    private String LocationFound;
    private Timestamp TimeFound;
    private String Status;
    private Timestamp CreatedAt;

    public FoundPosts() {}

    public FoundPosts(int FoundPostID, int UserID, String ItemName, String Description, String LocationFound, Timestamp TimeFound, String Status, Timestamp CreatedAt) {
        this.FoundPostID = FoundPostID;
        this.UserID = UserID;
        this.ItemName = ItemName;
        this.Description = Description;
        this.LocationFound = LocationFound;
        this.TimeFound = TimeFound;
        this.Status = Status;
        this.CreatedAt = CreatedAt;
    }

    public int getFoundPostID() { return FoundPostID; }
    public void setFoundPostID(int FoundPostID) { this.FoundPostID = FoundPostID; }

    public int getUserID() { return UserID; }
    public void setUserID(int UserID) { this.UserID = UserID; }

    public String getItemName() { return ItemName; }
    public void setItemName(String ItemName) { this.ItemName = ItemName; }

    public String getDescription() { return Description; }
    public void setDescription(String Description) { this.Description = Description; }

    public String getLocationFound() { return LocationFound; }
    public void setLocationFound(String LocationFound) { this.LocationFound = LocationFound; }

    public Timestamp getTimeFound() { return TimeFound; }
    public void setTimeFound(Timestamp TimeFound) { this.TimeFound = TimeFound; }

    public String getStatus() { return Status; }
    public void setStatus(String Status) { this.Status = Status; }

    public Timestamp getCreatedAt() { return CreatedAt; }
    public void setCreatedAt(Timestamp CreatedAt) { this.CreatedAt = CreatedAt; }
}