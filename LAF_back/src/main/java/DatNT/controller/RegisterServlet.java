package DatNT.controller;

import dao.UserDAO;
import filter.PasswordUtils;
import java.io.IOException;
import java.io.PrintWriter;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet(name = "RegisterServlet", urlPatterns = {"/api/register"})
public class RegisterServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        response.setContentType("application/json;charset=UTF-8");
        request.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();
        
        String username = request.getParameter("username");
        String email = request.getParameter("email");
        String password = request.getParameter("password");
        String fullName = request.getParameter("fullName");
        String phone = request.getParameter("phone");
        String gender = request.getParameter("gender");
        String campus = request.getParameter("campus");
        
        // 1. Validate dữ liệu ở Backend để đề phòng bypass từ frontend
        if (username == null || !username.matches("^[a-zA-Z0-9_]{3,20}$")) {
            sendError(response, out, "Tên đăng nhập không hợp lệ."); return;
        }
        if (email == null || !email.matches("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$")) {
            sendError(response, out, "Email không hợp lệ."); return;
        }
        if (password == null || password.length() < 6) {
            sendError(response, out, "Mật khẩu phải từ 6 ký tự."); return;
        }
        if (fullName == null || !fullName.trim().contains(" ")) {
            sendError(response, out, "Tên phải có ít nhất 2 từ."); return;
        }
        // Validate SĐT: Bắt đầu bằng 0, số thứ 2 là 1-9, tổng 10 số
        if (phone == null || !phone.matches("^0[1-9][0-9]{8}$")) {
            sendError(response, out, "Số điện thoại không hợp lệ."); return;
        }

        UserDAO dao = new UserDAO();
        
        // 2. Check trùng lặp
        if (dao.checkUserExist(username, email)) {
            response.setStatus(409);
            out.print("{\"status\":\"error\", \"message\":\"Tên đăng nhập hoặc Email đã được sử dụng!\"}");
            return;
        }
        
        // 3. MÃ HÓA MẬT KHẨU (Sử dụng hàm hash đã viết ở thư mục filter)
        String hashedPassword = PasswordUtils.hashPassword(password);
        
        // 4. Lưu vào Database
        boolean isSuccess = dao.registerUser(username, fullName, email, phone, campus, gender, hashedPassword);
        
        if (isSuccess) {
            out.print("{\"status\":\"success\", \"message\":\"Đăng ký thành công\"}");
        } else {
            sendError(response, out, "Lỗi hệ thống, không thể đăng ký!");
        }
    }
    
    // Hàm phụ trợ in ra lỗi JSON
    private void sendError(HttpServletResponse response, PrintWriter out, String message) {
        response.setStatus(400);
        out.print("{\"status\":\"error\", \"message\":\"" + message + "\"}");
    }
}