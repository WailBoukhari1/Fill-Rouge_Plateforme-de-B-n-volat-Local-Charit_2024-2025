package com.fill_rouge.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.mvc.method.RequestMappingInfo;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import com.fill_rouge.backend.service.event.EventService;
import com.fill_rouge.backend.service.event.impl.EventSchedulerService;

import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

/**
 * Controller for diagnostic operations.
 * These endpoints should be secured and only accessible to administrators in production.
 */
@RestController
@RequestMapping("/diagnostics")
@Slf4j
public class DiagnosticController {
    
    @Autowired
    private ApplicationContext context;
    
    @Autowired
    private EventService eventService;
    
    @Autowired
    private EventSchedulerService schedulerService;

    @GetMapping("/routes")
    public ResponseEntity<Map<String, Object>> getRoutes() {
        RequestMappingHandlerMapping mapping = context.getBean(RequestMappingHandlerMapping.class);
        Map<RequestMappingInfo, HandlerMethod> handlerMethods = mapping.getHandlerMethods();
        
        Map<String, Map<String, String>> routeInfo = new TreeMap<>();
        
        handlerMethods.forEach((key, value) -> {
            String className = value.getBeanType().getSimpleName();
            String methodName = value.getMethod().getName();
            
            // Get the HTTP methods
            String httpMethods = key.getMethodsCondition().getMethods().stream()
                    .map(Object::toString)
                    .collect(Collectors.joining(", "));
            
            // Get the paths
            String paths = key.getPatternsCondition().getPatterns().toString();
            
            Map<String, String> info = new HashMap<>();
            info.put("method", httpMethods);
            info.put("path", paths);
            info.put("handler", methodName);
            
            routeInfo.put(className + ": " + methodName, info);
        });
        
        Map<String, Object> info = new HashMap<>();
        info.put("routes", routeInfo);
        info.put("count", routeInfo.size());
        
        return ResponseEntity.ok(info);
    }

    /**
     * Simple health check endpoint
     */
    @GetMapping("/ping")
    public ResponseEntity<Map<String, Object>> ping() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("timestamp", LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }
    
    /**
     * Trigger the event status scheduler manually for testing purposes
     */
    @PostMapping("/trigger-event-status-update")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> triggerEventStatusUpdates() {
        log.info("Manual trigger for event status updates");
        
        try {
            schedulerService.scheduleEventStatusUpdates();
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "SUCCESS");
            response.put("message", "Event status updates triggered successfully");
            response.put("timestamp", LocalDateTime.now().toString());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error triggering event status updates: {}", e.getMessage(), e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "ERROR");
            response.put("message", "Failed to trigger event status updates: " + e.getMessage());
            response.put("timestamp", LocalDateTime.now().toString());
            return ResponseEntity.internalServerError().body(response);
        }
    }
} 