package com.youcode.volunteering.model;

import lombok.Data;

@Data
public class Location {
    private String address;
    private GeoPoint coordinates;
    private Boolean virtual;

    @Data
    public static class GeoPoint {
        private String type = "Point";
        private double[] coordinates; // [longitude, latitude]
    }
} 