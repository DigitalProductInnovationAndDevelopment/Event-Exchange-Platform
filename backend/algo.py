import json
import pandas as pd
from ortools.sat.python import cp_model
import math

# CP-SAT solver (other algo will be implemented in future)
def assign_tables(employees_data, table_capacities, diversity_attributes, time_limit_sec=30.0):
    """
    Assigns employees to tables to maximize diversity using Google OR-Tools.

    Args:
        employees_data (list): A list of dictionaries, where each dictionary represents an employee.
                               Must match the keys in the diversity_attributes.
        table_capacities (list): A list of integers representing the capacity of each table.
        diversity_attributes (list): A list of string keys from the employee dictionaries
                                     to use for maximizing diversity.
        time_limit_sec (float): The maximum time in seconds to let the solver run.

    Returns:
        list: The original list of employee dictionaries, with the 'TableNr' key updated
              with the assigned table number. Returns the original data if no solution is found.
    """
    if not employees_data:
        print("Warning: The list of employees is empty. Nothing to assign.")
        return employees_data

    # --- 1. Prepare Data using Pandas ---
    df_employees = pd.DataFrame(employees_data)
    num_employees = len(df_employees)

    # Create a list of all available table slots
    slots = []
    slot_idx = 0
    for i, capacity in enumerate(table_capacities):
        table_nr = i + 1
        for _ in range(capacity):
            slots.append({'solver_slot_idx': slot_idx, 'TableNr': table_nr})
            slot_idx += 1
    num_slots = len(slots)

    print(f"Assigning {num_employees} employees to {num_slots} slots across {len(table_capacities)} tables.")

    if num_employees > num_slots:
        print(f"Error: Not enough table slots ({num_slots}) for all employees ({num_employees}).")
        return employees_data

    # --- 2. Create the CP-SAT Model ---
    model = cp_model.CpModel()

    # Create assignment variables: assignment[(e, s)] is true if employee e is in slot s.
    assignment = {}
    for e_idx in range(num_employees):
        for s_idx in range(num_slots):
            assignment[(e_idx, s_idx)] = model.NewBoolVar(f'assign_e{e_idx}_s{s_idx}')

    # --- 3. Add Core Constraints ---
    # Each employee must be assigned to exactly one slot.
    for e_idx in range(num_employees):
        model.AddExactlyOne([assignment[(e_idx, s_idx)] for s_idx in range(num_slots)])

    # Each slot can have at most one employee.
    for s_idx in range(num_slots):
        model.AddAtMostOne([assignment[(e_idx, s_idx)] for e_idx in range(num_employees)])

    # --- 4. Define the Diversity Objective ---
    # The goal is to maximize the number of unique attribute values present at each table.
    total_diversity_terms = []
    for table_nr in range(1, len(table_capacities) + 1):
        # Find all slot indices that belong to the current table
        table_slots_indices = [s['solver_slot_idx'] for s in slots if s['TableNr'] == table_nr]
        if not table_slots_indices:
            continue

        # For each diversity attribute (e.g., 'Standort', 'Projekt')
        for attr in diversity_attributes:
            if attr not in df_employees.columns:
                print(f"Warning: Diversity attribute '{attr}' not found in employee data. Skipping.")
                continue

            # For each possible value of that attribute (e.g., 'München', 'Hannover')
            for value in df_employees[attr].unique():
                is_value_present_at_table = model.NewBoolVar(f'attr_{attr}_val_{str(value)}_table_{table_nr}')

                employees_with_value_indices = df_employees[df_employees[attr] == value].index.tolist()

                assignments_for_value_at_table = []
                for e_idx in employees_with_value_indices:
                    for s_idx in table_slots_indices:
                        assignments_for_value_at_table.append(assignment[(e_idx, s_idx)])

                # Use AddMaxEquality to link the boolean variable
                if assignments_for_value_at_table:
                    model.AddMaxEquality(is_value_present_at_table, assignments_for_value_at_table)
                else:
                    model.Add(is_value_present_at_table == 0)

                total_diversity_terms.append(is_value_present_at_table)

    if total_diversity_terms:
        model.Maximize(sum(total_diversity_terms))
    else:
        print("Warning: No diversity terms were created. The solver will find any valid assignment.")

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

        for e_idx in range(num_employees):
            for s_idx in range(num_slots):
                if solver.Value(assignment[(e_idx, s_idx)]) == 1:
                    assigned_table = slots[s_idx]['TableNr']
                    employees_data[e_idx]['TableNr'] = assigned_table
                    break
        return employees_data
    else:
        status_name = solver.StatusName(status)
        print(f"\nNo solution found. Solver status: {status_name}")
        return employees_data


# --- Main Execution Block ---
if __name__ == "__main__":
    # --- Configuration ---------------------------
    #change here for input/output path
    INPUT_JSON_PATH = 'input.json'
    OUTPUT_JSON_PATH = 'output.json'
    # ---------------------------------------------


    # Define the structure of your tables here
    # (this will be input in the future)
    TABLE_CAPACITIES = [4, 4]
    # ---------------------------------------------

    # Define which employee attributes you want to make diverse
    # (this will be input in the future)
    DIVERSITY_ATTRIBUTES = ['Standort', 'Projekt', 'Anstellung', 'Geschlecht']
    # ---------------------------------------------

    # Set a time limit for the solver
    # (this will be input in the future)
    SOLVER_TIME_LIMIT = 60.0
    # ---------------------------------------------


    print("--- Starting Table Assignment from File ---")
    try:
        with open(INPUT_JSON_PATH, 'r', encoding='utf-8') as f:
            employee_list = json.load(f)

        assigned_employees = assign_tables(
            employees_data=employee_list,
            table_capacities=TABLE_CAPACITIES,
            diversity_attributes=DIVERSITY_ATTRIBUTES,
            time_limit_sec=SOLVER_TIME_LIMIT
        )

        if assigned_employees and all('TableNr' in r for r in assigned_employees):
            print(f"\nAssignment complete. Saving results to '{OUTPUT_JSON_PATH}'")
            with open(OUTPUT_JSON_PATH, 'w', encoding='utf-8') as f:
                json.dump(assigned_employees, f, ensure_ascii=False, indent=2)

            print("\n--- File-based Assignment Summary ---")
            df_results = pd.DataFrame(assigned_employees)
            if not df_results['TableNr'].isnull().all():
                print("Employees per table:")
                print(df_results['TableNr'].value_counts().sort_index().to_string())
                print("\n--- Detailed Results ---")
                print(df_results[['Vorname', 'Nachname', 'Standort', 'Projekt', 'TableNr']].to_string())
            else:
                print("Could not assign tables. Please check logs for errors.")

    except FileNotFoundError:
        print(f"Error: Input file not found at '{INPUT_JSON_PATH}'")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
