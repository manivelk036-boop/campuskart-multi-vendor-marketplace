package com.campuskart.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public class ApplyCouponRequest {
    @NotBlank
    private String code;
    @NotEmpty
    @Valid
    private List<CartItemRequest> items;

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public List<CartItemRequest> getItems() { return items; }
    public void setItems(List<CartItemRequest> items) { this.items = items; }
}