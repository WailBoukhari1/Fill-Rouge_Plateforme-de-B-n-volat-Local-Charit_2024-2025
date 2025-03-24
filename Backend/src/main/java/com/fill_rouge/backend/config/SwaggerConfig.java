package com.fill_rouge.backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.security.SecurityRequirement;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;

import java.util.List;

@Configuration
public class SwaggerConfig {

    @Value("${server.port}")
    private String serverPort;

    @Value("${server.servlet.context-path}")
    private String contextPath;

    @Bean
    public OpenAPI myOpenAPI() {
        Server devServer = new Server()
            .url("http://localhost:" + serverPort)
            .description("Development server");

        Contact contact = new Contact()
            .name("Fill Rouge Team")
            .email("support@fillrouge.com");

        Info info = new Info()
            .title("Fill Rouge API Documentation")
            .version("1.0")
            .contact(contact)
            .description("This API exposes endpoints for the Fill Rouge platform.")
            .license(new License().name("Apache 2.0").url("http://springdoc.org"));

        SecurityScheme securityScheme = new SecurityScheme()
            .type(SecurityScheme.Type.HTTP)
            .scheme("bearer")
            .bearerFormat("JWT")
            .description("Please enter a valid JWT token");

        Components components = new Components()
            .addSecuritySchemes("bearerAuth", securityScheme);

        return new OpenAPI()
            .info(info)
            .servers(List.of(devServer))
            .components(components)
            .addSecurityItem(new SecurityRequirement().addList("bearerAuth"));
    }
} 