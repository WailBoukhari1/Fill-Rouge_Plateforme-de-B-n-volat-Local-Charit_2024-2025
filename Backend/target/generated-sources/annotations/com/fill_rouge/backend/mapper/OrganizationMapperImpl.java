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
    date = "2025-03-05T23:57:03+0000",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 23.0.2 (Oracle Corporation)"
)
@Component
public class OrganizationMapperImpl implements OrganizationMapper {

    @Override
    public Organization toEntity(OrganizationRequest request) {
        if ( request == null ) {
            return null;
        }

        Organization organization = new Organization();

        organization.setName( request.getName() );
        organization.setDescription( request.getDescription() );
        organization.setMission( request.getMission() );
        organization.setVision( request.getVision() );
        organization.setLogo( request.getLogo() );
        organization.setWebsite( request.getWebsite() );
        organization.setPhoneNumber( request.getPhoneNumber() );
        organization.setAddress( request.getAddress() );
        organization.setCity( request.getCity() );
        organization.setCountry( request.getCountry() );
        double[] coordinates = request.getCoordinates();
        if ( coordinates != null ) {
            organization.setCoordinates( Arrays.copyOf( coordinates, coordinates.length ) );
        }
        Set<String> set = request.getFocusAreas();
        if ( set != null ) {
            organization.setFocusAreas( new LinkedHashSet<String>( set ) );
        }
        List<String> list = request.getSocialMediaLinks();
        if ( list != null ) {
            organization.setSocialMediaLinks( new ArrayList<String>( list ) );
        }
        organization.setRegistrationNumber( request.getRegistrationNumber() );
        organization.setTaxId( request.getTaxId() );
        List<String> list1 = request.getDocuments();
        if ( list1 != null ) {
            organization.setDocuments( new ArrayList<String>( list1 ) );
        }
        organization.setAcceptingVolunteers( request.isAcceptingVolunteers() );

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
        organizationResponse.id( organization.getId() );
        organizationResponse.name( organization.getName() );
        organizationResponse.description( organization.getDescription() );
        organizationResponse.mission( organization.getMission() );
        organizationResponse.vision( organization.getVision() );
        organizationResponse.logo( organization.getLogo() );
        organizationResponse.website( organization.getWebsite() );
        organizationResponse.phoneNumber( organization.getPhoneNumber() );
        organizationResponse.address( organization.getAddress() );
        organizationResponse.city( organization.getCity() );
        organizationResponse.country( organization.getCountry() );
        double[] coordinates = organization.getCoordinates();
        if ( coordinates != null ) {
            organizationResponse.coordinates( Arrays.copyOf( coordinates, coordinates.length ) );
        }
        organizationResponse.verified( organization.isVerified() );
        organizationResponse.verificationDate( organization.getVerificationDate() );
        organizationResponse.registrationNumber( organization.getRegistrationNumber() );
        organizationResponse.taxId( organization.getTaxId() );
        organizationResponse.rating( organization.getRating() );
        organizationResponse.numberOfRatings( organization.getNumberOfRatings() );
        organizationResponse.totalEventsHosted( organization.getTotalEventsHosted() );
        organizationResponse.activeVolunteers( organization.getActiveVolunteers() );
        organizationResponse.totalVolunteerHours( organization.getTotalVolunteerHours() );
        organizationResponse.impactScore( organization.getImpactScore() );
        organizationResponse.acceptingVolunteers( organization.isAcceptingVolunteers() );
        organizationResponse.createdAt( organization.getCreatedAt() );
        organizationResponse.updatedAt( organization.getUpdatedAt() );

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

        if ( request.getName() != null ) {
            organization.setName( request.getName() );
        }
        if ( request.getDescription() != null ) {
            organization.setDescription( request.getDescription() );
        }
        if ( request.getMission() != null ) {
            organization.setMission( request.getMission() );
        }
        if ( request.getVision() != null ) {
            organization.setVision( request.getVision() );
        }
        if ( request.getLogo() != null ) {
            organization.setLogo( request.getLogo() );
        }
        if ( request.getWebsite() != null ) {
            organization.setWebsite( request.getWebsite() );
        }
        if ( request.getPhoneNumber() != null ) {
            organization.setPhoneNumber( request.getPhoneNumber() );
        }
        if ( request.getAddress() != null ) {
            organization.setAddress( request.getAddress() );
        }
        if ( request.getCity() != null ) {
            organization.setCity( request.getCity() );
        }
        if ( request.getCountry() != null ) {
            organization.setCountry( request.getCountry() );
        }
        double[] coordinates = request.getCoordinates();
        if ( coordinates != null ) {
            organization.setCoordinates( Arrays.copyOf( coordinates, coordinates.length ) );
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
        if ( organization.getSocialMediaLinks() != null ) {
            List<String> list = request.getSocialMediaLinks();
            if ( list != null ) {
                organization.getSocialMediaLinks().clear();
                organization.getSocialMediaLinks().addAll( list );
            }
        }
        else {
            List<String> list = request.getSocialMediaLinks();
            if ( list != null ) {
                organization.setSocialMediaLinks( new ArrayList<String>( list ) );
            }
        }
        if ( request.getRegistrationNumber() != null ) {
            organization.setRegistrationNumber( request.getRegistrationNumber() );
        }
        if ( request.getTaxId() != null ) {
            organization.setTaxId( request.getTaxId() );
        }
        if ( organization.getDocuments() != null ) {
            List<String> list1 = request.getDocuments();
            if ( list1 != null ) {
                organization.getDocuments().clear();
                organization.getDocuments().addAll( list1 );
            }
        }
        else {
            List<String> list1 = request.getDocuments();
            if ( list1 != null ) {
                organization.setDocuments( new ArrayList<String>( list1 ) );
            }
        }
        organization.setAcceptingVolunteers( request.isAcceptingVolunteers() );
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
