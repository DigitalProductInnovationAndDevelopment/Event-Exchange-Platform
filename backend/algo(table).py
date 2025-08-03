import json
import pandas as pd
from ortools.sat.python import cp_model
import math
import sys

def assign_tables(search_workers_count, employees_data, tables_data, constraints_config, time_limit_sec=30.0):
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
    num_groups = len(df_employees)

    df_tables = pd.DataFrame(tables_data)
    df_tables.rename(columns={'table_id': 'TableNr', 'Anzahl': 'Capacity'}, inplace=True)
    num_tables = len(df_tables)

    total_seats_required = df_employees['Anzahl'].sum()
    total_capacity = df_tables['Capacity'].sum()

    print(f"Assigning {num_groups} groups ({total_seats_required} people) to {num_tables} tables with a total capacity of {total_capacity}.")

    if total_seats_required > total_capacity:
        print(f"Error: Not enough capacity ({total_capacity}) for all people ({total_seats_required}).")
        sys.exit(2)

    # Check for feasibility issues
    max_group_size = df_employees['Anzahl'].max()
    max_table_capacity = df_tables['Capacity'].max()
    if max_group_size > max_table_capacity:
        print(f"Error: Largest group ({max_group_size}) exceeds largest table capacity ({max_table_capacity}).")
        sys.exit(3)

    # --- 2. Create the CP-SAT Model ---
    model = cp_model.CpModel()

    assignment = {}
    for g_idx in range(num_groups):
        for t_idx in range(num_tables):
            assignment[(g_idx, t_idx)] = model.NewBoolVar(f'assign_g{g_idx}_t{t_idx}')

    # --- 3. Add Core Constraints ---
    # Each group assigned to exactly one table
    for g_idx in range(num_groups):
        model.AddExactlyOne([assignment[(g_idx, t_idx)] for t_idx in range(num_tables)])

    # Table capacity constraints
    for t_idx in range(num_tables):
        table_capacity = df_tables.loc[t_idx, 'Capacity']
        groups_at_table = [df_employees.loc[g_idx, 'Anzahl'] * assignment[(g_idx, t_idx)] for g_idx in range(num_groups)]
        model.Add(cp_model.LinearExpr.Sum(groups_at_table) <= table_capacity)

    # --- 4. Define Objective from Constraints Config ---
    objective_terms = []

    # Add a penalty for each table used to encourage filling tables
    for t_idx in range(num_tables):
        table_capacity = df_tables.loc[t_idx, 'Capacity']

        # Calculate actual occupancy
        groups_at_table = [df_employees.loc[g_idx, 'Anzahl'] * assignment[(g_idx, t_idx)] for g_idx in range(num_groups)]
        total_seated_at_table = cp_model.LinearExpr.Sum(groups_at_table)

        # Encourage table usage with diminishing returns
        is_table_used = model.NewBoolVar(f'table_used_{t_idx}')
        assignments_to_table = [assignment[(g_idx, t_idx)] for g_idx in range(num_groups)]
        model.AddMaxEquality(is_table_used, assignments_to_table)

        # Add a penalty for each empty seat to encourage fuller tables
        groups_at_table = [df_employees.loc[g_idx, 'Anzahl'] * assignment[(g_idx, t_idx)] for g_idx in range(num_groups)]
        total_seated_at_table = cp_model.LinearExpr.Sum(groups_at_table)
        wasted_space = model.NewIntVar(0, int(table_capacity), f'wasted_space_t{t_idx}')
        model.Add(wasted_space == table_capacity - total_seated_at_table)
        
        objective_terms.append(-0.1 * wasted_space)

    for attr, weight in constraints_config.items():
        if weight == 0:
            continue

        if attr == 'last neighborhood':
            if 'last neighborhood' not in df_employees.columns or 'ProfileID' not in df_employees.columns:
                print("Warning: 'last neighborhood' or 'ProfileID' column not found. Skipping this constraint.")
                continue
                
            print(f"Applying '{attr}' soft constraint with weight: {weight} using ProfileID.")
            # --- CHANGE: Use ProfileID for mapping instead of FullName ---
            profile_id_to_idx_map = {pid: i for i, pid in enumerate(df_employees['ProfileID'])}
            processed_pairs = set()

            for g_idx, row in df_employees.iterrows():
                last_neighbor_ids = row.get('last neighborhood')
                if not isinstance(last_neighbor_ids, list):
                    print(f"last_neighbor_ids is not a list. continue without it.")
                    continue

                # --- CHANGE: Map neighbor ProfileIDs to their group indices ---
                neighbor_indices = [profile_id_to_idx_map[pid] for pid in last_neighbor_ids if pid in profile_id_to_idx_map]
                
                for neighbor_g_idx in neighbor_indices:
                    pair = tuple(sorted((g_idx, neighbor_g_idx)))
                    if pair in processed_pairs:
                        continue
                    processed_pairs.add(pair)

                    # IMPROVED: Softer constraint implementation
                    for t_idx in range(num_tables):
                        seated_together = model.NewBoolVar(f'seated_together_g{g_idx}_n{neighbor_g_idx}_t{t_idx}')
                        model.Add(seated_together <= assignment[(g_idx, t_idx)])
                        model.Add(seated_together <= assignment[(neighbor_g_idx, t_idx)])
                        model.Add(seated_together >= assignment[(g_idx, t_idx)] + assignment[(neighbor_g_idx, t_idx)] - 1)

                        # Use absolute weight value to ensure proper direction
                        objective_terms.append(-abs(weight) * seated_together)

        else:
            # IMPROVED: Diversity constraints with better handling
            if attr not in df_employees.columns:
                print(f"Warning: Diversity attribute '{attr}' not found. Skipping.")
                continue

            # Skip if all values are the same (no diversity possible)
            unique_values = df_employees[attr].dropna().unique()
            if len(unique_values) <= 1:
                print(f"Warning: Attribute '{attr}' has no diversity (only {len(unique_values)} unique values). Skipping.")
                continue

            print(f"Applying '{attr}' diversity constraint with weight: {weight}")

            for t_idx in range(num_tables):
                table_id = df_tables.loc[t_idx, 'TableNr']

                # IMPROVED: Only consider non-null values for diversity
                for value in df_employees[attr].unique():
                    is_value_present_at_table = model.NewBoolVar(f'attr_{attr}_val_{str(value).replace(" ", "_")}_table_{table_id}')
                    groups_with_value_indices = df_employees[df_employees[attr] == value].index.tolist()
                    assignments_for_value_at_table = [assignment[(g_idx, t_idx)] for g_idx in groups_with_value_indices]

                    if assignments_for_value_at_table:
                        model.AddMaxEquality(is_value_present_at_table, assignments_for_value_at_table)
                        objective_terms.append(abs(weight) * is_value_present_at_table)
                    else:
                        model.Add(is_value_present_at_table == 0)

    # --- 5. Set the Combined Objective ---
    if objective_terms:
        model.Maximize(cp_model.LinearExpr.Sum(objective_terms))
        print(f"Created {len(objective_terms)} objective terms")
    else:
        print("Warning: No objective terms were created. Using basic feasibility.")

    # --- 6. IMPROVED: Solve with better parameters ---
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = float(time_limit_sec)
    solver.parameters.num_search_workers = search_workers_count  # We can use multiple cores
    solver.parameters.log_search_progress = True
    solver.parameters.cp_model_presolve = True

    print("Starting solver...")
    status = solver.Solve(model)

    # --- 7. IMPROVED: Better result processing and debugging ---
    print(f"Solver finished with status: {solver.StatusName(status)}")
    print(f"Solver statistics:")
    print(f"  - Conflicts: {solver.NumConflicts()}")
    print(f"  - Branches: {solver.NumBranches()}")
    print(f"  - Wall time: {solver.WallTime():.2f}s")

    if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
        status_name = 'OPTIMAL' if status == cp_model.OPTIMAL else 'FEASIBLE'
        print(f"\nSolution found with status: {status_name}")
        if objective_terms:
            print(f"Total objective score achieved: {solver.ObjectiveValue()}")

        # Assign tables to groups
        for g_idx in range(num_groups):
            for t_idx in range(num_tables):
                if solver.Value(assignment[(g_idx, t_idx)]) == 1:
                    assigned_table_id = df_tables.loc[t_idx, 'TableNr']
                    group_size = df_employees.loc[g_idx, 'Anzahl']

                    current_event_assignment = [str(assigned_table_id)] * group_size
                    employees_data[g_idx]['TableNr'] = current_event_assignment
                    break

        # IMPROVED: Validation of solution
        print("\n--- Solution Validation ---")
        table_occupancy = {}
        for g_idx in range(num_groups):
            for t_idx in range(num_tables):
                if solver.Value(assignment[(g_idx, t_idx)]) == 1:
                    table_id = df_tables.loc[t_idx, 'TableNr']
                    if table_id not in table_occupancy:
                        table_occupancy[table_id] = 0
                    table_occupancy[table_id] += df_employees.loc[g_idx, 'Anzahl']

        for table_id, occupancy in table_occupancy.items():
            table_capacity = df_tables[df_tables['TableNr'] == table_id]['Capacity'].iloc[0]
            print(f"Table {table_id}: {occupancy}/{table_capacity} seats")
            if occupancy > table_capacity:
                print(f"ERROR: Table {table_id} is over capacity!")

        return employees_data

    elif status == cp_model.INFEASIBLE:
        print(f"\nPROBLEM IS INFEASIBLE!")
        print("Debugging information:")
        print(f"Total people to seat: {total_seats_required}")
        print(f"Total capacity: {total_capacity}")
        print(f"Largest group: {max_group_size}")
        print(f"Largest table: {max_table_capacity}")

        # IMPROVED: Try to identify infeasibility source
        print("\nTable capacities vs group sizes:")
        for idx, row in df_tables.iterrows():
            groups_that_fit = sum(1 for _, emp_row in df_employees.iterrows() if emp_row['Anzahl'] <= row['Capacity'])
            print(f"Table {row['TableNr']} (capacity {row['Capacity']}): {groups_that_fit} groups can fit")

        # Try a relaxed version to help debug
        print("\nTrying relaxed model for debugging...")
        relaxed_model = cp_model.CpModel()
        relaxed_assignment = {}

        for g_idx in range(num_groups):
            for t_idx in range(num_tables):
                relaxed_assignment[(g_idx, t_idx)] = relaxed_model.NewBoolVar(f'assign_g{g_idx}_t{t_idx}')

        # Only add basic constraints
        for g_idx in range(num_groups):
            relaxed_model.AddExactlyOne([relaxed_assignment[(g_idx, t_idx)] for t_idx in range(num_tables)])

        # Relaxed capacity constraints (allow slight overflow)
        for t_idx in range(num_tables):
            table_capacity = df_tables.loc[t_idx, 'Capacity']
            groups_at_table = [df_employees.loc[g_idx, 'Anzahl'] * relaxed_assignment[(g_idx, t_idx)] for g_idx in range(num_groups)]
            overflow = relaxed_model.NewIntVar(0, max_group_size, f'overflow_t{t_idx}')
            relaxed_model.Add(cp_model.LinearExpr.Sum(groups_at_table) <= table_capacity + overflow)
            relaxed_model.Minimize(overflow)  # Try to minimize overflow

        relaxed_solver = cp_model.CpSolver()
        relaxed_solver.parameters.max_time_in_seconds = 10.0
        relaxed_status = relaxed_solver.Solve(relaxed_model)

        if relaxed_status in [cp_model.OPTIMAL, cp_model.FEASIBLE]:
            print("Relaxed model found solution - problem likely with soft constraints being too restrictive")
        else:
            print("Even relaxed model failed - fundamental capacity/assignment issue")

        return employees_data
    else:
        status_name = solver.StatusName(status)
        print(f"\nSolver could not find solution. Status: {status_name}")
        if status == cp_model.MODEL_INVALID:
            print("Model is invalid - check constraint definitions")
        elif status == cp_model.UNKNOWN:
            print("Solver timed out or encountered other issues")

        return employees_data

