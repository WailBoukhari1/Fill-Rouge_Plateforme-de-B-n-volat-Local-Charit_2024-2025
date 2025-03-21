package com.fill_rouge.backend.mapper;

import com.fill_rouge.backend.domain.Organization;
import com.fill_rouge.backend.domain.User;
import com.fill_rouge.backend.dto.request.OrganizationRequest;
import com.fill_rouge.backend.dto.response.OrganizationResponse;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-03-21T13:23:52+0000",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.41.0.z20250213-2037, environment: Java 21.0.6 (Eclipse Adoptium)"
)
@Component
public class OrganizationMapperImpl implements OrganizationMapper {

    @Override
    public Organization toEntity(OrganizationRequest request) {
        if ( request == null ) {
            return null;
        }

        Organization.OrganizationBuilder organization = Organization.builder();

        organization.acceptingVolunteers( request.isAcceptingVolunteers() );
        organization.address( request.getAddress() );
        organization.category( request.getCategory() );
        organization.city( request.getCity() );
        double[] coordinates = request.getCoordinates();
        if ( coordinates != null ) {
            organization.coordinates( Arrays.copyOf( coordinates, coordinates.length ) );
        }
        organization.country( request.getCountry() );
        organization.description( request.getDescription() );
        organization.foundedYear( request.getFoundedYear() );
        organization.logo( request.getLogo() );
        organization.mission( request.getMission() );
        organization.name( request.getName() );
        organization.phoneNumber( request.getPhoneNumber() );
        organization.postalCode( request.getPostalCode() );
        organization.profilePicture( request.getProfilePicture() );
        organization.province( request.getProvince() );
        organization.registrationNumber( request.getRegistrationNumber() );
        organization.size( request.getSize() );
        organization.socialMediaLinks( request.getSocialMediaLinks() );
        organization.type( request.getType() );
        organization.vision( request.getVision() );
        organization.website( request.getWebsite() );

        organization.verified( false );
        organization.rating( 0.0 );
        organization.numberOfRatings( 0 );
        organization.totalEventsHosted( 0 );
        organization.activeVolunteers( 0 );
        organization.totalVolunteerHours( 0 );
        organization.impactScore( 0.0 );
        organization.documents( new ArrayList<>() );
        organization.focusAreas( new HashSet<>(request.getFocusAreas()) );

        return organization.build();
    }

    @Override
    public OrganizationResponse toResponse(Organization organization) {
        if ( organization == null ) {
            return null;
        }

        OrganizationResponse.OrganizationResponseBuilder organizationResponse = OrganizationResponse.builder();

        organizationResponse.userId( organizationUserId( organization ) );
        organizationResponse.acceptingVolunteers( organization.isAcceptingVolunteers() );
        organizationResponse.activeVolunteers( organization.getActiveVolunteers() );
        organizationResponse.address( organization.getAddress() );
        organizationResponse.category( organization.getCategory() );
        organizationResponse.city( organization.getCity() );
        double[] coordinates = organization.getCoordinates();
        if ( coordinates != null ) {
            organizationResponse.coordinates( Arrays.copyOf( coordinates, coordinates.length ) );
        }
        organizationResponse.country( organization.getCountry() );
        organizationResponse.createdAt( organization.getCreatedAt() );
        organizationResponse.description( organization.getDescription() );
        organizationResponse.foundedYear( organization.getFoundedYear() );
        organizationResponse.id( organization.getId() );
        organizationResponse.impactScore( organization.getImpactScore() );
        organizationResponse.logo( organization.getLogo() );
        organizationResponse.mission( organization.getMission() );
        organizationResponse.name( organization.getName() );
        organizationResponse.numberOfRatings( organization.getNumberOfRatings() );
        organizationResponse.phoneNumber( organization.getPhoneNumber() );
        organizationResponse.postalCode( organization.getPostalCode() );
        organizationResponse.profilePicture( organization.getProfilePicture() );
        organizationResponse.province( organization.getProvince() );
        organizationResponse.rating( organization.getRating() );
        organizationResponse.registrationNumber( organization.getRegistrationNumber() );
        organizationResponse.size( organization.getSize() );
        organizationResponse.socialMediaLinks( organization.getSocialMediaLinks() );
        organizationResponse.totalEventsHosted( organization.getTotalEventsHosted() );
        organizationResponse.totalVolunteerHours( organization.getTotalVolunteerHours() );
        organizationResponse.type( organization.getType() );
        organizationResponse.updatedAt( organization.getUpdatedAt() );
        organizationResponse.verificationDate( organization.getVerificationDate() );
        organizationResponse.verified( organization.isVerified() );
        organizationResponse.vision( organization.getVision() );
        organizationResponse.website( organization.getWebsite() );

        organizationResponse.focusAreas( new HashSet<>(organization.getFocusAreas()) );
        organizationResponse.documents( new ArrayList<>(organization.getDocuments()) );

        return organizationResponse.build();
    }

