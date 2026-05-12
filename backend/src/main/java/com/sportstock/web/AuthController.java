package com.sportstock.web;

import com.sportstock.model.User;
import com.sportstock.service.UserService;
import com.sportstock.web.dto.AuthRequest;
import com.sportstock.web.dto.AuthResponse;
import com.sportstock.web.dto.RegisterRequest;
import jakarta.validation.Valid;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserService userService;

    public AuthController(AuthenticationManager authenticationManager, UserService userService) {
        this.authenticationManager = authenticationManager;
        this.userService = userService;
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        User user = userService.getByUsername(userDetails.getUsername());
        return new AuthResponse(user.getUsername(), user.getName(), user.getRole());
    }

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        User user = userService.register(request);
        return new AuthResponse(user.getUsername(), user.getName(), user.getRole());
    }
}
