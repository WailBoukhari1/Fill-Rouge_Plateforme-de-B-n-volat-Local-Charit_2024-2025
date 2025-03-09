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
    date = "2025-03-09T10:21:39+0000",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.41.0.z20250213-2037, environment: Java 21.0.6 (Eclipse Adoptium)"
)
@Component
public class OrganizationMapperImpl implements OrganizationMapper {

    @Override
    public Organization toEntity(OrganizationRequest request) {
        if ( request == null ) {
            return null;
        }

        Organization organization = new Organization();

        organization.setAcceptingVolunteers( request.isAcceptingVolunteers() );
        organization.setAddress( request.getAddress() );
        organization.setCity( request.getCity() );
        double[] coordinates = request.getCoordinates();
        if ( coordinates != null ) {
            organization.setCoordinates( Arrays.copyOf( coordinates, coordinates.length ) );
        }
        organization.setCountry( request.getCountry() );
        organization.setDescription( request.getDescription() );
        List<String> list = request.getDocuments();
        if ( list != null ) {
            organization.setDocuments( new ArrayList<String>( list ) );
        }
        Set<String> set = request.getFocusAreas();
        if ( set != null ) {
            organization.setFocusAreas( new LinkedHashSet<String>( set ) );
        }
        organization.setLogo( request.getLogo() );
        organization.setMission( request.getMission() );
        organization.setName( request.getName() );
        organization.setPhoneNumber( request.getPhoneNumber() );
        organization.setRegistrationNumber( request.getRegistrationNumber() );
        List<String> list1 = request.getSocialMediaLinks();
        if ( list1 != null ) {
            organization.setSocialMediaLinks( new ArrayList<String>( list1 ) );
        }
        organization.setTaxId( request.getTaxId() );
        organization.setVision( request.getVision() );
        organization.setWebsite( request.getWebsite() );

        organization.setVerified( false );
        organization.setRating( 0.0 );
        organization.setNumberOfRatings( 0 );
        organization.setTotalEventsHosted( 0 );
        organization.setActiveVolunteers( 0 );
        organization.setTotalVolunteerHours( 0 );
        organization.setImpactScore( 0.0 );

        return organization;
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
        organizationResponse.city( organization.getCity() );
        double[] coordinates = organization.getCoordinates();
        if ( coordinates != null ) {
            organizationResponse.coordinates( Arrays.copyOf( coordinates, coordinates.length ) );
        }
        organizationResponse.country( organization.getCountry() );
        organizationResponse.createdAt( organization.getCreatedAt() );
        organizationResponse.description( organization.getDescription() );
        organizationResponse.id( organization.getId() );
        organizationResponse.impactScore( organization.getImpactScore() );
        organizationResponse.logo( organization.getLogo() );
        organizationResponse.mission( organization.getMission() );
        organizationResponse.name( organization.getName() );
        organizationResponse.numberOfRatings( organization.getNumberOfRatings() );
        organizationResponse.phoneNumber( organization.getPhoneNumber() );
        organizationResponse.rating( organization.getRating() );
        organizationResponse.registrationNumber( organization.getRegistrationNumber() );
        organizationResponse.taxId( organization.getTaxId() );
        organizationResponse.totalEventsHosted( organization.getTotalEventsHosted() );
        organizationResponse.totalVolunteerHours( organization.getTotalVolunteerHours() );
        organizationResponse.updatedAt( organization.getUpdatedAt() );
        organizationResponse.verificationDate( organization.getVerificationDate() );
        organizationResponse.verified( organization.isVerified() );
        organizationResponse.vision( organization.getVision() );
        organizationResponse.website( organization.getWebsite() );

        organizationResponse.focusAreas( new HashSet<>(organization.getFocusAreas()) );
        organizationResponse.socialMediaLinks( new ArrayList<>(organization.getSocialMediaLinks()) );
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
        if ( organization.getDocuments() != null ) {
            List<String> list = request.getDocuments();
            if ( list != null ) {
                organization.getDocuments().clear();
                organization.getDocuments().addAll( list );
            }
        }
        else {
            List<String> list = request.getDocuments();
            if ( list != null ) {
                organization.setDocuments( new ArrayList<String>( list ) );
            }
        }
        if ( organization.getFocusAreas() != null ) {
            Set<String> set = request.getFocusAreas();
            if ( set != null ) {
                organization.getFocusAreas().clear();
                organization.getFocusAreas().addAll( set );
            }
        }
        else {
            Set<String> set = request.getFocusAreas();
            if ( set != null ) {
                organization.setFocusAreas( new LinkedHashSet<String>( set ) );
            }
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
        if ( request.getRegistrationNumber() != null ) {
            organization.setRegistrationNumber( request.getRegistrationNumber() );
        }
        if ( organization.getSocialMediaLinks() != null ) {
            List<String> list1 = request.getSocialMediaLinks();
            if ( list1 != null ) {
                organization.getSocialMediaLinks().clear();
                organization.getSocialMediaLinks().addAll( list1 );
            }
        }
        else {
            List<String> list1 = request.getSocialMediaLinks();
            if ( list1 != null ) {
                organization.setSocialMediaLinks( new ArrayList<String>( list1 ) );
            }
        }
        if ( request.getTaxId() != null ) {
            organization.setTaxId( request.getTaxId() );
        }
        if ( request.getVision() != null ) {
            organization.setVision( request.getVision() );
        }
        if ( request.getWebsite() != null ) {
            organization.setWebsite( request.getWebsite() );
        }
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
