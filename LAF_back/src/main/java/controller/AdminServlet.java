package controller;

import com.google.gson.Gson;
import dao.AdminDAO;
import dao.ForumDAO;
import dao.FoundPostDAO;
import dao.LostPostDAO;
import dao.ReviewDAO;
import dao.ModerationDAO;
import dao.VisibilityDAO;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;

@WebServlet(name = "AdminServlet", urlPatterns = {"/api/admin"})
public class AdminServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json;charset=UTF-8");
        PrintWriter out = response.getWriter();
        Gson gson = new Gson();

        String type = request.getParameter("type");
        if (type == null) {
            type = "stats";
        }

        AdminDAO adminDao = new AdminDAO();

        switch (type) {
            case "stats":
                out.print(gson.toJson(adminDao.getDashboardStats()));
                break;
            case "users":
                String kw = request.getParameter("keyword");
                String campus = request.getParameter("campus");
                String gender = request.getParameter("gender");
                String roleId = request.getParameter("roleId");
                out.print(gson.toJson(adminDao.getAllUsers(kw, campus, gender, roleId)));
                break;
            case "lost":
                LostPostDAO lostDao = new LostPostDAO();
                out.print(gson.toJson(lostDao.getAllLostPosts(
                        request.getParameter("keyword"),
                        request.getParameter("category"),
                        request.getParameter("location"),
                        "",
                        true,
                        request.getParameter("visibility")
                )));
                break;
            case "found":
                FoundPostDAO foundDao = new FoundPostDAO();
                out.print(gson.toJson(foundDao.getFoundPosts(
                        request.getParameter("keyword"),
                        request.getParameter("category"),
                        request.getParameter("location"),
                        request.getParameter("sort"),
                        "",
                        true,
                        request.getParameter("visibility")
                )));
                break;
            case "forum":
                ForumDAO forumDao = new ForumDAO();
                out.print(gson.toJson(forumDao.getForumPosts(
                        request.getParameter("category"),
                        request.getParameter("sort"),
                        "",
                        true,
                        request.getParameter("visibility")
                )));
                break;
            case "reviews":
                ReviewDAO revDao = new ReviewDAO();
                int star = 0;
                try {
                    star = Integer.parseInt(request.getParameter("star"));
                } catch (Exception ignore) {
                }
                out.print(gson.toJson(revDao.getReviews(star, request.getParameter("sort"), "", true, request.getParameter("visibility"))));
                break;
            case "pending":
                out.print(gson.toJson(new ModerationDAO().getPendingPosts()));
                break;
            case "statusRequests":
                out.print(gson.toJson(new dao.StatusRequestDAO().getPending(null)));
                break;
            default:
                out.print(gson.toJson(adminDao.getDashboardStats()));
                break;
        }
        out.flush();
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json;charset=UTF-8");
        PrintWriter out = response.getWriter();
        Map<String, Object> result = new HashMap<>();

        String entity = request.getParameter("entity"); // "user", "lost", "found", "forum", "review"
        String action = request.getParameter("action"); // "create", "update", "delete", "status"

        AdminDAO adminDao = new AdminDAO();
        LostPostDAO lostDao = new LostPostDAO();
        FoundPostDAO foundDao = new FoundPostDAO();
        ForumDAO forumDao = new ForumDAO();
        ReviewDAO reviewDao = new ReviewDAO();
        ModerationDAO modDao = new ModerationDAO();

        try {
            if ("visibility".equals(action)) {
                // Admin đổi chế độ xem của mọi bài (lost / found / forum / review)
                boolean ok = new VisibilityDAO().setVisibilityAdmin(
                        entity,
                        Integer.parseInt(request.getParameter("id")),
                        request.getParameter("visibility"));
                result.put("success", ok);
                result.put("message", ok ? "Đã đổi chế độ xem!" : "Không thể đổi chế độ xem!");
            } else if ("user".equals(entity)) {
                if ("create".equals(action)) {
                    String err = adminDao.createUserByAdmin(
                            request.getParameter("username"),
                            request.getParameter("fullName"),
                            request.getParameter("email"),
                            request.getParameter("phone"),
                            request.getParameter("campus"),
                            request.getParameter("gender"),
                            request.getParameter("password"),
                            Integer.parseInt(request.getParameter("roleId"))
                    );
                    result.put("success", err == null);
                    result.put("message", err == null ? "Thêm tài khoản thành công!" : err);
                } else if ("update".equals(action)) {
                    String err = adminDao.updateUserByAdmin(
                            Integer.parseInt(request.getParameter("userId")),
                            request.getParameter("username"),
                            request.getParameter("fullName"),
                            request.getParameter("email"),
                            request.getParameter("phone"),
                            request.getParameter("campus"),
                            request.getParameter("gender"),
                            request.getParameter("password"),
                            Integer.parseInt(request.getParameter("roleId"))
                    );
                    result.put("success", err == null);
                    result.put("message", err == null ? "Cập nhật tài khoản thành công!" : err);
                } else if ("delete".equals(action)) {
                    boolean ok = adminDao.deleteUserByAdmin(Integer.parseInt(request.getParameter("userId")));
                    result.put("success", ok);
                    result.put("message", ok ? "Đã xóa tài khoản!" : "Lỗi khi xóa tài khoản!");
                } else if ("ban".equals(action) || "unban".equals(action)) {
                    boolean ban = "ban".equals(action);
                    boolean ok = adminDao.setUserActive(Integer.parseInt(request.getParameter("userId")), !ban);
                    result.put("success", ok);
                    result.put("message", ok
                            ? (ban ? "Đã khóa tài khoản!" : "Đã mở khóa tài khoản!")
                            : "Không thể thực hiện (không thể khóa tài khoản Admin).");
                }
            } else if ("lost".equals(entity)) {
                if ("create".equals(action)) {
                    boolean ok = lostDao.addLostPost(
                            request.getParameter("email"),
                            request.getParameter("title"),
                            request.getParameter("category"),
                            request.getParameter("content"),
                            request.getParameter("location"),
                            request.getParameter("time"),
                            request.getParameter("imageUrl"),
                            "Approved"
                    );
                    result.put("success", ok);
                } else if ("update".equals(action)) {
                    int id = Integer.parseInt(request.getParameter("id"));
                    boolean ok = lostDao.updateLostPost(
                            id,
                            request.getParameter("title"),
                            request.getParameter("category"),
                            request.getParameter("location"),
                            request.getParameter("content"),
                            request.getParameter("imageUrl")
                    );
                    String status = request.getParameter("status");
                    if (status != null && !status.isEmpty()) {
                        lostDao.updateStatus(id, status);
                    }
                    result.put("success", ok);
                } else if ("delete".equals(action)) {
                    result.put("success", modDao.deleteWithNotice("lost", Integer.parseInt(request.getParameter("id")),
                            request.getParameter("reason"), request.getParameter("adminEmail")));
                }
            } else if ("found".equals(entity)) {
                if ("create".equals(action)) {
                    boolean ok = foundDao.addFoundPost(
                            request.getParameter("email"),
                            request.getParameter("itemName"),
                            request.getParameter("category"),
                            request.getParameter("description"),
                            request.getParameter("location"),
                            request.getParameter("time"),
                            request.getParameter("imageUrl"),
                            "Approved"
                    );
                    result.put("success", ok);
                } else if ("update".equals(action)) {
                    int id = Integer.parseInt(request.getParameter("id"));
                    boolean ok = foundDao.updateFoundPost(
                            id,
                            request.getParameter("itemName"),
                            request.getParameter("category"),
                            request.getParameter("location"),
                            request.getParameter("description"),
                            request.getParameter("imageUrl")
                    );
                    String status = request.getParameter("status");
                    if (status != null && !status.isEmpty()) {
                        foundDao.updateStatus(id, status);
                    }
                    result.put("success", ok);
                } else if ("delete".equals(action)) {
                    result.put("success", modDao.deleteWithNotice("found", Integer.parseInt(request.getParameter("id")),
                            request.getParameter("reason"), request.getParameter("adminEmail")));
                }
            } else if ("forum".equals(entity)) {
                if ("create".equals(action)) {
                    boolean ok = forumDao.addForumPost(
                            request.getParameter("email"),
                            request.getParameter("title"),
                            request.getParameter("category"),
                            request.getParameter("content"),
                            "Approved"
                    );
                    result.put("success", ok);
                } else if ("update".equals(action)) {
                    boolean ok = forumDao.updateForumPost(
                            Integer.parseInt(request.getParameter("id")),
                            request.getParameter("title"),
                            request.getParameter("category"),
                            request.getParameter("content")
                    );
                    result.put("success", ok);
                } else if ("delete".equals(action)) {
                    result.put("success", modDao.deleteWithNotice("forum", Integer.parseInt(request.getParameter("id")),
                            request.getParameter("reason"), request.getParameter("adminEmail")));
                }
            } else if ("moderation".equals(entity)) {
                if ("approve".equals(action)) {
                    boolean ok = modDao.approvePost(
                            request.getParameter("postType"),
                            Integer.parseInt(request.getParameter("id")),
                            request.getParameter("adminEmail"));
                    result.put("success", ok);
                    result.put("message", ok ? "Đã duyệt bài đăng!" : "Không thể duyệt (bài không còn ở trạng thái chờ duyệt).");
                }
            } else if ("statusRequest".equals(entity)) {
                dao.StatusRequestDAO srDao = new dao.StatusRequestDAO();
                int rid = Integer.parseInt(request.getParameter("id"));
                if ("approve".equals(action)) {
                    boolean ok = srDao.approve(rid, request.getParameter("adminEmail"));
                    result.put("success", ok);
                    result.put("message", ok ? "Đã duyệt yêu cầu!" : "Không thể duyệt (yêu cầu không còn chờ duyệt).");
                } else if ("reject".equals(action)) {
                    boolean ok = srDao.reject(rid, request.getParameter("adminEmail"), request.getParameter("reason"));
                    result.put("success", ok);
                    result.put("message", ok ? "Đã từ chối yêu cầu!" : "Không thể từ chối (yêu cầu không còn chờ duyệt).");
                }
            } else if ("review".equals(entity)) {
                if ("create".equals(action)) {
                    boolean ok = reviewDao.addReview(
                            request.getParameter("email"),
                            Integer.parseInt(request.getParameter("rating")),
                            request.getParameter("comment")
                    );
                    result.put("success", ok);
                } else if ("update".equals(action)) {
                    boolean ok = reviewDao.updateReview(
                            Integer.parseInt(request.getParameter("id")),
                            Integer.parseInt(request.getParameter("rating")),
                            request.getParameter("comment")
                    );
                    result.put("success", ok);
                } else if ("delete".equals(action)) {
                    result.put("success", reviewDao.deleteReview(Integer.parseInt(request.getParameter("id"))));
                }
            }
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "Lỗi xử lý: " + e.getMessage());
        }

        out.print(new Gson().toJson(result));
        out.flush();
    }
}
