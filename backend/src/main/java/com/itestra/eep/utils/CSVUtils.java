package com.itestra.eep.utils;

import com.itestra.eep.dtos.EmployeeCreateDTO;
import com.opencsv.CSVParserBuilder;
import com.opencsv.CSVReader;
import com.opencsv.CSVReaderBuilder;
import com.opencsv.exceptions.CsvValidationException;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStreamReader;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;

public class CSVUtils {

    public static List<EmployeeCreateDTO> getEmployeesFromCSV(MultipartFile file) throws Exception {

        List<EmployeeCreateDTO> employeeDTOs = new ArrayList<>();

        try (CSVReader reader = new CSVReaderBuilder(new InputStreamReader(file.getInputStream()))
                .withCSVParser(new CSVParserBuilder().withSeparator(';').build())
                .build()) {
            String[] header = reader.readNext();
            if (header == null) {
                throw new Exception("CSV file is empty or does not have a header.");
            }

            String[] line;
            while ((line = reader.readNext()) != null) {
                if (line.length < 8) {
                    throw new Exception("CSV row is missing fields. Expected at least 8 columns.");
                }

                String name = line[0];
                String lastName = line[1];
                //String address = line[2];
                //LocalDate employmentStartDate = LocalDate.parse(line[3]);
                //EmploymentType employmentType = EmploymentType.valueOf(line[4]);

                EmployeeCreateDTO employeeDTO = new EmployeeCreateDTO(
                        new EmployeeCreateDTO.ProfileCreateDTO(name, lastName, line[6], line[7], null, null),
                        null,
                        null
                );

                employeeDTOs.add(employeeDTO);
            }
        } catch (IOException e) {
            throw new Exception("Failed to read CSV file", e);
        } catch (CsvValidationException e) {
            throw new Exception("Error parsing CSV file", e);
        } catch (IllegalArgumentException e) {
            throw new Exception("Invalid employment type in CSV file", e);
        } catch (DateTimeParseException e) {
            throw new Exception("Invalid date format in CSV file", e);
        }
        return employeeDTOs;
    }

}
