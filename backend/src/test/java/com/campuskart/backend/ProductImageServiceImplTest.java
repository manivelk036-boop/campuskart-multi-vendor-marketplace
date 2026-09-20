package com.campuskart.backend;

import com.campuskart.backend.entity.Product;
import com.campuskart.backend.entity.ProductImage;
import com.campuskart.backend.repository.ProductImageRepository;
import com.campuskart.backend.repository.ProductRepository;
import com.campuskart.backend.service.impl.ProductImageServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductImageServiceImplTest {

    @Mock private ProductImageRepository imageRepository;
    @Mock private ProductRepository productRepository;
    @InjectMocks private ProductImageServiceImpl imageService;

    @Test
    void retrievesImagesInDisplayOrder() {
        Product product = product(10L);
        ProductImage first = image(1L, product, 0);
        ProductImage second = image(2L, product, 1);
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));
        when(imageRepository.findByProductIdOrderByDisplayOrderAscIdAsc(10L)).thenReturn(List.of(first, second));

        assertEquals(List.of(first, second), imageService.getImages(10L));
    }

    @Test
    void createsImageAfterExistingImages() {
        Product product = product(10L);
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));
        when(imageRepository.findByProductIdOrderByDisplayOrderAscIdAsc(10L)).thenReturn(List.of(image(1L, product, 0)));
        when(imageRepository.save(any(ProductImage.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ProductImage created = imageService.addImage(10L, "https://example.com/two.jpg");

        assertEquals("https://example.com/two.jpg", created.getImageUrl());
        assertEquals(1, created.getDisplayOrder());
        assertEquals(product, created.getProduct());
    }

    @Test
    void rejectsImageFromAnotherProduct() {
        Product product = product(10L);
        Product otherProduct = product(11L);
        ProductImage image = image(5L, otherProduct, 0);
        when(imageRepository.findById(5L)).thenReturn(Optional.of(image));

        assertThrows(AccessDeniedException.class, () -> imageService.deleteImage(10L, 5L));
    }

    @Test
    void deletesImageAndNormalizesRemainingOrder() {
        Product product = product(10L);
        ProductImage removed = image(1L, product, 0);
        ProductImage remaining = image(2L, product, 1);
        when(imageRepository.findById(1L)).thenReturn(Optional.of(removed));
        when(imageRepository.findByProductIdOrderByDisplayOrderAscIdAsc(10L)).thenReturn(List.of(remaining));

        imageService.deleteImage(10L, 1L);

        assertEquals(0, remaining.getDisplayOrder());
        verify(imageRepository).delete(removed);
        verify(imageRepository).saveAll(List.of(remaining));
    }

    @Test
    void reordersImageWithinProduct() {
        Product product = product(10L);
        ProductImage first = image(1L, product, 0);
        ProductImage second = image(2L, product, 1);
        when(imageRepository.findById(1L)).thenReturn(Optional.of(first));
        when(imageRepository.findByProductIdOrderByDisplayOrderAscIdAsc(10L)).thenReturn(List.of(first, second));

        imageService.reorderImage(10L, 1L, 1);

        assertEquals(0, second.getDisplayOrder());
        assertEquals(1, first.getDisplayOrder());
        verify(imageRepository).saveAll(List.of(second, first));
    }

    private Product product(Long id) {
        Product product = new Product();
        product.setId(id);
        return product;
    }

    private ProductImage image(Long id, Product product, int order) {
        ProductImage image = new ProductImage();
        image.setId(id);
        image.setProduct(product);
        image.setDisplayOrder(order);
        image.setImageUrl("/uploads/" + id + ".jpg");
        return image;
    }
}
