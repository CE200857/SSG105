package com.mycompany.laf_back.resources;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

// Đổi sang javax.ws.rs.* nếu dùng thư viện cũ
@Path("test")
public class TestResource {

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response checkConnection() {
        String json = "{\"status\":\"success\", \"message\":\"Connected from Java Backend 8080!\"}";
        return Response.ok(json).build();
    }
}