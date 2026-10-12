package entity;

import java.sql.Timestamp;

public class Users {
    private int UserID;
    private String Username;
    private String FullName;
    private String Email;
    private String Phone;
    private String Campus;
    private String Gender;
    private String PasswordHash;
    private int RoleID;
    private Timestamp CreatedAt;

    public Users() {}

    public Users(int UserID, String Username, String FullName, String Email, String Phone, String Campus, String Gender, String PasswordHash, int RoleID, Timestamp CreatedAt) {
        this.UserID = UserID;
        this.Username = Username;
        this.FullName = FullName;
        this.Email = Email;
        this.Phone = Phone;
        this.Campus = Campus;
        this.Gender = Gender;
        this.PasswordHash = PasswordHash;
        this.RoleID = RoleID;
        this.CreatedAt = CreatedAt;
    }

    public int getUserID() { return UserID; }
    public void setUserID(int UserID) { this.UserID = UserID; }

    public String getUsername() { return Username; }
    public void setUsername(String Username) { this.Username = Username; }

    public String getFullName() { return FullName; }
    public void setFullName(String FullName) { this.FullName = FullName; }

    public String getEmail() { return Email; }
    public void setEmail(String Email) { this.Email = Email; }

    public String getPhone() { return Phone; }
    public void setPhone(String Phone) { this.Phone = Phone; }

    public String getCampus() { return Campus; }
    public void setCampus(String Campus) { this.Campus = Campus; }

    public String getGender() { return Gender; }
    public void setGender(String Gender) { this.Gender = Gender; }

    public String getPasswordHash() { return PasswordHash; }
    public void setPasswordHash(String PasswordHash) { this.PasswordHash = PasswordHash; }

    public int getRoleID() { return RoleID; }
    public void setRoleID(int RoleID) { this.RoleID = RoleID; }

    public Timestamp getCreatedAt() { return CreatedAt; }
    public void setCreatedAt(Timestamp CreatedAt) { this.CreatedAt = CreatedAt; }
}