package com.fill_rouge.backend.mapper;

import com.fill_rouge.backend.domain.Resource;
import com.fill_rouge.backend.dto.request.ResourceRequest;
import com.fill_rouge.backend.dto.response.ResourceResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import java.util.List;
import java.util.Set;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ResourceMapper {
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "uploadedAt", ignore = true)
    @Mapping(target = "lastModified", ignore = true)
    @Mapping(target = "size", ignore = true)
    @Mapping(target = "contentType", ignore = true)
    @Mapping(target = "filePath", ignore = true)
    Resource toEntity(ResourceRequest request);
    
    @Mapping(target = "downloadUrl", expression = "java(\"/api/resources/\" + resource.getId() + \"/download\")")
    @Mapping(target = "thumbnailUrl", expression = "java(resource.getThumbnailPath() != null ? \"/api/resources/\" + resource.getId() + \"/thumbnail\" : null)")
    ResourceResponse toResponse(Resource resource);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "uploadedAt", ignore = true)
    @Mapping(target = "uploadedBy", ignore = true)
    void updateEntity(ResourceRequest request, @MappingTarget Resource resource);

    List<ResourceResponse> toResponseList(List<Resource> resources);
    Set<ResourceResponse> toResponseSet(Set<Resource> resources);
} 