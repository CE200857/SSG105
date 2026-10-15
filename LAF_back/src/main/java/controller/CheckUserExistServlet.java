package controller;

import dao.UserDAO;
import java.io.IOException;
import java.io.PrintWriter;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet(name = "CheckUserExistServlet", urlPatterns = {"/api/check-user"})
public class CheckUserExistServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        response.setContentType("application/json;charset=UTF-8");
        request.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();
        
        String username = request.getParameter("username");
        String email = request.getParameter("email");
        
        if (username == null || email == null) {
            response.setStatus(400);
            out.print("{\"status\":\"error\", \"message\":\"Dữ liệu không hợp lệ.\"}");
            return;
        }

        UserDAO dao = new UserDAO();
        
        // Kiểm tra xem username hoặc email đã tồn tại chưa
        if (dao.checkUserExist(username, email)) {
            response.setStatus(409); // Lỗi Conflict
            out.print("{\"status\":\"error\", \"message\":\"Tên đăng nhập hoặc Email đã được sử dụng!\"}");
        } else {
            response.setStatus(200); // Thành công
            out.print("{\"status\":\"success\", \"message\":\"Hợp lệ, có thể tiếp tục.\"}");
        }
    }
}