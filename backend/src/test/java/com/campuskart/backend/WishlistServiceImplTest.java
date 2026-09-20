package com.campuskart.backend;

import com.campuskart.backend.dto.WishlistResponse;
import com.campuskart.backend.entity.Product;
import com.campuskart.backend.entity.User;
import com.campuskart.backend.entity.Wishlist;
import com.campuskart.backend.repository.ProductRepository;
import com.campuskart.backend.repository.WishlistRepository;
import com.campuskart.backend.service.impl.WishlistServiceImpl;
import org.junit.jupiter.api.BeforeEach;
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
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WishlistServiceImplTest {

    @Mock
    private WishlistRepository wishlistRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private WishlistServiceImpl wishlistService;

    private User customer;
    private Product product;

    @BeforeEach
    void setUp() {
        customer = new User();
        customer.setId(7L);
        customer.setFullName("Wishlist Customer");
        customer.setRole("CUSTOMER");

        product = new Product();
        product.setId(11L);
        product.setProductName("Campus Notebook");
        product.setPrice(120.0);
        product.setQuantity(4);
    }

    @Test
    void addProductToWishlist() {
        when(productRepository.findById(11L)).thenReturn(Optional.of(product));
        when(wishlistRepository.existsByUserIdAndProductId(7L, 11L)).thenReturn(false);
        when(wishlistRepository.save(any(Wishlist.class))).thenAnswer(invocation -> invocation.getArgument(0));

        WishlistResponse response = wishlistService.addProduct(11L, customer);

        assertEquals(11L, response.productId());
        assertEquals("Campus Notebook", response.productName());
        verify(wishlistRepository).save(any(Wishlist.class));
    }

    @Test
    void duplicateWishlistEntryIsRejected() {
        when(productRepository.findById(11L)).thenReturn(Optional.of(product));
        when(wishlistRepository.existsByUserIdAndProductId(7L, 11L)).thenReturn(true);

        assertThrows(IllegalStateException.class,
                () -> wishlistService.addProduct(11L, customer));
        verify(wishlistRepository, never()).save(any());
    }

    @Test
    void removeWishlistItem() {
        Wishlist wishlist = wishlist(30L, customer, product);
        when(wishlistRepository.findByUserIdAndProductId(7L, 11L)).thenReturn(Optional.of(wishlist));

        wishlistService.removeProduct(11L, customer);

        verify(wishlistRepository).delete(wishlist);
    }

    @Test
    void getWishlistUsesOnlyCurrentCustomerId() {
        Wishlist wishlist = wishlist(30L, customer, product);
        when(wishlistRepository.findByUserIdOrderByCreatedAtDesc(7L)).thenReturn(List.of(wishlist));

        List<WishlistResponse> result = wishlistService.getWishlist(customer);

        assertEquals(1, result.size());
        assertEquals(11L, result.get(0).productId());
        verify(wishlistRepository).findByUserIdOrderByCreatedAtDesc(7L);
    }

    @Test
    void nonCustomerCannotAccessWishlist() {
        User seller = new User();
        seller.setId(8L);
        seller.setRole("SELLER");

        assertThrows(AccessDeniedException.class, () -> wishlistService.getWishlist(seller));
        verify(wishlistRepository, never()).findByUserIdOrderByCreatedAtDesc(any());
    }

    @Test
    void missingProductCannotBeAdded() {
        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class,
                () -> wishlistService.addProduct(99L, customer));
        verify(wishlistRepository, never()).save(any());
    }

    private Wishlist wishlist(Long id, User user, Product wishlistProduct) {
        Wishlist wishlist = new Wishlist();
        wishlist.setId(id);
        wishlist.setUser(user);
        wishlist.setProduct(wishlistProduct);
        return wishlist;
    }
}
