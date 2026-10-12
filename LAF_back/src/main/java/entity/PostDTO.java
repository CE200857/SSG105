package entity;

public class PostDTO {
    private int id;
    private String type; // "lost" hoặc "found"
    private String tag; // "Đang tìm" hoặc "Nhặt được"
    private String tagColor;
    private String category;
    private String title;
    private String location;
    private String user;
    private String time;
    private String img;

    // Các hàm getter và setter tương ứng
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getTag() { return tag; }
    public void setTag(String tag) { this.tag = tag; }

    public String getTagColor() { return tagColor; }
    public void setTagColor(String tagColor) { this.tagColor = tagColor; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getUser() { return user; }
    public void setUser(String user) { this.user = user; }

    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }

    public String getImg() { return img; }
    public void setImg(String img) { this.img = img; }
}