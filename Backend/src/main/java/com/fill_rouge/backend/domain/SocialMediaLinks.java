package com.fill_rouge.backend.domain;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SocialMediaLinks {
    private String facebook;
    private String twitter;
    private String instagram;
    private String linkedin;
    private String website;
} 