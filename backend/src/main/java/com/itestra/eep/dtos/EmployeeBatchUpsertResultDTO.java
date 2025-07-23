package com.itestra.eep.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.util.List;


@Getter
@Setter
@AllArgsConstructor
public class EmployeeBatchUpsertResultDTO implements Serializable {

    List<EmployeeMinimalDetailsDTO> insertedEmployees;

    List<EmployeeMinimalDetailsDTO> updatedEmployees;

}