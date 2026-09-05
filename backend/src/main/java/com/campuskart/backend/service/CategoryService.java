package com.campuskart.backend.service;

import com.campuskart.backend.entity.Category;

import java.util.List;

public interface CategoryService {

    Category saveCategory(Category category);

    List<Category> getAllCategories();

    Category getCategoryById(Long id);

    void deleteCategory(Long id);
}
