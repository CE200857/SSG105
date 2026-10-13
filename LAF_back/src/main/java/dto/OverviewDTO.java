package dto;

public class OverviewDTO {
    private double avgRating;      // Điểm đánh giá trung bình
    private int totalReviews;     // Tổng số lượt đánh giá
    private int totalPosts;       // Tổng tất cả bài đăng (LostPosts + FoundPosts)
    private int resolvedPosts;    // Đã tìm được / Đã trao trả ('Found' + 'Claimed')
    private int waitingPosts;     // Cần kết nối ('Not Found' + 'Unclaimed')
    
    private int totalLost;        // Tổng bài tìm đồ bị mất
    private int lostFound;        // Bài mất đồ đã tìm thấy ('Found')
    private int lostNotFound;     // Bài mất đồ đang tìm ('Not Found')
    
    private int totalFound;       // Tổng bài đồ nhặt được
    private int foundClaimed;     // Bài nhặt được đã trao trả ('Claimed')
    private int foundUnclaimed;   // Bài nhặt được đang chờ chủ ('Unclaimed')

    public OverviewDTO() {}

    // Getters and Setters
    public double getAvgRating() { return avgRating; }
    public void setAvgRating(double avgRating) { this.avgRating = avgRating; }

    public int getTotalReviews() { return totalReviews; }
    public void setTotalReviews(int totalReviews) { this.totalReviews = totalReviews; }

    public int getTotalPosts() { return totalPosts; }
    public void setTotalPosts(int totalPosts) { this.totalPosts = totalPosts; }

    public int getResolvedPosts() { return resolvedPosts; }
    public void setResolvedPosts(int resolvedPosts) { this.resolvedPosts = resolvedPosts; }

    public int getWaitingPosts() { return waitingPosts; }
    public void setWaitingPosts(int waitingPosts) { this.waitingPosts = waitingPosts; }

    public int getTotalLost() { return totalLost; }
    public void setTotalLost(int totalLost) { this.totalLost = totalLost; }

    public int getLostFound() { return lostFound; }
    public void setLostFound(int lostFound) { this.lostFound = lostFound; }

    public int getLostNotFound() { return lostNotFound; }
    public void setLostNotFound(int lostNotFound) { this.lostNotFound = lostNotFound; }

    public int getTotalFound() { return totalFound; }
    public void setTotalFound(int totalFound) { this.totalFound = totalFound; }

    public int getFoundClaimed() { return foundClaimed; }
    public void setFoundClaimed(int foundClaimed) { this.foundClaimed = foundClaimed; }

    public int getFoundUnclaimed() { return foundUnclaimed; }
    public void setFoundUnclaimed(int foundUnclaimed) { this.foundUnclaimed = foundUnclaimed; }
}