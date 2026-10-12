package entity;

public class LostImages {
    private int ImageID;
    private int LostPostID;
    private String ImageURL;

    public LostImages() {}

    public LostImages(int ImageID, int LostPostID, String ImageURL) {
        this.ImageID = ImageID;
        this.LostPostID = LostPostID;
        this.ImageURL = ImageURL;
    }

    public int getImageID() { return ImageID; }
    public void setImageID(int ImageID) { this.ImageID = ImageID; }

    public int getLostPostID() { return LostPostID; }
    public void setLostPostID(int LostPostID) { this.LostPostID = LostPostID; }

    public String getImageURL() { return ImageURL; }
    public void setImageURL(String ImageURL) { this.ImageURL = ImageURL; }
}