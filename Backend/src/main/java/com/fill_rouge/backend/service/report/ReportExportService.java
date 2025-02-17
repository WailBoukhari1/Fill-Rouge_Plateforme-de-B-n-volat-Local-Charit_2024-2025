package com.fill_rouge.backend.service.report;

import com.fill_rouge.backend.dto.response.OrganizationReportResponse;
import com.fill_rouge.backend.dto.response.VolunteerReportResponse;
import com.itextpdf.text.*;
import com.itextpdf.text.Font;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@Service
public class ReportExportService {
    
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public byte[] exportVolunteerReport(VolunteerReportResponse report, String format) {
        return switch (format.toUpperCase()) {
            case "PDF" -> exportVolunteerReportToPdf(report);
            case "EXCEL" -> exportVolunteerReportToExcel(report);
            case "CSV" -> exportVolunteerReportToCsv(report);
            default -> throw new IllegalArgumentException("Unsupported format: " + format);
        };
    }

    public byte[] exportOrganizationReport(OrganizationReportResponse report, String format) {
        return switch (format.toUpperCase()) {
            case "PDF" -> exportOrganizationReportToPdf(report);
            case "EXCEL" -> exportOrganizationReportToExcel(report);
            case "CSV" -> exportOrganizationReportToCsv(report);
            default -> throw new IllegalArgumentException("Unsupported format: " + format);
        };
    }

    private byte[] exportVolunteerReportToPdf(VolunteerReportResponse report) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, baos);
            document.open();

            // Add title
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            document.add(new Paragraph("Volunteer Report", titleFont));
            document.add(new Paragraph("Generated on: " + DATE_FORMATTER.format(report.getReportGeneratedAt())));
            document.add(Chunk.NEWLINE);

            // Add volunteer info
            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(100);
            addTableRow(table, "Volunteer Name", report.getVolunteerName());
            addTableRow(table, "Total Events Attended", String.valueOf(report.getTotalEventsAttended()));
            addTableRow(table, "Total Hours Contributed", String.valueOf(report.getTotalHoursContributed()));
            addTableRow(table, "Average Rating", String.format("%.2f", report.getAverageRating()));
            document.add(table);
            document.add(Chunk.NEWLINE);

            // Add skills section
            document.add(new Paragraph("Top Skills", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14)));
            for (String skill : report.getTopSkills()) {
                document.add(new Paragraph("• " + skill));
            }
            document.add(Chunk.NEWLINE);

            // Add events by category
            document.add(new Paragraph("Events by Category", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14)));
            PdfPTable categoryTable = new PdfPTable(2);
            categoryTable.setWidthPercentage(100);
            for (Map.Entry<String, Integer> entry : report.getEventsByCategory().entrySet()) {
                addTableRow(categoryTable, entry.getKey(), String.valueOf(entry.getValue()));
            }
            document.add(categoryTable);

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF report", e);
        }
    }

    private byte[] exportVolunteerReportToExcel(VolunteerReportResponse report) {
        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            
            Sheet sheet = workbook.createSheet("Volunteer Report");
            int rowNum = 0;

            // Create header style
            CellStyle headerStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            // Add title
            Row titleRow = sheet.createRow(rowNum++);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("Volunteer Report");
            titleCell.setCellStyle(headerStyle);

            // Add volunteer info
            addExcelRow(sheet, rowNum++, "Volunteer Name", report.getVolunteerName());
            addExcelRow(sheet, rowNum++, "Total Events Attended", String.valueOf(report.getTotalEventsAttended()));
            addExcelRow(sheet, rowNum++, "Total Hours Contributed", String.valueOf(report.getTotalHoursContributed()));
            addExcelRow(sheet, rowNum++, "Average Rating", String.format("%.2f", report.getAverageRating()));

            rowNum++; // Empty row

            // Add skills
            Row skillsHeaderRow = sheet.createRow(rowNum++);
            Cell skillsHeader = skillsHeaderRow.createCell(0);
            skillsHeader.setCellValue("Top Skills");
            skillsHeader.setCellStyle(headerStyle);

            for (String skill : report.getTopSkills()) {
                Row skillRow = sheet.createRow(rowNum++);
                skillRow.createCell(0).setCellValue(skill);
            }

            rowNum++; // Empty row

            // Add events by category
            Row categoryHeaderRow = sheet.createRow(rowNum++);
            Cell categoryHeader = categoryHeaderRow.createCell(0);
            categoryHeader.setCellValue("Events by Category");
            categoryHeader.setCellStyle(headerStyle);

            for (Map.Entry<String, Integer> entry : report.getEventsByCategory().entrySet()) {
                addExcelRow(sheet, rowNum++, entry.getKey(), String.valueOf(entry.getValue()));
            }

            // Auto-size columns
            for (int i = 0; i < 2; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(baos);
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate Excel report", e);
        }
    }

    private byte[] exportVolunteerReportToCsv(VolunteerReportResponse report) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            StringBuilder csv = new StringBuilder();

            // Add header
            csv.append("Volunteer Report\n");
            csv.append("Generated on: ").append(DATE_FORMATTER.format(report.getReportGeneratedAt())).append("\n\n");

            // Add volunteer info
            csv.append("Volunteer Name,").append(report.getVolunteerName()).append("\n");
            csv.append("Total Events Attended,").append(report.getTotalEventsAttended()).append("\n");
            csv.append("Total Hours Contributed,").append(report.getTotalHoursContributed()).append("\n");
            csv.append("Average Rating,").append(String.format("%.2f", report.getAverageRating())).append("\n\n");

            // Add skills
            csv.append("Top Skills\n");
            for (String skill : report.getTopSkills()) {
                csv.append(skill).append("\n");
            }
            csv.append("\n");

            // Add events by category
            csv.append("Events by Category\n");
            csv.append("Category,Count\n");
            for (Map.Entry<String, Integer> entry : report.getEventsByCategory().entrySet()) {
                csv.append(entry.getKey()).append(",").append(entry.getValue()).append("\n");
            }

            return baos.toString().getBytes();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate CSV report", e);
        }
    }

    private void addTableRow(PdfPTable table, String label, String value) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label));
        PdfPCell valueCell = new PdfPCell(new Phrase(value));
        table.addCell(labelCell);
        table.addCell(valueCell);
    }

    private void addExcelRow(Sheet sheet, int rowNum, String label, String value) {
        Row row = sheet.createRow(rowNum);
        row.createCell(0).setCellValue(label);
        row.createCell(1).setCellValue(value);
    }

    // Organization report export methods would be similar to volunteer report methods
    private byte[] exportOrganizationReportToPdf(OrganizationReportResponse report) {
        // Similar implementation to volunteer report
        return new byte[0];
    }

    private byte[] exportOrganizationReportToExcel(OrganizationReportResponse report) {
        // Similar implementation to volunteer report
        return new byte[0];
    }

    private byte[] exportOrganizationReportToCsv(OrganizationReportResponse report) {
        // Similar implementation to volunteer report
        return new byte[0];
    }
} 