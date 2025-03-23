package com.fill_rouge.backend.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.mvc.method.RequestMappingInfo;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.servlet.http.HttpServletRequest;

import java.util.HashMap;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

/**
 * Diagnostic controller to help debug routing issues
 * This can be removed in production
 */
@RestController
@RequestMapping("/diagnostic")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Diagnostics", description = "Application diagnostic endpoints")
public class DiagnosticController {

    @Autowired
    private ApplicationContext context;

    @GetMapping("/routes")
    @Operation(summary = "Get all registered routes in the application")
    public ResponseEntity<Map<String, String>> getAllRoutes() {
        log.info("Fetching all registered routes");
        
        RequestMappingHandlerMapping requestMappingHandlerMapping = context.getBean(RequestMappingHandlerMapping.class);
        Map<RequestMappingInfo, HandlerMethod> handlerMethods = requestMappingHandlerMapping.getHandlerMethods();
        
        // Convert to a more readable format
        Map<String, String> routes = new TreeMap<>();
        handlerMethods.forEach((key, value) -> {
            // Get the patterns (URLs)
            String patterns = key.getPathPatternsCondition().getPatterns()
                    .stream()
                    .map(p -> p.toString())
                    .collect(Collectors.joining(", "));
            
            // Get the HTTP methods
            String methods = key.getMethodsCondition().getMethods()
                    .stream()
                    .map(m -> m.toString())
                    .collect(Collectors.joining(", "));
            
            // Get the controller class and method
            String controllerMethod = value.getBeanType().getSimpleName() + "." + value.getMethod().getName();
            
            routes.put(patterns + " [" + methods + "]", controllerMethod);
        });
        
        log.info("Found {} registered routes", routes.size());
        return ResponseEntity.ok(routes);
    }
    
    @GetMapping("/request-info")
    @Operation(summary = "Get diagnostic information about the current request")
    public ResponseEntity<Map<String, String>> getRequestInfo(HttpServletRequest request) {
        log.info("Fetching diagnostic information for request: {}", request.getRequestURL());
        
        Map<String, String> info = new HashMap<>();
        info.put("RequestURL", request.getRequestURL().toString());
        info.put("RequestURI", request.getRequestURI());
        info.put("ContextPath", request.getContextPath());
        info.put("ServletPath", request.getServletPath());
        info.put("PathInfo", request.getPathInfo());
        info.put("QueryString", request.getQueryString());
        info.put("Method", request.getMethod());
        info.put("RemoteAddr", request.getRemoteAddr());
        info.put("ServerName", request.getServerName());
        info.put("ServerPort", String.valueOf(request.getServerPort()));
        
        // Add headers
        Map<String, String> headers = new HashMap<>();
        request.getHeaderNames().asIterator().forEachRemaining(
            headerName -> headers.put(headerName, request.getHeader(headerName))
        );
        info.put("Headers", headers.toString());
        
        log.info("Request info collected");
        return ResponseEntity.ok(info);
    }
} 