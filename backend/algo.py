import json
import pandas as pd
from ortools.sat.python import cp_model
import math


def assign_tables(employees_data, tables_data, diversity_attributes, time_limit_sec=30.0):
    """
    Assigns employee groups to tables to maximize diversity using Google OR-Tools.
    Handles groups of people represented by a single employee record with an "Anzahl" > 1.

    Args:
        employees_data (list): A list of dictionaries representing employee groups.
        tables_data (list): A list of dictionaries representing tables, each with 'table_id' and 'Anzahl'.
        diversity_attributes (list): A list of string keys from the employee dictionaries
                                     to use for maximizing diversity.
        time_limit_sec (float): The maximum time in seconds to let the solver run.

    Returns:
        list: The original list of employee dictionaries, with the 'TableNr' key updated.
    """
    if not employees_data:
        print("Warning: The list of employees is empty. Nothing to assign.")
        return employees_data

    # --- 1. Prepare Data using Pandas ---
    df_employees = pd.DataFrame(employees_data)
    # Ensure 'Anzahl' is a valid number, defaulting to 1 if missing or invalid.
    df_employees['Anzahl'] = pd.to_numeric(df_employees['Anzahl'], errors='coerce').fillna(1).astype(int)
    num_groups = len(df_employees)  # Each employee record is now treated as a "group"

    df_tables = pd.DataFrame(tables_data)
    # Rename table columns for clarity and consistency.
    df_tables.rename(columns={'table_id': 'TableNr', 'Anzahl': 'Capacity'}, inplace=True)
    num_tables = len(df_tables)

    total_seats_required = df_employees['Anzahl'].sum()
    total_capacity = df_tables['Capacity'].sum()

    print(
        f"Assigning {num_groups} groups ({total_seats_required} people) to {num_tables} tables with a total capacity of {total_capacity}.")

    if total_seats_required > total_capacity:
        print(f"Error: Not enough capacity ({total_capacity}) for all people ({total_seats_required}).")
        return employees_data

    # --- 2. Create the CP-SAT Model ---
    model = cp_model.CpModel()

    # Create assignment variables: assignment[(g, t)] is true if group g is assigned to table t.
    assignment = {}
    for g_idx in range(num_groups):
        for t_idx in range(num_tables):
            assignment[(g_idx, t_idx)] = model.NewBoolVar(f'assign_g{g_idx}_t{t_idx}')

    # --- 3. Add Core Constraints ---
    # Each group must be assigned to exactly one table.
    for g_idx in range(num_groups):
        model.AddExactlyOne([assignment[(g_idx, t_idx)] for t_idx in range(num_tables)])

    # The total size of all groups at a table cannot exceed its capacity.
    for t_idx in range(num_tables):
        table_capacity = df_tables.loc[t_idx, 'Capacity']
        # Create a list of terms (group_size * assignment_variable) for the sum.
        groups_at_table = []
        for g_idx in range(num_groups):
            group_size = df_employees.loc[g_idx, 'Anzahl']
            groups_at_table.append(group_size * assignment[(g_idx, t_idx)])
        # Add the constraint that the sum of sizes of groups at this table is <= capacity.
        model.Add(cp_model.LinearExpr.Sum(groups_at_table) <= table_capacity)

    # --- 4. Define the Diversity Objective ---
    total_diversity_terms = []
    for t_idx in range(num_tables):
        table_id = df_tables.loc[t_idx, 'TableNr']

        for attr in diversity_attributes:
            if attr not in df_employees.columns:
                print(f"Warning: Diversity attribute '{attr}' not found in employee data. Skipping.")
                continue

            for value in df_employees[attr].unique():
                is_value_present_at_table = model.NewBoolVar(f'attr_{attr}_val_{str(value)}_table_{table_id}')

                # Find all groups that have this attribute value.
                groups_with_value_indices = df_employees[df_employees[attr] == value].index.tolist()

                # Link the boolean variable: is_value_present is true if any group with this value is assigned to this table.
                assignments_for_value_at_table = [assignment[(g_idx, t_idx)] for g_idx in groups_with_value_indices]

                if assignments_for_value_at_table:
                    model.AddMaxEquality(is_value_present_at_table, assignments_for_value_at_table)
                else:
                    model.Add(is_value_present_at_table == 0)

                total_diversity_terms.append(is_value_present_at_table)

    if total_diversity_terms:
        model.Maximize(sum(total_diversity_terms))
    else:
        print("Warning: No diversity terms were created.")

    # --- 5. Solve the Model ---
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = float(time_limit_sec)
    status = solver.Solve(model)

    # --- 6. Process the Results ---
    if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
        status_name = 'OPTIMAL' if status == cp_model.OPTIMAL else 'FEASIBLE'
        print(f"\nSolution found with status: {status_name}")
        if total_diversity_terms:
            print(f"Total diversity score achieved: {solver.ObjectiveValue()}")

        for g_idx in range(num_groups):
            for t_idx in range(num_tables):
                if solver.Value(assignment[(g_idx, t_idx)]) == 1:
                    assigned_table_id = df_tables.loc[t_idx, 'TableNr']
                    group_size = df_employees.loc[g_idx, 'Anzahl']

                    # Create a list representing the seats for THIS event
                    current_event_assignment = [assigned_table_id] * group_size

                    # Ensure 'TableNr' is a list of lists before appending
                    if not isinstance(employees_data[g_idx].get('TableNr'), list):
                        employees_data[g_idx]['TableNr'] = []

                    # Append the new list of seats to the history
                    employees_data[g_idx]['TableNr'].append(current_event_assignment)
                    break
        return employees_data
    else:
        status_name = solver.StatusName(status)
        print(f"\nNo solution found. Solver status: {status_name}")
        return employees_data


