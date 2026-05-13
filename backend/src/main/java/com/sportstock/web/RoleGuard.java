package com.sportstock.web;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public final class RoleGuard {

    private RoleGuard() {
    }

    public static void requireAdmin(HttpServletRequest request) {
        String role = request.getHeader("X-User-Role");
        if (role == null || !isAdminRole(role)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin role required");
        }
    }

    private static boolean isAdminRole(String role) {
        String normalized = role.trim().toLowerCase();
        return normalized.equals("admin") || normalized.equals("administrador");
    }
}
