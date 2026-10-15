package controller;

import dao.LostPostDAO;
import com.google.gson.Gson;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.Map;

@WebServlet(name = "LostPostsServlet", urlPatterns = {"/api/lost-posts"})
public class LostPostsServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        response.setContentType("application/json;charset=UTF-8");
        PrintWriter out = response.getWriter();
        
        // Lấy tham số tìm kiếm từ Frontend gửi lên
        String keyword = request.getParameter("keyword");
        String category = request.getParameter("category");
        String location = request.getParameter("location");
        
        LostPostDAO dao = new LostPostDAO();
        // Gọi hàm DAO có hỗ trợ tìm kiếm
        List<Map<String, Object>> posts = dao.getAllLostPosts(keyword, category, location);
        
        Gson gson = new Gson();
        out.print(gson.toJson(posts));
        out.flush();
    }
}