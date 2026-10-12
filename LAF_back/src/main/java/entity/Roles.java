package entity;

public class Roles {
    private int RoleID;
    private String RoleName;

    public Roles() {}

    public Roles(int RoleID, String RoleName) {
        this.RoleID = RoleID;
        this.RoleName = RoleName;
    }

    public int getRoleID() { return RoleID; }
    public void setRoleID(int RoleID) { this.RoleID = RoleID; }

    public String getRoleName() { return RoleName; }
    public void setRoleName(String RoleName) { this.RoleName = RoleName; }
}