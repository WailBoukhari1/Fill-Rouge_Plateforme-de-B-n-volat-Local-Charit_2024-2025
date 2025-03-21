package com.fill_rouge.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.format.FormatterRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

@Configuration
public class DateTimeConfig implements WebMvcConfigurer {

    @Bean
    public Converter<String, LocalDateTime> localDateTimeConverter() {
        return new Converter<String, LocalDateTime>() {
            private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");

            @Override
            public LocalDateTime convert(String source) {
                if (source == null || source.trim().isEmpty()) {
                    return null;
                }
                try {
                    return LocalDateTime.parse(source, formatter);
                } catch (DateTimeParseException e) {
                    throw new IllegalArgumentException("Invalid date format. Expected format: yyyy-MM-dd'T'HH:mm:ss", e);
                }
            }
        };
    }

    @Override
    public void addFormatters(FormatterRegistry registry) {
        registry.addConverter(localDateTimeConverter());
    }
} 