package com.backend.volunteering.model;

import com.backend.volunteering.model.audit.DateAudit;
import com.backend.volunteering.model.enums.AuthProvider;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.HashSet;
import java.util.Set;

@Data
@EqualsAndHashCode(callSuper = true)
@Document(collection = "users")
public class User extends DateAudit {
    @Id
    private String id;

    @Indexed(unique = true)
    private String email;

    private String password;

    private String name;

    private String imageUrl;

    private boolean emailVerified = false;

    private AuthProvider provider = AuthProvider.local;

    private String providerId;

    private Set<String> roles = new HashSet<>();

    private boolean enabled = true;

    @Indexed(unique = true)
    private String username;

    public Set<GrantedAuthority> getAuthorities() {
        Set<GrantedAuthority> authorities = new HashSet<>();
        roles.forEach(role -> authorities.add(new SimpleGrantedAuthority("ROLE_" + role)));
        return authorities;
    }
} 