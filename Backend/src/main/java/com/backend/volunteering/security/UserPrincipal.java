package com.backend.volunteering.security;

import com.backend.volunteering.model.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Getter
@AllArgsConstructor
public class UserPrincipal implements UserDetails, OAuth2User {
    private String id;
    private String email;
    private String password;
    private Collection<? extends GrantedAuthority> authorities;
    private Map<String, Object> attributes;
    private User user;

    public UserPrincipal(String id, String email, String password, 
                        Collection<? extends GrantedAuthority> authorities,
                        User user) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.authorities = authorities;
        this.user = user;
    }

    public static UserPrincipal create(User user) {
        List<GrantedAuthority> authorities = user.getAuthorities().stream()
                .collect(Collectors.toList());

        return new UserPrincipal(
            user.getId(),
            user.getEmail(),
            user.getPassword(),
            authorities,
            user
        );
    }

    @Override
    public String getUsername() {
        return email; // Use email as username
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

    @Override
    public boolean isEnabled() {
        return true;
    }

    public String getName() {
        return email;  // or return the name if you store it in UserPrincipal
    }
} 