package com.campuskart.backend;

import com.campuskart.backend.entity.Category;
import com.campuskart.backend.repository.CategoryRepository;
import com.campuskart.backend.service.impl.CategoryServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CategoryServiceImplTest {

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private CategoryServiceImpl categoryService;

    @Test
    void saveCategoryPersistsCategory() {
        Category category = new Category(1L, "Books");
        when(categoryRepository.save(category)).thenReturn(category);

        Category result = categoryService.saveCategory(category);

        assertEquals(category, result);
        verify(categoryRepository).save(category);
    }

    @Test
    void getAllCategoriesReturnsListFromRepository() {
        List<Category> categories = List.of(
                new Category(1L, "Books"),
                new Category(2L, "Electronics")
        );
        when(categoryRepository.findAll()).thenReturn(categories);

        List<Category> result = categoryService.getAllCategories();

        assertEquals(categories, result);
        verify(categoryRepository).findAll();
    }

    @Test
    void getCategoryByIdReturnsExistingCategory() {
        Category category = new Category(1L, "Books");
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));

        Category result = categoryService.getCategoryById(1L);

        assertEquals(category, result);
        verify(categoryRepository).findById(1L);
    }

    @Test
    void getCategoryByIdThrowsWhenMissing() {
        when(categoryRepository.findById(1L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> categoryService.getCategoryById(1L));

        assertTrue(exception.getMessage().contains("Category not found with ID: 1"));
    }

    @Test
    void deleteCategoryDeletesExistingCategory() {
        when(categoryRepository.existsById(1L)).thenReturn(true);

        categoryService.deleteCategory(1L);

        verify(categoryRepository).deleteById(1L);
    }

    @Test
    void deleteCategoryThrowsWhenCategoryDoesNotExist() {
        when(categoryRepository.existsById(1L)).thenReturn(false);

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> categoryService.deleteCategory(1L));

        assertTrue(exception.getMessage().contains("Category not found with ID: 1"));
        verify(categoryRepository, never()).deleteById(1L);
    }
}
