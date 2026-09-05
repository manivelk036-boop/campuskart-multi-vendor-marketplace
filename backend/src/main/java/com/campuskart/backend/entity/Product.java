package com.campuskart.backend.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String productName;

    private String description;

    @Column(nullable = false)
    private Double price;

    @Column(nullable = false)
    private Integer quantity;

    // =========================
    // CATEGORY
    // =========================
    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    // =========================
    // SELLER
    // =========================
    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "seller_id")
    private User seller;

    // =========================
    // CONSTRUCTOR
    // =========================
    public Product() {
    }

    // =========================
    // GETTERS
    // =========================
    public Long getId() {
        return id;
    }

    public String getProductName() {
        return productName;
    }

    public String getDescription() {
        return description;
    }

    public Double getPrice() {
        return price;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public Category getCategory() {
        return category;
    }

    public User getSeller() {
        return seller;
    }

    // =========================
    // SETTERS
    // =========================
    public void setId(Long id) {
        this.id = id;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public void setSeller(User seller) {
        this.seller = seller;
    }
}