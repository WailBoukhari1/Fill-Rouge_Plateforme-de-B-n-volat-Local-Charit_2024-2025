package com.fill_rouge.backend.service.report;

import com.fill_rouge.backend.dto.response.OrganizationReportResponse;
import com.fill_rouge.backend.dto.response.VolunteerReportResponse;
import com.itextpdf.text.*;
import com.itextpdf.text.Font;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.Date;
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

    private byte[] exportOrganizationReportToPdf(OrganizationReportResponse report) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, baos);
            document.open();

            // Add title
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 12);

            // Header
            document.add(new Paragraph("Organization Report", titleFont));
            document.add(new Paragraph("Generated on: " + DATE_FORMATTER.format(report.getReportGeneratedAt())));
            document.add(Chunk.NEWLINE);

            // Organization Info
            document.add(new Paragraph("Organization Information", subtitleFont));
            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            addTableRow(infoTable, "Organization Name", report.getOrganizationName());
            addTableRow(infoTable, "Report Period", 
                DATE_FORMATTER.format(report.getPeriodStart()) + " to " + 
                DATE_FORMATTER.format(report.getPeriodEnd()));
            document.add(infoTable);
            document.add(Chunk.NEWLINE);

            // Key Statistics
            document.add(new Paragraph("Key Statistics", subtitleFont));
            PdfPTable statsTable = new PdfPTable(2);
            statsTable.setWidthPercentage(100);
            addTableRow(statsTable, "Total Events Hosted", String.valueOf(report.getTotalEventsHosted()));
            addTableRow(statsTable, "Total Volunteers Engaged", String.valueOf(report.getTotalVolunteersEngaged()));
            addTableRow(statsTable, "Total Volunteer Hours", String.valueOf(report.getTotalVolunteerHours()));
            addTableRow(statsTable, "Average Event Rating", String.format("%.2f", report.getAverageEventRating()));
            document.add(statsTable);
            document.add(Chunk.NEWLINE);

            // Events by Category
            document.add(new Paragraph("Events by Category", subtitleFont));
            PdfPTable categoryTable = new PdfPTable(2);
            categoryTable.setWidthPercentage(100);
            addTableRow(categoryTable, "Category", "Count");
            for (Map.Entry<String, Integer> entry : report.getEventsByCategory().entrySet()) {
                addTableRow(categoryTable, entry.getKey(), String.valueOf(entry.getValue()));
            }
            document.add(categoryTable);
            document.add(Chunk.NEWLINE);

            // Most Requested Skills
            document.add(new Paragraph("Most Requested Skills", subtitleFont));
            for (String skill : report.getMostRequestedSkills()) {
                document.add(new Paragraph("• " + skill, normalFont));
            }
            document.add(Chunk.NEWLINE);

            // Impact Metrics
            document.add(new Paragraph("Impact Metrics", subtitleFont));
            PdfPTable impactTable = new PdfPTable(2);
            impactTable.setWidthPercentage(100);
            for (Map.Entry<String, Double> entry : report.getImpactMetrics().entrySet()) {
                addTableRow(impactTable, entry.getKey(), String.format("%.2f", entry.getValue()));
            }
            document.add(impactTable);
            document.add(Chunk.NEWLINE);

            // Additional Statistics
            document.add(new Paragraph("Additional Statistics", subtitleFont));
            PdfPTable additionalTable = new PdfPTable(2);
            additionalTable.setWidthPercentage(100);
            for (Map.Entry<String, Object> entry : report.getAdditionalStats().entrySet()) {
                addTableRow(additionalTable, entry.getKey(), entry.getValue().toString());
            }
            document.add(additionalTable);

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF report", e);
        }
    }

    private byte[] exportOrganizationReportToExcel(OrganizationReportResponse report) {
        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            
            // Create styles
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle subHeaderStyle = createSubHeaderStyle(workbook);
            CellStyle dataStyle = createDataStyle(workbook);
            CellStyle numberStyle = createNumberStyle(workbook);
            CellStyle dateStyle = createDateStyle(workbook);
            CellStyle percentStyle = createPercentStyle(workbook);

            // Overview Sheet
            Sheet overviewSheet = workbook.createSheet("Overview");
            overviewSheet.setColumnWidth(0, 8000); // Set width for first column
            overviewSheet.setColumnWidth(1, 6000); // Set width for second column
            
            int rowNum = 0;

            // Title
            Row titleRow = overviewSheet.createRow(rowNum++);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("Organization Report");
            titleCell.setCellStyle(headerStyle);
            overviewSheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 1));

            rowNum++; // Empty row

            // Organization Info
            Row orgInfoHeader = overviewSheet.createRow(rowNum++);
            Cell orgInfoCell = orgInfoHeader.createCell(0);
            orgInfoCell.setCellValue("Organization Information");
            orgInfoCell.setCellStyle(subHeaderStyle);
            overviewSheet.addMergedRegion(new CellRangeAddress(rowNum-1, rowNum-1, 0, 1));

            addExcelRow(overviewSheet, rowNum++, "Organization Name", report.getOrganizationName(), dataStyle);
            addExcelRow(overviewSheet, rowNum++, "Report Period", 
                DATE_FORMATTER.format(report.getPeriodStart()) + " to " + 
                DATE_FORMATTER.format(report.getPeriodEnd()), dataStyle);

            rowNum++; // Empty row

            // Key Statistics
            Row statsHeader = overviewSheet.createRow(rowNum++);
            Cell statsCell = statsHeader.createCell(0);
            statsCell.setCellValue("Key Statistics");
            statsCell.setCellStyle(subHeaderStyle);
            overviewSheet.addMergedRegion(new CellRangeAddress(rowNum-1, rowNum-1, 0, 1));

            addExcelRow(overviewSheet, rowNum++, "Total Events Hosted", report.getTotalEventsHosted(), numberStyle);
            addExcelRow(overviewSheet, rowNum++, "Total Volunteers Engaged", report.getTotalVolunteersEngaged(), numberStyle);
            addExcelRow(overviewSheet, rowNum++, "Total Volunteer Hours", report.getTotalVolunteerHours(), numberStyle);
            addExcelRow(overviewSheet, rowNum++, "Average Event Rating", report.getAverageEventRating(), numberStyle);

            // Events by Category Sheet
            Sheet categorySheet = workbook.createSheet("Events by Category");
            categorySheet.setColumnWidth(0, 8000);
            categorySheet.setColumnWidth(1, 4000);
            rowNum = 0;

            // Header
            Row categoryHeader = categorySheet.createRow(rowNum++);
            categoryHeader.createCell(0).setCellValue("Category");
            categoryHeader.createCell(1).setCellValue("Count");
            categoryHeader.getCell(0).setCellStyle(headerStyle);
            categoryHeader.getCell(1).setCellStyle(headerStyle);

            // Data
            for (Map.Entry<String, Integer> entry : report.getEventsByCategory().entrySet()) {
                Row row = categorySheet.createRow(rowNum++);
                row.createCell(0).setCellValue(entry.getKey());
                Cell countCell = row.createCell(1);
                countCell.setCellValue(entry.getValue());
                row.getCell(0).setCellStyle(dataStyle);
                countCell.setCellStyle(numberStyle);
            }

            // Skills Sheet
            Sheet skillsSheet = workbook.createSheet("Skills Analysis");
            skillsSheet.setColumnWidth(0, 8000);
            skillsSheet.setColumnWidth(1, 4000);
            rowNum = 0;

            // Most Requested Skills
            Row skillsHeader = skillsSheet.createRow(rowNum++);
            Cell skillsHeaderCell = skillsHeader.createCell(0);
            skillsHeaderCell.setCellValue("Most Requested Skills");
            skillsHeaderCell.setCellStyle(headerStyle);
            skillsSheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 1));

            rowNum++;
            for (String skill : report.getMostRequestedSkills()) {
                Row row = skillsSheet.createRow(rowNum++);
                row.createCell(0).setCellValue(skill);
                row.getCell(0).setCellStyle(dataStyle);
            }

            // Impact Metrics Sheet
            Sheet impactSheet = workbook.createSheet("Impact Metrics");
            impactSheet.setColumnWidth(0, 8000);
            impactSheet.setColumnWidth(1, 4000);
            rowNum = 0;

            Row impactHeader = impactSheet.createRow(rowNum++);
            impactHeader.createCell(0).setCellValue("Metric");
            impactHeader.createCell(1).setCellValue("Value");
            impactHeader.getCell(0).setCellStyle(headerStyle);
            impactHeader.getCell(1).setCellStyle(headerStyle);

            for (Map.Entry<String, Double> entry : report.getImpactMetrics().entrySet()) {
                Row row = impactSheet.createRow(rowNum++);
                row.createCell(0).setCellValue(entry.getKey());
                Cell valueCell = row.createCell(1);
                valueCell.setCellValue(entry.getValue());
                row.getCell(0).setCellStyle(dataStyle);
                valueCell.setCellStyle(numberStyle);
            }

            workbook.write(baos);
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate Excel report", e);
        }
    }

    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        org.apache.poi.ss.usermodel.Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 12);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        return style;
    }

    private CellStyle createSubHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        org.apache.poi.ss.usermodel.Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 11);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.LEFT);
        return style;
    }

    private CellStyle createDataStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setAlignment(HorizontalAlignment.LEFT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setWrapText(true);
        return style;
    }

    private CellStyle createNumberStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setAlignment(HorizontalAlignment.RIGHT);
        style.setDataFormat(workbook.createDataFormat().getFormat("#,##0"));
        return style;
    }

    private CellStyle createDateStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setDataFormat(workbook.createDataFormat().getFormat("dd-mm-yyyy"));
        return style;
    }

    private CellStyle createPercentStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setAlignment(HorizontalAlignment.RIGHT);
        style.setDataFormat(workbook.createDataFormat().getFormat("0.00%"));
        return style;
    }

    private void addExcelRow(Sheet sheet, int rowNum, String label, Object value, CellStyle style) {
        Row row = sheet.createRow(rowNum);
        row.createCell(0).setCellValue(label);
        Cell valueCell = row.createCell(1);
        
        if (value instanceof Number) {
            valueCell.setCellValue(((Number) value).doubleValue());
        } else if (value instanceof Date) {
            valueCell.setCellValue((Date) value);
        } else {
            valueCell.setCellValue(String.valueOf(value));
        }
        
        valueCell.setCellStyle(style);
    }

    private byte[] exportOrganizationReportToCsv(OrganizationReportResponse report) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            StringBuilder csv = new StringBuilder();

            // Header
            csv.append("Organization Report\n");
            csv.append("Generated on: ").append(DATE_FORMATTER.format(report.getReportGeneratedAt())).append("\n\n");

            // Organization Info
            csv.append("Organization Information\n");
            csv.append("Organization Name,").append(report.getOrganizationName()).append("\n");
            csv.append("Report Period,")
               .append(DATE_FORMATTER.format(report.getPeriodStart()))
               .append(" to ")
               .append(DATE_FORMATTER.format(report.getPeriodEnd()))
               .append("\n\n");

            // Key Statistics
            csv.append("Key Statistics\n");
            csv.append("Total Events Hosted,").append(report.getTotalEventsHosted()).append("\n");
            csv.append("Total Volunteers Engaged,").append(report.getTotalVolunteersEngaged()).append("\n");
            csv.append("Total Volunteer Hours,").append(report.getTotalVolunteerHours()).append("\n");
            csv.append("Average Event Rating,").append(String.format("%.2f", report.getAverageEventRating())).append("\n\n");

            // Events by Category
            csv.append("Events by Category\n");
            csv.append("Category,Count\n");
            for (Map.Entry<String, Integer> entry : report.getEventsByCategory().entrySet()) {
                csv.append(entry.getKey()).append(",").append(entry.getValue()).append("\n");
            }
            csv.append("\n");

            // Most Requested Skills
            csv.append("Most Requested Skills\n");
            for (String skill : report.getMostRequestedSkills()) {
                csv.append(skill).append("\n");
            }
            csv.append("\n");

            // Impact Metrics
            csv.append("Impact Metrics\n");
            csv.append("Metric,Value\n");
            for (Map.Entry<String, Double> entry : report.getImpactMetrics().entrySet()) {
                csv.append(entry.getKey()).append(",").append(String.format("%.2f", entry.getValue())).append("\n");
            }
            csv.append("\n");

            // Additional Statistics
            csv.append("Additional Statistics\n");
            csv.append("Metric,Value\n");
            for (Map.Entry<String, Object> entry : report.getAdditionalStats().entrySet()) {
                csv.append(entry.getKey()).append(",").append(entry.getValue().toString()).append("\n");
            }

            return csv.toString().getBytes();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate CSV report", e);
        }
    }
} 