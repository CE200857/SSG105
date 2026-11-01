package filter;

import dao.SessionDAO;
import entity.Users;
import jakarta.servlet.*;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.util.Map;
import java.util.Set;

@WebFilter(urlPatterns = {"/api/*"})
public class SessionGuardFilter implements Filter {

    // endpoint -> {loại bài, tên tham số chứa id bài}
    private static final Map<String, String[]> POSTS = Map.of(
            "/api/lost-posts",  new String[]{"lost",   "postId"},
            "/api/found-posts", new String[]{"found",  "postId"},
            "/api/forum",       new String[]{"forum",  "postId"},
            "/api/reviews",     new String[]{"review", "reviewId"});

    // endpoint -> tên tham số chứa email người thao tác (sẽ bị ghi đè bằng email trong session)
    private static final Map<String, String> EMAIL_PARAM = Map.of(
            "/api/lost-posts", "email",
            "/api/found-posts", "email",
            "/api/forum", "email",
            "/api/reviews", "email",
            "/api/shares", "email",
            "/api/notifications", "email",
            "/api/change-password", "email",
            "/api/status-requests", "email",
            "/api/update-profile", "currentEmail");

    private static final Set<String> OWNER_ACTIONS = Set.of("delete", "update", "edit", "status");

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;
        String method = req.getMethod();

        if ("OPTIONS".equalsIgnoreCase(method)) {      // preflight CORS: cho qua
            chain.doFilter(request, response);
            return;
        }
        req.setCharacterEncoding("UTF-8");             // phải đặt TRƯỚC khi đọc bất kỳ tham số nào

        String path = req.getServletPath();
        boolean isAdminApi = "/api/admin".equals(path);
        String emailParam = EMAIL_PARAM.get(path);
        if (!isAdminApi && emailParam == null) {       // login, register, check-user, home... không cần chặn
            chain.doFilter(request, response);
            return;
        }

        // Lấy user từ session, kiểm tra còn hoạt động và lấy email mới nhất từ DB
        HttpSession session = req.getSession(false);
        Object attr = (session == null) ? null : session.getAttribute("user");
        Users u = (attr instanceof Users) ? (Users) attr : null;
        String email = null;
        if (u != null) {
            SessionDAO dao = new SessionDAO();
            try { email = dao.getActiveEmail(u.getUserID()); } finally { dao.close(); }
        }

        if (email == null) {                           // chưa đăng nhập / hết phiên / bị khóa
            boolean guestOk = "GET".equalsIgnoreCase(method) && !isAdminApi
                    && !"/api/notifications".equals(path);
            if (guestOk) {                             // khách vẫn xem được danh sách bài
                chain.doFilter(new EmailRequest(req, emailParam, ""), response);
                return;
            }
            deny(res, 401, "Bạn chưa đăng nhập hoặc phiên đã hết hạn.");
            return;
        }

        boolean admin = (u.getRoleID() == 1);

        if (isAdminApi) {                              // việc 2: chỉ admin
            if (!admin) { deny(res, 403, "Bạn không có quyền quản trị."); return; }
            chain.doFilter(request, response);
            return;
        }

        // Việc 1: sửa/xóa/đổi trạng thái phải là chủ bài
        String[] meta = POSTS.get(path);
        if (meta != null && "POST".equalsIgnoreCase(method) && !admin
                && OWNER_ACTIONS.contains(String.valueOf(req.getParameter("action")))) {
            int id;
            try {
                id = Integer.parseInt(req.getParameter(meta[1]));
            } catch (Exception e) {
                deny(res, 400, "Thiếu hoặc sai mã bài.");
                return;
            }
            SessionDAO dao = new SessionDAO();
            boolean owner;
            try { owner = dao.isOwner(meta[0], id, u.getUserID()); } finally { dao.close(); }
            if (!owner) { deny(res, 403, "Bạn không phải chủ bài này."); return; }
        }

        chain.doFilter(new EmailRequest(req, emailParam, email), response);
    }

    private void deny(HttpServletResponse res, int code, String msg) throws IOException {
        // Thêm header CORS vì filter này có thể chạy trước CorsFilter
        res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setStatus(code);
        res.setContentType("application/json;charset=UTF-8");
        res.getWriter().print("{\"status\":\"error\",\"success\":false,\"message\":\"" + msg + "\"}");
    }

    // Ghi đè 1 tham số bằng giá trị lấy từ session
    private static class EmailRequest extends HttpServletRequestWrapper {
        private final String name, value;

        EmailRequest(HttpServletRequest r, String name, String value) {
            super(r);
            this.name = name;
            this.value = value;
        }

        @Override
        public String getParameter(String n) {
            return name.equals(n) ? value : super.getParameter(n);
        }

        @Override
        public String[] getParameterValues(String n) {
            return name.equals(n) ? new String[]{value} : super.getParameterValues(n);
        }
    }
}