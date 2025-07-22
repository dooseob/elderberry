package com.globalcarelink.common.util;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoUnit;
import java.util.Locale;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class DateUtil {

    public static final ZoneId KOREA_ZONE = ZoneId.of("Asia/Seoul");
    public static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    public static final DateTimeFormatter DATETIME_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    public static final DateTimeFormatter TIMESTAMP_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS");
    public static final DateTimeFormatter KOREAN_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy년 MM월 dd일", Locale.KOREAN);
    public static final DateTimeFormatter KOREAN_DATETIME_FORMAT = DateTimeFormatter.ofPattern("yyyy년 MM월 dd일 HH시 mm분", Locale.KOREAN);

    public static LocalDateTime now() {
        return LocalDateTime.now(KOREA_ZONE);
    }

    public static LocalDate today() {
        return LocalDate.now(KOREA_ZONE);
    }

    public static String formatDate(LocalDate date) {
        return date != null ? date.format(DATE_FORMAT) : null;
    }

    public static String formatDateTime(LocalDateTime dateTime) {
        return dateTime != null ? dateTime.format(DATETIME_FORMAT) : null;
    }

    public static String formatKoreanDate(LocalDate date) {
        return date != null ? date.format(KOREAN_DATE_FORMAT) : null;
    }

    public static String formatKoreanDateTime(LocalDateTime dateTime) {
        return dateTime != null ? dateTime.format(KOREAN_DATETIME_FORMAT) : null;
    }

    public static LocalDate parseDate(String dateString) {
        try {
            return LocalDate.parse(dateString, DATE_FORMAT);
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("날짜 형식이 올바르지 않습니다: " + dateString, e);
        }
    }

    public static LocalDateTime parseDateTime(String dateTimeString) {
        try {
            return LocalDateTime.parse(dateTimeString, DATETIME_FORMAT);
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("날짜시간 형식이 올바르지 않습니다: " + dateTimeString, e);
        }
    }

    public static long daysBetween(LocalDate startDate, LocalDate endDate) {
        return ChronoUnit.DAYS.between(startDate, endDate);
    }

    public static long hoursBetween(LocalDateTime startDateTime, LocalDateTime endDateTime) {
        return ChronoUnit.HOURS.between(startDateTime, endDateTime);
    }

    public static long minutesBetween(LocalDateTime startDateTime, LocalDateTime endDateTime) {
        return ChronoUnit.MINUTES.between(startDateTime, endDateTime);
    }

    public static boolean isToday(LocalDate date) {
        return date != null && date.equals(today());
    }

    public static boolean isThisWeek(LocalDate date) {
        if (date == null) return false;
        
        LocalDate today = today();
        LocalDate weekStart = today.with(DayOfWeek.MONDAY);
        LocalDate weekEnd = today.with(DayOfWeek.SUNDAY);
        
        return !date.isBefore(weekStart) && !date.isAfter(weekEnd);
    }

    public static boolean isThisMonth(LocalDate date) {
        if (date == null) return false;
        
        LocalDate today = today();
        return date.getYear() == today.getYear() && date.getMonth() == today.getMonth();
    }

    public static int calculateAge(LocalDate birthDate) {
        if (birthDate == null) return 0;
        return Period.between(birthDate, today()).getYears();
    }

    public static String getTimeAgoText(LocalDateTime dateTime) {
        if (dateTime == null) return "";
        
        LocalDateTime now = now();
        long minutes = ChronoUnit.MINUTES.between(dateTime, now);
        
        if (minutes < 1) return "방금 전";
        if (minutes < 60) return minutes + "분 전";
        
        long hours = ChronoUnit.HOURS.between(dateTime, now);
        if (hours < 24) return hours + "시간 전";
        
        long days = ChronoUnit.DAYS.between(dateTime, now);
        if (days < 7) return days + "일 전";
        if (days < 30) return (days / 7) + "주 전";
        if (days < 365) return (days / 30) + "개월 전";
        
        return (days / 365) + "년 전";
    }

    public static LocalDateTime startOfDay(LocalDate date) {
        return date != null ? date.atStartOfDay() : null;
    }

    public static LocalDateTime endOfDay(LocalDate date) {
        return date != null ? date.atTime(23, 59, 59, 999_999_999) : null;
    }

    public static LocalDate getFirstDayOfMonth(LocalDate date) {
        return date != null ? date.withDayOfMonth(1) : null;
    }

    public static LocalDate getLastDayOfMonth(LocalDate date) {
        return date != null ? date.withDayOfMonth(date.lengthOfMonth()) : null;
    }

    public static boolean isBusinessDay(LocalDate date) {
        if (date == null) return false;
        
        DayOfWeek dayOfWeek = date.getDayOfWeek();
        return dayOfWeek != DayOfWeek.SATURDAY && dayOfWeek != DayOfWeek.SUNDAY;
    }

    public static boolean isWeekend(LocalDate date) {
        return !isBusinessDay(date);
    }

    public static LocalDateTime convertToKoreaTime(LocalDateTime utcDateTime) {
        if (utcDateTime == null) return null;
        
        return utcDateTime.atZone(ZoneOffset.UTC)
                         .withZoneSameInstant(KOREA_ZONE)
                         .toLocalDateTime();
    }

    public static LocalDateTime convertToUtc(LocalDateTime koreaDateTime) {
        if (koreaDateTime == null) return null;
        
        return koreaDateTime.atZone(KOREA_ZONE)
                           .withZoneSameInstant(ZoneOffset.UTC)
                           .toLocalDateTime();
    }

    public static boolean isValidDateRange(LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null) return false;
        return !startDate.isAfter(endDate);
    }

    public static boolean isValidDateTimeRange(LocalDateTime startDateTime, LocalDateTime endDateTime) {
        if (startDateTime == null || endDateTime == null) return false;
        return !startDateTime.isAfter(endDateTime);
    }
}