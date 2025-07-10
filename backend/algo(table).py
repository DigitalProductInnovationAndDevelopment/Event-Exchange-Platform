import json
import pandas as pd
from ortools.sat.python import cp_model
import math


def assign_tables(employees_data, tables_data, constraints_config, time_limit_sec=30.0):
    """
    Assigns employee groups to tables to maximize diversity using Google OR-Tools.
    Handles groups of people represented by a single employee record with an "Anzahl" > 1.
    Uses a configuration dictionary for weighted soft constraints.

    Args:
        employees_data (list): A list of dictionaries representing employee groups.
        tables_data (list): A list of dictionaries representing tables.
        constraints_config (dict): A dictionary where keys are attribute names and values are their weights.
        time_limit_sec (float): The maximum time in seconds to let the solver run.

    Returns:
        list: The original list of employee dictionaries, with the 'TableNr' key updated.
    """
    if not employees_data:
        print("Warning: The list of employees is empty. Nothing to assign.")
        return employees_data

    # --- 1. Prepare Data using Pandas ---
    df_employees = pd.DataFrame(employees_data)
    df_employees['Anzahl'] = pd.to_numeric(df_employees['Anzahl'], errors='coerce').fillna(1).astype(int)
    df_employees['FullName'] = df_employees['Vorname'] + ' ' + df_employees['Nachname']
    num_groups = len(df_employees)

    df_tables = pd.DataFrame(tables_data)
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

    assignment = {}
    for g_idx in range(num_groups):
        for t_idx in range(num_tables):
            assignment[(g_idx, t_idx)] = model.NewBoolVar(f'assign_g{g_idx}_t{t_idx}')

    # --- 3. Add Core Constraints ---
    for g_idx in range(num_groups):
        model.AddExactlyOne([assignment[(g_idx, t_idx)] for t_idx in range(num_tables)])

    for t_idx in range(num_tables):
        table_capacity = df_tables.loc[t_idx, 'Capacity']
        groups_at_table = [df_employees.loc[g_idx, 'Anzahl'] * assignment[(g_idx, t_idx)] for g_idx in
                           range(num_groups)]
        model.Add(cp_model.LinearExpr.Sum(groups_at_table) <= table_capacity)

    # --- 4. Define Objective from Constraints Config ---
    objective_terms = []

    # --- 4a. Add a penalty for each table used to encourage filling tables ---
    # This is a low-priority goal.
    for t_idx in range(num_tables):
        is_table_used = model.NewBoolVar(f'table_used_{t_idx}')
        # Link is_table_used to assignments for this table. If any person is assigned, it's used.
        assignments_to_table = [assignment[(g_idx, t_idx)] for g_idx in range(num_groups)]
        model.AddMaxEquality(is_table_used, assignments_to_table)
        # Add a small penalty for using the table.
        objective_terms.append(-1 * is_table_used)

    for attr, weight in constraints_config.items():
        if weight == 0:
            continue  # Skip attributes with a weight of 0

        # --- 4b. Handle the special "last neighborhood" penalty ---
        if attr == 'last neighborhood':
            if 'last neighborhood' not in df_employees.columns:
                print("Warning: 'last neighborhood' requested, but column not found.")
                continue

            print(f"Applying '{attr}' soft constraint with weight: {weight}")
            name_to_idx_map = {name: i for i, name in enumerate(df_employees['FullName'])}
            processed_pairs = set()

            for g_idx, row in df_employees.iterrows():
                last_neighbors_names = row.get('last neighborhood')
                if not isinstance(last_neighbors_names, list):
                    continue

                neighbor_indices = [name_to_idx_map[name] for name in last_neighbors_names if name in name_to_idx_map]

                for neighbor_g_idx in neighbor_indices:
                    pair = tuple(sorted((g_idx, neighbor_g_idx)))
                    if pair in processed_pairs:
                        continue
                    processed_pairs.add(pair)

                    for t_idx in range(num_tables):
                        seated_together = model.NewBoolVar(f'seated_together_g{g_idx}_n{neighbor_g_idx}_t{t_idx}')
                        model.Add(seated_together <= assignment[(g_idx, t_idx)])
                        model.Add(seated_together <= assignment[(neighbor_g_idx, t_idx)])
                        model.Add(
                            seated_together >= assignment[(g_idx, t_idx)] + assignment[(neighbor_g_idx, t_idx)] - 1)
                        # Add to objective as a penalty (negative term)
                        objective_terms.append(-weight * seated_together)

        # --- 4c. Handle standard diversity attributes ---
        else:
            if attr not in df_employees.columns:
                print(f"Warning: Diversity attribute '{attr}' not found. Skipping.")
                continue

            print(f"Applying '{attr}' diversity constraint with weight: {weight}")
            for t_idx in range(num_tables):
                table_id = df_tables.loc[t_idx, 'TableNr']
                for value in df_employees[attr].unique():
                    is_value_present_at_table = model.NewBoolVar(f'attr_{attr}_val_{str(value)}_table_{table_id}')
                    groups_with_value_indices = df_employees[df_employees[attr] == value].index.tolist()
                    assignments_for_value_at_table = [assignment[(g_idx, t_idx)] for g_idx in groups_with_value_indices]

                    if assignments_for_value_at_table:
                        model.AddMaxEquality(is_value_present_at_table, assignments_for_value_at_table)
                    else:
                        model.Add(is_value_present_at_table == 0)

                    # Add to objective as a reward (positive term)
                    objective_terms.append(weight * is_value_present_at_table)

    # --- 5. Set the Combined Objective ---
    if objective_terms:
        model.Maximize(cp_model.LinearExpr.Sum(objective_terms))
    else:
        print("Warning: No objective terms were created.")

    # --- 6. Solve the Model ---
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = float(time_limit_sec)
    status = solver.Solve(model)

    # --- 7. Process the Results ---
    if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
        status_name = 'OPTIMAL' if status == cp_model.OPTIMAL else 'FEASIBLE'
        print(f"\nSolution found with status: {status_name}")
        if objective_terms:
            print(f"Total objective score achieved: {solver.ObjectiveValue()}")

        for g_idx in range(num_groups):
            for t_idx in range(num_tables):
                if solver.Value(assignment[(g_idx, t_idx)]) == 1:
                    assigned_table_id = df_tables.loc[t_idx, 'TableNr']
                    group_size = df_employees.loc[g_idx, 'Anzahl']
                    current_event_assignment = [assigned_table_id] * group_size

                    if not isinstance(employees_data[g_idx].get('TableNr'), list):
                        employees_data[g_idx]['TableNr'] = []

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
    TABLES_JSON_PATH = 'table.json'
    CONSTRAINTS_JSON_PATH = 'constraints.json'
    OUTPUT_JSON_PATH = 'output.json'

    # Set a time limit for the solver
    SOLVER_TIME_LIMIT = 60.0

    print("--- Starting Table Assignment from File ---")
    try:
        with open(EMPLOYEES_JSON_PATH, 'r', encoding='utf-8') as f:
            employee_list = json.load(f)

        with open(TABLES_JSON_PATH, 'r', encoding='utf-8') as f:
            table_list = json.load(f)

        with open(CONSTRAINTS_JSON_PATH, 'r', encoding='utf-8') as f:
            constraints_config = json.load(f)

        assigned_employees = assign_tables(
            employees_data=employee_list,
            tables_data=table_list,
            constraints_config=constraints_config,
            time_limit_sec=SOLVER_TIME_LIMIT
        )

        if assigned_employees and all('TableNr' in r for r in assigned_employees):
            print(f"\nAssignment complete. Saving results to '{OUTPUT_JSON_PATH}'")

            # Clean up data for JSON serialization
            for employee in assigned_employees:
                if 'Anzahl' in employee and pd.notna(employee['Anzahl']):
                    employee['Anzahl'] = int(employee['Anzahl'])
                if 'TableNr' in employee and isinstance(employee['TableNr'], list):
                    employee['TableNr'] = [[int(t) for t in event] for event in employee['TableNr']]
                employee.pop('FullName', None)

            with open(OUTPUT_JSON_PATH, 'w', encoding='utf-8') as f:
                json.dump(assigned_employees, f, ensure_ascii=False, indent=2)

            print("\n--- File-based Assignment Summary ---")
            df_results = pd.DataFrame(assigned_employees)

            if not df_results['TableNr'].empty:
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
            f"Error: An input file was not found. Please ensure '{EMPLOYEES_JSON_PATH}', '{TABLES_JSON_PATH}', and '{CONSTRAINTS_JSON_PATH}' exist.")
        print(f"Details: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
