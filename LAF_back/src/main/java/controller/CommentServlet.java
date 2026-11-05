package controller;

import com.google.gson.Gson;
import dao.CommentDAO;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import util.AuthUtil;

@WebServlet(name = "CommentServlet", urlPatterns = {"/api/comments"})
public class CommentServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json;charset=UTF-8");
        request.setCharacterEncoding("UTF-8");

        String email = AuthUtil.currentEmail(request);
        if (email == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().print("{\"success\":false,\"message\":\"Bạn chưa đăng nhập hoặc phiên đã hết hạn.\"}");
            return;
        }

        String action = request.getParameter("action");
        String type = request.getParameter("type");
        int commentId;
        try {
            commentId = Integer.parseInt(request.getParameter("commentId"));
        } catch (NumberFormatException e) {
            response.getWriter().print("{\"success\":false,\"message\":\"Mã bình luận không hợp lệ.\"}");
            return;
        }

        CommentDAO dao = new CommentDAO();
        Map<String, Object> result;
        if ("update".equals(action)) {
            result = dao.update(type, commentId, email, request.getParameter("content"));
        } else if ("delete".equals(action)) {
            result = dao.delete(type, commentId, email);
        } else {
            result = new HashMap<>();
            result.put("success", false);
            result.put("message", "Yêu cầu không hợp lệ.");
        }
        util.LiveUpdates.changed(request, result);
        response.getWriter().print(new Gson().toJson(result));
    }
}
