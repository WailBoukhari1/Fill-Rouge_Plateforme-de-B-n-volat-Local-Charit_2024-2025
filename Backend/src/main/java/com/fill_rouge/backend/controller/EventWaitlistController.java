package com.fill_rouge.backend.controller;

import com.fill_rouge.backend.service.EventWaitlistService;
import com.fill_rouge.backend.exception.EventNotFoundException;
import com.fill_rouge.backend.exception.WaitlistFullException;
import com.fill_rouge.backend.exception.AlreadyRegisteredException;
import com.fill_rouge.backend.exception.WaitlistDisabledException;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import java.util.Map;

@RestController
@RequestMapping("/api/events/{eventId}/waitlist")
@RequiredArgsConstructor
public class EventWaitlistController {
    private final EventWaitlistService waitlistService;

    @PostMapping("/join")
    public ResponseEntity<Void> joinWaitlist(
            @PathVariable String eventId,
            @RequestHeader("X-User-ID") String userId) {
        try {
            waitlistService.joinWaitlist(eventId, userId);
            return ResponseEntity.ok().build();
        } catch (EventNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (WaitlistFullException | AlreadyRegisteredException | WaitlistDisabledException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/leave")
    public ResponseEntity<Void> leaveWaitlist(
            @PathVariable String eventId,
            @RequestHeader("X-User-ID") String userId) {
        try {
            waitlistService.leaveWaitlist(eventId, userId);
            return ResponseEntity.ok().build();
        } catch (EventNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/promote/{userId}")
    public ResponseEntity<Void> promoteFromWaitlist(
            @PathVariable String eventId,
            @PathVariable String userId) {
        try {
            waitlistService.promoteFromWaitlist(eventId, userId);
            return ResponseEntity.ok().build();
        } catch (EventNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (WaitlistFullException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getWaitlistStatus(
            @PathVariable String eventId,
            @RequestHeader("X-User-ID") String userId) {
        try {
            boolean isOnWaitlist = waitlistService.isOnWaitlist(eventId, userId);
            int position = waitlistService.getWaitlistPosition(eventId, userId);
            
            return ResponseEntity.ok(Map.of(
                "isOnWaitlist", isOnWaitlist,
                "position", position
            ));
        } catch (EventNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }
} 