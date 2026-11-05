package filter;

import java.io.IOException;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

// Bắt mọi request gửi đến Backend
@WebFilter(asyncSupported = true, urlPatterns = {"/*"})
public class CorsFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;

        // Chỉ origin nằm trong danh sách cấu hình (xem util.CorsUtil) mới nhận header CORS + cookie/session.
        // Cấu hình: -Dlaf.cors.origins=... hoặc biến môi trường LAF_CORS_ORIGINS (mặc định localhost:5173 khi dev)
        util.CorsUtil.apply(req, res);
        if (req.getServletPath().startsWith("/api/") && !"/api/avatar".equals(req.getServletPath())) {
            res.setHeader("Cache-Control", "no-store");
        }

        // Xử lý preflight request (Trình duyệt thường gửi method OPTIONS trước khi POST)
        if ("OPTIONS".equalsIgnoreCase(req.getMethod())) {
            res.setStatus(HttpServletResponse.SC_OK);
            return;
        }

        chain.doFilter(request, response);
    }
}