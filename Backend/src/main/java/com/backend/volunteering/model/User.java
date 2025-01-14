package com.backend.volunteering.model;

import com.backend.volunteering.model.audit.DateAudit;
import com.backend.volunteering.model.enums.AuthProvider;
import com.backend.volunteering.model.enums.UserRole;
import com.backend.volunteering.model.enums.UserStatus;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
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

    @Indexed(unique = true, sparse = true, name = "idx_user_email")
    private String email;

    private String password;

    private String name;

    private String imageUrl;

    private boolean emailVerified = false;

    @Field("provider")
    private AuthProvider provider = AuthProvider.LOCAL;

    @Field("provider_id")
    private String providerId;

    private Set<String> roles = new HashSet<>();

    private boolean enabled = true;

    private String username;

    private UserRole role;

    private UserStatus status;

    @Indexed(name = "idx_verification_token")
    private String verificationToken;

    public Set<GrantedAuthority> getAuthorities() {
        Set<GrantedAuthority> authorities = new HashSet<>();
        roles.forEach(role -> authorities.add(new SimpleGrantedAuthority("ROLE_" + role)));
        return authorities;
    }

    public void setProvider(String provider) {
        this.provider = AuthProvider.valueOf(provider.toUpperCase());
    }

    public void setProvider(AuthProvider provider) {
        this.provider = provider;
    }
} 