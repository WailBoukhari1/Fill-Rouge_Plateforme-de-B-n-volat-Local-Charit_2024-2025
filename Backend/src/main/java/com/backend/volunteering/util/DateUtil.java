package com.backend.volunteering.util;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

public final class DateUtil {
    
    private static final String DEFAULT_DATE_FORMAT = "yyyy-MM-dd HH:mm:ss";
    private static final ZoneId DEFAULT_ZONE_ID = ZoneId.systemDefault();
    
    private DateUtil() {
        // Private constructor to prevent instantiation
    }

    public static String formatInstant(Instant instant) {
        return formatInstant(instant, DEFAULT_DATE_FORMAT);
    }

    public static String formatInstant(Instant instant, String pattern) {
        LocalDateTime localDateTime = LocalDateTime.ofInstant(instant, DEFAULT_ZONE_ID);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern(pattern);
        return localDateTime.format(formatter);
    }

    public static Instant parseDateTime(String dateTime) {
        return parseDateTime(dateTime, DEFAULT_DATE_FORMAT);
    }

    public static Instant parseDateTime(String dateTime, String pattern) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern(pattern);
        LocalDateTime localDateTime = LocalDateTime.parse(dateTime, formatter);
        return localDateTime.atZone(DEFAULT_ZONE_ID).toInstant();
    }

    public static boolean isDateTimeValid(String dateTime) {
        return isDateTimeValid(dateTime, DEFAULT_DATE_FORMAT);
    }

    public static boolean isDateTimeValid(String dateTime, String pattern) {
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern(pattern);
            LocalDateTime.parse(dateTime, formatter);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
} 