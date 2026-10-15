package controller;

import dao.UserDAO;
import entity.Users;
import filter.PasswordUtils; // Đã đổi sang gọi từ package filter
import java.io.IOException;
import java.io.PrintWriter;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet(name = "LoginServlet", urlPatterns = {"/api/login"})
public class LoginServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        // Cấu hình UTF-8 và trả về JSON cho React
        response.setContentType("application/json;charset=UTF-8");
        request.setCharacterEncoding("UTF-8");
        
        String identifier = request.getParameter("identifier");
        String password = request.getParameter("password");
        
        PrintWriter out = response.getWriter();
        
        if(identifier == null || password == null) {
            response.setStatus(400);
            out.print("{\"status\":\"error\", \"message\":\"Vui lòng nhập đầy đủ thông tin\"}");
            return;
        }

        // Gọi hàm mã hóa từ package filter
        String hashedPassword = PasswordUtils.hashPassword(password);
        
        UserDAO dao = new UserDAO();
        Users user = dao.checkLogin(identifier, hashedPassword);
        
        if (user != null) {
            // ---- ĐOẠN CODE THÊM MỚI BẮT ĐẦU ----
            // Tạo session và lưu thông tin user vào session
            jakarta.servlet.http.HttpSession session = request.getSession(true);
            session.setAttribute("user", user);
            // ---- ĐOẠN CODE THÊM MỚI KẾT THÚC ----

            out.print("{\"status\":\"success\", "
                    + "\"message\":\"Đăng nhập thành công\", "
                    + "\"user\": {"
                    + "\"id\": " + user.getUserID() + ", "
                    + "\"fullName\": \"" + user.getFullName() + "\", "
                    + "\"email\": \"" + user.getEmail() + "\", "
                    + "\"roleId\": " + user.getRoleID() 
                    + "}}");
        } else {
            response.setStatus(401);
            out.print("{\"status\":\"error\", \"message\":\"Email/Số điện thoại hoặc mật khẩu không đúng!\"}");
        }
    }
}