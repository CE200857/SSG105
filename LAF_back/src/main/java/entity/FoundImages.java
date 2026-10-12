package entity;

public class FoundImages {
    private int ImageID;
    private int FoundPostID;
    private String ImageURL;

    public FoundImages() {}

    public FoundImages(int ImageID, int FoundPostID, String ImageURL) {
        this.ImageID = ImageID;
        this.FoundPostID = FoundPostID;
        this.ImageURL = ImageURL;
    }

    public int getImageID() { return ImageID; }
    public void setImageID(int ImageID) { this.ImageID = ImageID; }

    public int getFoundPostID() { return FoundPostID; }
    public void setFoundPostID(int FoundPostID) { this.FoundPostID = FoundPostID; }

    public String getImageURL() { return ImageURL; }
    public void setImageURL(String ImageURL) { this.ImageURL = ImageURL; }
}