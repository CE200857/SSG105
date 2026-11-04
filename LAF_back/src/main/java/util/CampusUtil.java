package util;

import java.text.Normalizer;

// Hệ thống hiện chỉ hỗ trợ sinh viên FPT Cần Thơ
public final class CampusUtil {

    private CampusUtil() {
    }

    // Bỏ dấu, hạ chữ thường, gộp khoảng trắng: "Cần  Thơ" -> "can tho"
    private static String normalize(String s) {
        if (s == null) {
            return "";
        }
        String n = Normalizer.normalize(s.trim(), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replace('đ', 'd').replace('Đ', 'd')
                .toLowerCase();
        return n.replaceAll("\\s+", " ");
    }

    // Chưa chọn campus ("" hoặc "Chưa cập nhật")
    public static boolean isBlankCampus(String campus) {
        String n = normalize(campus);
        return n.isEmpty() || n.equals("chua cap nhat");
    }

    public static boolean isCanTho(String campus) {
        return normalize(campus).contains("can tho");
    }

    // Đăng nhập: chặn campus khác; tài khoản cũ chưa có campus vẫn được vào
    public static boolean isLoginAllowed(String campus) {
        return isBlankCampus(campus) || isCanTho(campus);
    }

    public static String unsupportedMessage(String campus) {
        String shown = isBlankCampus(campus) ? "" : " \"" + campus.trim() + "\"";
        return "Hiện hệ thống chỉ hỗ trợ sinh viên FPT Cần Thơ. Campus" + shown + " chưa được hỗ trợ.";
    }
}