    @Override
    public void updateEntity(OrganizationRequest request, Organization organization) {
        if ( request == null ) {
            return;
        }

        organization.setAcceptingVolunteers( request.isAcceptingVolunteers() );
        if ( request.getAddress() != null ) {
            organization.setAddress( request.getAddress() );
        }
        if ( request.getCategory() != null ) {
            organization.setCategory( request.getCategory() );
        }
        if ( request.getCity() != null ) {
            organization.setCity( request.getCity() );
        }
        double[] coordinates = request.getCoordinates();
        if ( coordinates != null ) {
            organization.setCoordinates( Arrays.copyOf( coordinates, coordinates.length ) );
        }
        if ( request.getCountry() != null ) {
            organization.setCountry( request.getCountry() );
        }
        if ( request.getDescription() != null ) {
            organization.setDescription( request.getDescription() );
        }
        if ( request.getFoundedYear() != null ) {
            organization.setFoundedYear( request.getFoundedYear() );
        }
        if ( request.getLogo() != null ) {
            organization.setLogo( request.getLogo() );
        }
        if ( request.getMission() != null ) {
            organization.setMission( request.getMission() );
        }
        if ( request.getName() != null ) {
            organization.setName( request.getName() );
        }
        if ( request.getPhoneNumber() != null ) {
            organization.setPhoneNumber( request.getPhoneNumber() );
        }
        if ( request.getPostalCode() != null ) {
            organization.setPostalCode( request.getPostalCode() );
        }
        if ( request.getProfilePicture() != null ) {
            organization.setProfilePicture( request.getProfilePicture() );
        }
        if ( request.getProvince() != null ) {
            organization.setProvince( request.getProvince() );
        }
        if ( request.getRegistrationNumber() != null ) {
            organization.setRegistrationNumber( request.getRegistrationNumber() );
        }
        if ( request.getSize() != null ) {
            organization.setSize( request.getSize() );
        }
        if ( request.getSocialMediaLinks() != null ) {
            organization.setSocialMediaLinks( request.getSocialMediaLinks() );
        }
        if ( request.getType() != null ) {
            organization.setType( request.getType() );
        }
        if ( request.getVision() != null ) {
            organization.setVision( request.getVision() );
        }
        if ( request.getWebsite() != null ) {
            organization.setWebsite( request.getWebsite() );
        }

        organization.setDocuments( new ArrayList<>(request.getDocuments()) );
        organization.setFocusAreas( new HashSet<>(request.getFocusAreas()) );
    }

    @Override
    public List<OrganizationResponse> toResponseList(List<Organization> organizations) {
        if ( organizations == null ) {
            return null;
        }

        List<OrganizationResponse> list = new ArrayList<OrganizationResponse>( organizations.size() );
        for ( Organization organization : organizations ) {
            list.add( toResponse( organization ) );
        }

        return list;
    }

    @Override
    public Set<OrganizationResponse> toResponseSet(Set<Organization> organizations) {
        if ( organizations == null ) {
            return null;
        }

        Set<OrganizationResponse> set = new LinkedHashSet<OrganizationResponse>( Math.max( (int) ( organizations.size() / .75f ) + 1, 16 ) );
        for ( Organization organization : organizations ) {
            set.add( toResponse( organization ) );
        }

        return set;
    }

    private String organizationUserId(Organization organization) {
        if ( organization == null ) {
            return null;
        }
        User user = organization.getUser();
        if ( user == null ) {
            return null;
        }
        String id = user.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }
}
