package com.backend.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class OrganizationRequest {
    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100)
    private String name;

    @NotBlank(message = "Description is required")
    @Size(max = 1000)
    private String description;

    @Pattern(regexp = "^(https?://)?[\\w-]+(\\.[\\w-]+)+([\\w.,@?^=%&:/~+#-]*[\\w@?^=%&/~+#-])?$",
            message = "Invalid website URL format")
    private String website;

    @Pattern(regexp = "^(https?://.*\\.(png|jpg|jpeg|gif))$",
            message = "Invalid logo URL format")
    private String logo;

    @Size(max = 200)
    private String address;

    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$",
            message = "Invalid phone number format")
    private String phone;

    @Size(max = 500)
    private String mission;

    @Size(max = 500)
    private String vision;

    @NotBlank(message = "Contact email is required")
    @Email(message = "Invalid email format")
    private String contactEmail;

    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Invalid phone number")
    private String contactPhone;
} 