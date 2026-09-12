package com.campuskart.backend;

import com.campuskart.backend.entity.Category;
import com.campuskart.backend.entity.Product;
import com.campuskart.backend.entity.User;
import com.campuskart.backend.repository.ProductRepository;
import com.campuskart.backend.service.impl.ProductServiceImpl;
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
class ProductServiceImplTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductServiceImpl productService;

    @Test
    void saveProductUsesDefaultImageWhenImageUrlBlank() {
        Category category = new Category(2L, "Electronics");
        Product product = new Product();
        product.setProductName("Airpod Pro");
        product.setCategory(category);
        product.setDescription("Premium earbuds");
        product.setImageUrl(null);
        product.setPrice(100.0);
        product.setQuantity(5);

        when(productRepository.save(product)).thenReturn(product);

        Product result = productService.saveProduct(product);

        assertEquals(product, result);
        assertTrue(result.getImageUrl().startsWith("https://images.unsplash.com/"));
        verify(productRepository).save(product);
    }

    @Test
    void getAllProductsReturnsRepositoryList() {
        List<Product> products = List.of(new Product(), new Product());
        when(productRepository.findAll()).thenReturn(products);

        List<Product> result = productService.getAllProducts();

        assertEquals(products, result);
        verify(productRepository).findAll();
    }

    @Test
    void getProductByIdReturnsOptionalFromRepository() {
        Product product = new Product();
        when(productRepository.findById(5L)).thenReturn(Optional.of(product));

        Optional<Product> result = productService.getProductById(5L);

        assertTrue(result.isPresent());
        assertEquals(product, result.get());
        verify(productRepository).findById(5L);
    }

    @Test
    void getProductByNameReturnsProductsMatchingName() {
        Product product = new Product();
        product.setProductName("Keyboard");
        when(productRepository.findByProductName("Keyboard")).thenReturn(List.of(product));

        List<Product> result = productService.getProductByName("Keyboard");

        assertEquals(1, result.size());
        assertEquals(product, result.get(0));
        verify(productRepository).findByProductName("Keyboard");
    }

    @Test
    void getProductsByCategoryReturnsProductsForCategory() {
        Product product = new Product();
        when(productRepository.findByCategory_Name("Electronics")).thenReturn(List.of(product));

        List<Product> result = productService.getProductsByCategory("Electronics");

        assertEquals(1, result.size());
        assertEquals(product, result.get(0));
        verify(productRepository).findByCategory_Name("Electronics");
    }

    @Test
    void getProductsBySellerReturnsProductsForSeller() {
        Product product = new Product();
        when(productRepository.findBySellerId(9L)).thenReturn(List.of(product));

        List<Product> result = productService.getProductsBySeller(9L);

        assertEquals(1, result.size());
        assertEquals(product, result.get(0));
        verify(productRepository).findBySellerId(9L);
    }

    @Test
    void updateProductUpdatesExistingProductAndPersists() {
        Category category = new Category(2L, "Electronics");
        Product existingProduct = new Product();
        existingProduct.setProductName("Old Product");
        existingProduct.setDescription("Old Desc");
        existingProduct.setImageUrl(null);
        existingProduct.setPrice(50.0);
        existingProduct.setQuantity(2);
        existingProduct.setCategory(category);

        Product updatedProduct = new Product();
        updatedProduct.setProductName("New Product");
        updatedProduct.setDescription("New Desc");
        updatedProduct.setImageUrl("https://example.com/new.png");
        updatedProduct.setPrice(75.0);
        updatedProduct.setQuantity(10);
        updatedProduct.setCategory(category);

        when(productRepository.findById(5L)).thenReturn(Optional.of(existingProduct));
        when(productRepository.save(existingProduct)).thenReturn(existingProduct);

        Product result = productService.updateProduct(5L, updatedProduct);

        assertEquals("New Product", existingProduct.getProductName());
        assertEquals("New Desc", existingProduct.getDescription());
        assertEquals("https://example.com/new.png", existingProduct.getImageUrl());
        assertEquals(75.0, result.getPrice());
        assertEquals(10, result.getQuantity());
        verify(productRepository).save(existingProduct);
    }

    @Test
    void updateProductThrowsWhenProductDoesNotExist() {
        Product updatedProduct = new Product();
        when(productRepository.findById(5L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> productService.updateProduct(5L, updatedProduct));

        assertEquals("Product not found", exception.getMessage());
    }

    @Test
    void deleteProductDeletesExistingProduct() {
        when(productRepository.existsById(5L)).thenReturn(true);

        productService.deleteProduct(5L);

        verify(productRepository).deleteById(5L);
    }

    @Test
    void deleteProductThrowsWhenProductDoesNotExist() {
        when(productRepository.existsById(5L)).thenReturn(false);

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> productService.deleteProduct(5L));

        assertTrue(exception.getMessage().contains("Product not found"));
        verify(productRepository, never()).deleteById(5L);
    }
}
