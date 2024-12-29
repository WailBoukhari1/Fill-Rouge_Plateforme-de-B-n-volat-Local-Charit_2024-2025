package com.youcode.volunteering.model;

import com.youcode.volunteering.model.common.BaseEntity;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Document(collection = "users")
public class User extends BaseEntity implements UserDetails {
    private String email;
    private String password;
    private String firstName;
    private String lastName;
    private String avatar;
    private String bio;
    private Set<String> skills;
    private Set<String> interests;
    private Location location;
    private Role role;
    private Verification verification;
    private Metrics metrics;
    private Settings settings;
    private boolean enabled;

    @Data
    public static class Verification {
        private boolean emailVerified;
        private boolean phoneVerified;
        private BackgroundCheck backgroundCheck;
    }

    @Data
    public static class BackgroundCheck {
        private String status;
        private LocalDateTime completedAt;
        private String provider;
    }

    @Data
    public static class Metrics {
        private Integer totalHours;
        private Double impactScore;
        private LocalDateTime lastActive;
    }

    @Data
    public static class Settings {
        private NotificationSettings notifications;
        private PrivacySettings privacy;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
} 