# --- Main Execution Block (unchanged) ---
if __name__ == "__main__":
    if len(sys.argv) != 7:
        print("Usage: python algo.py <input_json_path> <table_json_path> <config_json_path> <output_json_path> <num_search_workers> <solver_time_limit>")
        print(sys.argv)
        sys.exit(1)

    # --- Configuration ---
    # EMPLOYEES_JSON_PATH = 'input.json'
    # TABLES_JSON_PATH = 'table.json'
    # CONSTRAINTS_JSON_PATH = 'constraints.json'
    # OUTPUT_JSON_PATH = 'output.json'
    EMPLOYEES_JSON_PATH = sys.argv[1]
    TABLES_JSON_PATH = sys.argv[2]
    CONSTRAINTS_JSON_PATH = sys.argv[3]
    OUTPUT_JSON_PATH = sys.argv[4]
    num_search_workers = int(sys.argv[5])
    SOLVER_TIME_LIMIT = int(sys.argv[6])

    print("--- Starting Table Assignment from File ---")
    try:
        with open(EMPLOYEES_JSON_PATH, 'r', encoding='utf-8') as f:
            employee_list = json.load(f)

        with open(TABLES_JSON_PATH, 'r', encoding='utf-8') as f:
            table_list = json.load(f)

        with open(CONSTRAINTS_JSON_PATH, 'r', encoding='utf-8') as f:
            constraints_config = json.load(f)

        assigned_employees = assign_tables(
            num_search_workers,
            employees_data=employee_list,
            tables_data=table_list,
            constraints_config=constraints_config,
            time_limit_sec=SOLVER_TIME_LIMIT,
        )

        if assigned_employees and all('TableNr' in r for r in assigned_employees):
            print(f"\nAssignment complete. Saving results to '{OUTPUT_JSON_PATH}'")

            # Clean up data for JSON serialization
            for employee in assigned_employees:
                if 'Anzahl' in employee and pd.notna(employee['Anzahl']):
                    employee['Anzahl'] = int(employee['Anzahl'])

            with open(OUTPUT_JSON_PATH, 'w', encoding='utf-8') as f:
                json.dump(assigned_employees, f, ensure_ascii=False, indent=2)

            print("\n--- File-based Assignment Summary ---")
            df_results = pd.DataFrame(assigned_employees)

            if not df_results['TableNr'].empty:
                df_results['CurrentAssignment'] = df_results['TableNr'].apply(lambda x: x[0] if isinstance(x, list) and x else None)

                print("Seats used per table (Current Event):")
                print(df_results.groupby('CurrentAssignment')['Anzahl'].sum())
                print("\n--- Detailed Results (Current Event) ---")

                # Dynamically build the list of columns to display in the summary
                display_columns = ['Vorname', 'Nachname', 'Anzahl']
                # Add the diversity attributes that are actual columns in the dataframe
                for key in constraints_config.keys():
                    if key in df_results.columns:
                        display_columns.append(key)
                display_columns.append('CurrentAssignment')

                # Ensure no duplicates and all columns exist before printing
                final_display_columns = []
                for col in display_columns:
                    if col not in final_display_columns and col in df_results.columns:
                        final_display_columns.append(col)

                print(df_results[final_display_columns].to_string())
            else:
                print("Could not assign tables. Please check logs for errors.")

    except FileNotFoundError as e:
        print(f"Error: An input file was not found. Please ensure '{EMPLOYEES_JSON_PATH}', '{TABLES_JSON_PATH}', and '{CONSTRAINTS_JSON_PATH}' exist.")
        print(f"Details: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
