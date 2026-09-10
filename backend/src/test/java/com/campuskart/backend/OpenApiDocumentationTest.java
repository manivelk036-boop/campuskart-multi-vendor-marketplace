package com.campuskart.backend;

import com.campuskart.backend.config.OpenApiConfig;
import io.swagger.v3.oas.models.OpenAPI;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class OpenApiDocumentationTest {

    @Test
    void campusKartOpenApiBeanShouldExposeRequestedMetadata() {
        OpenApiConfig openApiConfig = new OpenApiConfig();
        OpenAPI openAPI = openApiConfig.campusKartOpenAPI();

        assertEquals("CampusKart API", openAPI.getInfo().getTitle());
        assertEquals("Multi-vendor campus marketplace REST API", openAPI.getInfo().getDescription());
        assertEquals("1.0.0", openAPI.getInfo().getVersion());
    }
}
