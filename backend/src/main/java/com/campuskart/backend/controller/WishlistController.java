package com.campuskart.backend.controller;

import com.campuskart.backend.dto.WishlistResponse;
import com.campuskart.backend.entity.User;
import com.campuskart.backend.service.WishlistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wishlist")
@Tag(name = "Wishlist", description = "Customer wishlist endpoints")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175"
})
@PreAuthorize("hasRole('CUSTOMER')")
public class WishlistController {

    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    @Operation(summary = "Get the authenticated customer's wishlist")
    @GetMapping
    public List<WishlistResponse> getWishlist(Authentication authentication) {
        return wishlistService.getWishlist(currentCustomer(authentication));
    }

    @Operation(summary = "Add a product to the authenticated customer's wishlist")
    @PostMapping("/{productId}")
    public WishlistResponse addProduct(
            @PathVariable Long productId,
            Authentication authentication) {
        return wishlistService.addProduct(productId, currentCustomer(authentication));
    }

    @Operation(summary = "Check whether a product is in the authenticated customer's wishlist")
    @GetMapping("/{productId}/contains")
    public Map<String, Boolean> containsProduct(
            @PathVariable Long productId,
            Authentication authentication) {
        return Map.of("wishlisted", wishlistService.containsProduct(
                productId, currentCustomer(authentication)));
    }

    @Operation(summary = "Remove a product from the authenticated customer's wishlist")
    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> removeProduct(
            @PathVariable Long productId,
            Authentication authentication) {
        wishlistService.removeProduct(productId, currentCustomer(authentication));
        return ResponseEntity.noContent().build();
    }

    private User currentCustomer(Authentication authentication) {
        return (User) authentication.getPrincipal();
    }
}
