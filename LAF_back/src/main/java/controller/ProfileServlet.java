package controller;

import dao.ProfileDAO;
import com.google.gson.Gson;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Map;

@WebServlet(name = "ProfileServlet", urlPatterns = {"/api/profile"})
public class ProfileServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json;charset=UTF-8");
        PrintWriter out = response.getWriter();
        
        String email = request.getParameter("email");
        int uid = 0;
        try { uid = Integer.parseInt(request.getParameter("uid")); } catch (Exception ignore) { }
        // Người xem lấy từ SESSION, không tin tham số viewerEmail do client gửi (tránh xem bài riêng tư của người khác)
        String sessionEmail = util.AuthUtil.currentEmail(request);
        String viewerEmail = sessionEmail == null ? "" : sessionEmail;
        entity.Users sessionUser = util.AuthUtil.currentUser(request);
        boolean viewerIsAdmin = sessionEmail != null && sessionUser != null && sessionUser.getRoleID() == 1;
        
        // Danh sách bài đang chờ duyệt của chính student (Lost / Found / Forum)
        if ("true".equals(request.getParameter("pending"))) {
            boolean allowed = sessionEmail != null
                    && (viewerIsAdmin || sessionEmail.equalsIgnoreCase(email));
            Object pending = allowed
                    ? new dao.ModerationDAO().getPendingPostsByEmail(email)
                    : new java.util.ArrayList<Object>();
            out.print(new Gson().toJson(pending));
            out.flush();
            return;
        }
        
        // Khách chưa đăng nhập KHÔNG được thấy email / số điện thoại của người khác
        boolean canSeeContact = sessionEmail != null;
        ProfileDAO dao = new ProfileDAO();
        Map<String, Object> userProfile = dao.getFullProfile(email, uid, viewerEmail, canSeeContact);

        // Khách chưa đăng nhập không được xem email / số điện thoại của người khác
        if (sessionEmail == null && userProfile != null) {
            userProfile.remove("email");
            userProfile.remove("phone");
            userProfile.put("contactHidden", true);
        }
        
        out.print(new Gson().toJson(userProfile));
        out.flush();
    }
}