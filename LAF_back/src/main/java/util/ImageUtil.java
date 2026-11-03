package util;

public class ImageUtil {

    // Nhận dạng ảnh thật theo "chữ ký" đầu file (không tin phần đuôi/loại do trình duyệt gửi)
    public static String detectExtension(byte[] h) {
        if (h == null || h.length < 12) {
            return null;
        }
        if ((h[0] & 0xFF) == 0xFF && (h[1] & 0xFF) == 0xD8 && (h[2] & 0xFF) == 0xFF) {
            return "jpg";
        }
        if ((h[0] & 0xFF) == 0x89 && h[1] == 'P' && h[2] == 'N' && h[3] == 'G') {
            return "png";
        }
        if (h[0] == 'G' && h[1] == 'I' && h[2] == 'F' && h[3] == '8') {
            return "gif";
        }
        if (h[0] == 'R' && h[1] == 'I' && h[2] == 'F' && h[3] == 'F'
                && h[8] == 'W' && h[9] == 'E' && h[10] == 'B' && h[11] == 'P') {
            return "webp";
        }
        return null;
    }

    // Tên file hợp lệ do hệ thống tự sinh (chặn ../ và ký tự lạ)
    public static boolean isSafeFileName(String name) {
        return name != null && name.matches("[A-Za-z0-9_-]{1,80}\\.(jpg|png|gif|webp)");
    }

    public static String contentType(String fileName) {
        String n = fileName.toLowerCase();
        if (n.endsWith(".png")) return "image/png";
        if (n.endsWith(".gif")) return "image/gif";
        if (n.endsWith(".webp")) return "image/webp";
        return "image/jpeg";
    }
}
