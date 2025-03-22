package com.fill_rouge.backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DocumentUrlRequest {
    private String documentUrl;
    private String documentType;
}