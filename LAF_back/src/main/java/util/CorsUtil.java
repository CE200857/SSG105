package util;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.LinkedHashSet;
import java.util.Set;

/**
 * Cấu hình CORS theo môi trường, không còn cố định localhost.
 *
 * Danh sách origin được phép (cách nhau bằng dấu phẩy), lấy theo thứ tự ưu tiên:
 *   1. System property  -Dlaf.cors.origins=https://laf.example.com,https://www.laf.example.com
 *   2. Biến môi trường  LAF_CORS_ORIGINS
 *   3. Mặc định (chạy dev): http://localhost:5173, http://127.0.0.1:5173
 *
 * Chỉ origin nằm trong danh sách mới nhận header CORS (kèm cookie/session).
 * Request cùng origin hoặc đi qua proxy (Vite proxy / Nginx) không có header Origin nên không bị ảnh hưởng.
 */
public final class CorsUtil {

    private static final String DEFAULT_ORIGINS = "http://localhost:5173,http://127.0.0.1:5173";
    private static final Set<String> ALLOWED = load();

    private CorsUtil() {
    }

    private static Set<String> load() {
        String cfg = System.getProperty("laf.cors.origins");
        if (cfg == null || cfg.trim().isEmpty()) {
            cfg = System.getenv("LAF_CORS_ORIGINS");
        }
        if (cfg == null || cfg.trim().isEmpty()) {
            cfg = DEFAULT_ORIGINS;
        }
        Set<String> set = new LinkedHashSet<>();
        for (String o : cfg.split(",")) {
            String v = o.trim();
            while (v.endsWith("/")) {
                v = v.substring(0, v.length() - 1);
            }
            if (!v.isEmpty()) {
                set.add(v);
            }
        }
        return set;
    }

    public static String allowedOrigin(HttpServletRequest req) {
        String origin = req.getHeader("Origin");
        return (origin != null && ALLOWED.contains(origin)) ? origin : null;
    }

    public static void apply(HttpServletRequest req, HttpServletResponse res) {
        res.addHeader("Vary", "Origin");
        String origin = allowedOrigin(req);
        if (origin == null) {
            return;
        }
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.setHeader("Access-Control-Max-Age", "3600");
    }
}
