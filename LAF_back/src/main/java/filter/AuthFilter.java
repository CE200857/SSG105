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
import jakarta.servlet.http.HttpSession;

// Chỉ chặn các API nằm trong /api/protected/
@WebFilter(urlPatterns = {"/api/protected/*"})
public class AuthFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;
        
        // Lấy session hiện tại (false: không tạo mới nếu chưa có)
        HttpSession session = req.getSession(false);
        
        // Kiểm tra nếu session null hoặc không chứa thuộc tính "user"
        if (session == null || session.getAttribute("user") == null) {
            res.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // Trả về mã lỗi 401
            res.setContentType("application/json;charset=UTF-8");
            res.getWriter().print("{\"status\":\"error\", \"message\":\"Phiên đăng nhập không hợp lệ hoặc đã hết hạn.\"}");
            return;
        }
        
        // Nếu hợp lệ, cho phép request đi tiếp tới Servlet
        chain.doFilter(request, response);
    }
}