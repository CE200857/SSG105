package controller;

import dao.FoundPostDAO;
import com.google.gson.Gson;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@WebServlet(name = "FoundPostsServlet", urlPatterns = {"/api/found-posts"})
public class FoundPostsServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json;charset=UTF-8");
        PrintWriter out = response.getWriter();

        String keyword = request.getParameter("keyword");
        String category = request.getParameter("category");
        String location = request.getParameter("location");
        String sort = request.getParameter("sort");
        String email = request.getParameter("email");

        FoundPostDAO dao = new FoundPostDAO();
        List<Map<String, Object>> posts = dao.getFoundPosts(keyword, category, location, sort, email);
        new dao.StatusRequestDAO().attachPending("found", posts);

        out.print(new Gson().toJson(posts));
        out.flush();
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json;charset=UTF-8");
        PrintWriter out = response.getWriter();
        Map<String, Object> result = new HashMap<>();
        FoundPostDAO dao = new FoundPostDAO();

        String action = request.getParameter("action");
        if (action == null) {
            action = "create";
        }

        if ("like".equals(action)) {
            int postId = Integer.parseInt(request.getParameter("postId"));
            String email = request.getParameter("email");
            result = dao.toggleLike(postId, email);
        } else if ("comment".equals(action)) {
            int postId = Integer.parseInt(request.getParameter("postId"));
            String email = request.getParameter("email");
            String content = request.getParameter("content");
            String parentIdStr = request.getParameter("parentId");
            Integer parentId = (parentIdStr != null && !parentIdStr.isEmpty()) ? Integer.parseInt(parentIdStr) : null;
            boolean ok = dao.addComment(postId, email, content, parentId);
            result.put("success", ok);
            if (ok) {
                result.put("comments", dao.getCommentsByPostId(postId, email));
            }
        } else if ("status".equals(action)) {
            int postId = Integer.parseInt(request.getParameter("postId"));
            result.putAll(new dao.StatusRequestDAO().createRequest("found", postId,
                    request.getParameter("email"), request.getParameter("status")));
        } else if ("update".equals(action) || "edit".equals(action)) {
            int postId = Integer.parseInt(request.getParameter("postId"));
            String itemName = request.getParameter("itemName");
            String category = request.getParameter("category");
            String location = request.getParameter("location");
            String description = request.getParameter("description");
            String imageUrl = request.getParameter("imageUrl");
            result.put("success", dao.updateFoundPost(postId, itemName, category, location, description, imageUrl));
        } else if ("visibility".equals(action)) {
            int visId = Integer.parseInt(request.getParameter("postId"));
            result.put("success", new dao.VisibilityDAO().setVisibility("found", visId,
                    request.getParameter("email"), request.getParameter("visibility")));
        } else if ("delete".equals(action)) {
            int postId = Integer.parseInt(request.getParameter("postId"));
            result.put("success", dao.deletePost(postId));
        } else {
            String email = request.getParameter("email");
            String itemName = request.getParameter("itemName");
            String category = request.getParameter("category");
            String description = request.getParameter("description");
            String location = request.getParameter("location");
            String time = request.getParameter("time");
            String imageUrl = request.getParameter("imageUrl");

            if (dao.addFoundPost(email, itemName, category, description, location, time, imageUrl)) {
                result.put("success", true);
                result.put("message", "Đã gửi bài đăng! Bài sẽ hiển thị sau khi admin duyệt.");
            } else {
                result.put("success", false);
                result.put("message", "Lỗi khi đăng tin. Vui lòng thử lại!");
            }
        }

        out.print(new Gson().toJson(result));
        out.flush();
    }
}
