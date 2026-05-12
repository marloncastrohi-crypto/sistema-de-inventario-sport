package com.sportstock.web;

import com.sportstock.service.CartService;
import com.sportstock.web.dto.CheckoutRequest;
import com.sportstock.web.dto.CheckoutResponse;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @PostMapping("/checkout")
    public CheckoutResponse checkout(@Valid @RequestBody CheckoutRequest request, Authentication authentication) {
        String requester = authentication != null ? authentication.getName() : request.getRequester();
        if (requester == null || requester.trim().isEmpty()) {
            requester = "usuario";
        }
        return cartService.checkout(requester, request);
    }
}
