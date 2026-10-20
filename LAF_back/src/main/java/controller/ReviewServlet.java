package controller;

import dao.ReviewDAO;
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

@WebServlet(name = "ReviewServlet", urlPatterns = {"/api/reviews"})
public class ReviewServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json;charset=UTF-8");
        PrintWriter out = response.getWriter();

        int star = 0;
        if (request.getParameter("star") != null && !request.getParameter("star").isEmpty()) {
            star = Integer.parseInt(request.getParameter("star"));
        }
        String sort = request.getParameter("sort");

        ReviewDAO dao = new ReviewDAO();
        List<Map<String, Object>> reviews = dao.getReviews(star, sort);

        out.print(new Gson().toJson(reviews));
        out.flush();
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json;charset=UTF-8");
        PrintWriter out = response.getWriter();
        Map<String, Object> result = new HashMap<>();
        ReviewDAO dao = new ReviewDAO();

        String action = request.getParameter("action");
        if (action == null) action = "create";

        if ("update".equals(action) || "edit".equals(action)) {
            int reviewId = Integer.parseInt(request.getParameter("reviewId"));
            int rating = Integer.parseInt(request.getParameter("rating"));
            String comment = request.getParameter("comment");
            boolean ok = dao.updateReview(reviewId, rating, comment);
            result.put("success", ok);
            result.put("message", ok ? "Cập nhật đánh giá thành công!" : "Lỗi cập nhật!");
        } else if ("delete".equals(action)) {
            int reviewId = Integer.parseInt(request.getParameter("reviewId"));
            boolean ok = dao.deleteReview(reviewId);
            result.put("success", ok);
        } else {
            String email = request.getParameter("email");
            int rating = Integer.parseInt(request.getParameter("rating"));
            String comment = request.getParameter("comment");

            if (dao.addReview(email, rating, comment)) {
                result.put("success", true);
                result.put("message", "Cảm ơn bạn đã gửi đánh giá!");
            } else {
                result.put("success", false);
                result.put("message", "Lỗi khi gửi đánh giá. Vui lòng thử lại!");
            }
        }

        out.print(new Gson().toJson(result));
        out.flush();
    }
}