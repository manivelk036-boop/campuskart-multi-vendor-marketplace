package com.campuskart.backend;

import com.campuskart.backend.controller.ProductController;
import com.campuskart.backend.entity.Product;
import com.campuskart.backend.entity.User;
import com.campuskart.backend.repository.CategoryRepository;
import com.campuskart.backend.repository.UserRepository;
import com.campuskart.backend.service.ProductService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductControllerImageUploadTest {

    @Mock
    private ProductService productService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private ProductController controller;

    private Path uploadDirectory;

    @BeforeEach
    void setUp() throws IOException {
        uploadDirectory = Files.createTempDirectory("campuskart-uploads");
        ReflectionTestUtils.setField(controller, "uploadDir", uploadDirectory.toString());
        ReflectionTestUtils.setField(controller, "maxFileSize", 5242880L);
        ReflectionTestUtils.setField(controller, "allowedTypes", "image/jpeg,image/png,image/webp,image/gif");
    }

    @Test
    void uploadProductImageStoresFileAndPersistsImageUrl() throws Exception {
        User seller = new User();
        seller.setId(1L);
        seller.setRole("SELLER");

        Product product = new Product();
        product.setId(10L);
        product.setSeller(seller);

        Product savedProduct = new Product();
        savedProduct.setImageUrl("/uploads/products/placeholder");

        when(productService.getProductById(10L)).thenReturn(Optional.of(product));
        when(productService.updateImageUrl(eq(10L), any(String.class))).thenReturn(savedProduct);

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "sample.jpg",
                "image/jpeg",
                "happy-bytes".getBytes()
        );

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(seller, null,
                        List.of(new SimpleGrantedAuthority("ROLE_SELLER")));

        ResponseEntity<Product> response = controller.uploadProductImage(10L, file, authentication);

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertNotNull(response.getBody().getImageUrl());
        assertTrue(response.getBody().getImageUrl().startsWith("/uploads/products/"));
        assertTrue(Files.list(uploadDirectory).findAny().isPresent());
    }

    @Test
    void uploadProductImageRejectsUnsupportedFileType() {
        User seller = new User();
        seller.setId(1L);
        seller.setRole("SELLER");

        Product product = new Product();
        product.setId(10L);
        product.setSeller(seller);

        when(productService.getProductById(10L)).thenReturn(Optional.of(product));

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "sample.txt",
                "text/plain",
                "happy-bytes".getBytes()
        );

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(seller, null,
                        List.of(new SimpleGrantedAuthority("ROLE_SELLER")));

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> controller.uploadProductImage(10L, file, authentication)
        );

        assertTrue(exception.getMessage().contains("Only image files are allowed"));
    }

    @Test
    void uploadProductImageRejectsUnauthorizedSellerOwnership() {
        User seller = new User();
        seller.setId(1L);
        seller.setRole("SELLER");

        User otherSeller = new User();
        otherSeller.setId(2L);
        otherSeller.setRole("SELLER");

        Product product = new Product();
        product.setId(10L);
        product.setSeller(otherSeller);

        when(productService.getProductById(10L)).thenReturn(Optional.of(product));

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "sample.jpg",
                "image/jpeg",
                "happy-bytes".getBytes()
        );

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(seller, null,
                        List.of(new SimpleGrantedAuthority("ROLE_SELLER")));

        assertThrows(
                AccessDeniedException.class,
                () -> controller.uploadProductImage(10L, file, authentication)
        );
    }
}
