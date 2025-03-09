package com.fill_rouge.backend.mapper;

import com.fill_rouge.backend.domain.User;
import com.fill_rouge.backend.dto.request.RegisterRequest;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-03-09T10:21:39+0000",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.41.0.z20250213-2037, environment: Java 21.0.6 (Eclipse Adoptium)"
)
@Component
public class UserMapperImpl implements UserMapper {

    @Override
    public User toEntity(RegisterRequest request) {
        if ( request == null ) {
            return null;
        }

        User user = new User();

        user.setEmail( request.getEmail() );
        user.setFirstName( request.getFirstName() );
        user.setLastName( request.getLastName() );
        user.setRole( request.getRole() );

        user.setEnabled( true );
        user.setAccountNonLocked( true );
        user.setEmailVerified( false );

        return user;
    }

    @Override
    public void updateEntity(RegisterRequest request, User user) {
        if ( request == null ) {
            return;
        }

        if ( request.getEmail() != null ) {
            user.setEmail( request.getEmail() );
        }
        if ( request.getFirstName() != null ) {
            user.setFirstName( request.getFirstName() );
        }
        if ( request.getLastName() != null ) {
            user.setLastName( request.getLastName() );
        }
        if ( request.getRole() != null ) {
            user.setRole( request.getRole() );
        }
    }

    @Override
    public List<User> toEntityList(List<RegisterRequest> requests) {
        if ( requests == null ) {
            return null;
        }

        List<User> list = new ArrayList<User>( requests.size() );
        for ( RegisterRequest registerRequest : requests ) {
            list.add( toEntity( registerRequest ) );
        }

        return list;
    }

    @Override
    public Set<User> toEntitySet(Set<RegisterRequest> requests) {
        if ( requests == null ) {
            return null;
        }

        Set<User> set = new LinkedHashSet<User>( Math.max( (int) ( requests.size() / .75f ) + 1, 16 ) );
        for ( RegisterRequest registerRequest : requests ) {
            set.add( toEntity( registerRequest ) );
        }

        return set;
    }
}