# --- Main Execution Block ---
if __name__ == "__main__":
    # --- Configuration ---
    EMPLOYEES_JSON_PATH = 'input.json'

    #example employee input format
    # [
    #     {
    #         "Nachname": "Wende",
    #         "Vorname": "Marzena",
    #         "Standort": "Hannover",
    #         "Zugehörigkeit": "Feb 25",
    #         "Anzahl": 3,
    #         "Anstellung": "Festanstellung",
    #         "Projekt": "A5MW2QI0",
    #         "Geschlecht": "m",
    #         "TableNr": []
    #     },
    #     {
    #         "Nachname": "Hermann",
    #         "Vorname": "Hagen",
    #         "Standort": "Hannover",
    #         "Zugehörigkeit": "Okt 23",
    #         "Anzahl": 1,
    #         "Anstellung": "Festanstellung",
    #         "Projekt": "8E9UMCTK",
    #         "Geschlecht": "m",
    #         "TableNr": []
    #     }]
    TABLES_JSON_PATH = 'table.json'

    # example table input format
    # [
    #     {
    #         "table_id": 1,
    #         "Anzahl": 6
    #     },
    #     {
    #         "table_id": 2,
    #         "Anzahl": 6
    #     },
    # ]
    # OUTPUT_JSON_PATH = 'output.json'

    # Define which employee attributes you want to make diverse
    DIVERSITY_ATTRIBUTES = ['Standort', 'Projekt', 'Anstellung', 'Geschlecht']

    # Set a time limit for the solver
    SOLVER_TIME_LIMIT = 60.0

    print("--- Starting Table Assignment from File ---")
    try:
        with open(EMPLOYEES_JSON_PATH, 'r', encoding='utf-8') as f:
            employee_list = json.load(f)

        with open(TABLES_JSON_PATH, 'r', encoding='utf-8') as f:
            table_list = json.load(f)

        assigned_employees = assign_tables(
            employees_data=employee_list,
            tables_data=table_list,
            diversity_attributes=DIVERSITY_ATTRIBUTES,
            time_limit_sec=SOLVER_TIME_LIMIT
        )

        if assigned_employees and all('TableNr' in r for r in assigned_employees):
            print(f"\nAssignment complete. Saving results to '{OUTPUT_JSON_PATH}'")

            # Convert numpy types to standard Python types for JSON serialization
            for employee in assigned_employees:
                if 'Anzahl' in employee and pd.notna(employee['Anzahl']):
                    employee['Anzahl'] = int(employee['Anzahl'])
                # Convert the nested list of tables to standard integers
                if 'TableNr' in employee and isinstance(employee['TableNr'], list):
                    employee['TableNr'] = [[int(t) for t in event] for event in employee['TableNr']]

            with open(OUTPUT_JSON_PATH, 'w', encoding='utf-8') as f:
                json.dump(assigned_employees, f, ensure_ascii=False, indent=2)

            print("\n--- File-based Assignment Summary ---")
            df_results = pd.DataFrame(assigned_employees)

            if not df_results['TableNr'].empty:
                # Create temporary columns for summary of the latest assignment
                df_results['CurrentAssignmentList'] = df_results['TableNr'].apply(lambda x: x[-1] if x else [])
                df_results['CurrentAssignment'] = df_results['CurrentAssignmentList'].apply(
                    lambda x: x[0] if x else None)

                print("Seats used per table (Current Event):")
                print(df_results.groupby('CurrentAssignment')['Anzahl'].sum())
                print("\n--- Detailed Results (Current Event) ---")
                print(df_results[
                          ['Vorname', 'Nachname', 'Anzahl', 'Standort', 'Projekt', 'CurrentAssignment']].to_string())
            else:
                print("Could not assign tables. Please check logs for errors.")

    except FileNotFoundError as e:
        print(
            f"Error: Input file not found. Please ensure both '{EMPLOYEES_JSON_PATH}' and '{TABLES_JSON_PATH}' exist.")
        print(f"Details: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
