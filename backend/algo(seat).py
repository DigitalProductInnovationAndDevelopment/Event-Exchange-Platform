import json
import pandas as pd
from ortools.sat.python import cp_model
from itertools import combinations
import time

#not finished yet, need to be improved, too complex now

def find_valid_footprints(df_employees, df_seats):
    """
    For each employee group, finds all possible sets of connected seats they can occupy.
    This is a critical pre-processing step to reduce the problem's complexity.
    """
    print("Pre-processing: Finding all valid seating footprints for each group...")
    seat_neighbors = {row.chair_id: row.neighbor_list for _, row in df_seats.iterrows()}
    all_seat_ids = set(df_seats['chair_id'])

    footprints_map = []
    for g_idx, group in df_employees.iterrows():
        group_size = group['Anzahl']
        group_footprints = []

        if group_size == 1:
            # A group of 1 can sit in any seat.
            for seat_id in all_seat_ids:
                group_footprints.append({seat_id})
        else:
            # A group of >1 needs a lead seat and N-1 neighbors.
            for lead_seat_id in all_seat_ids:
                # Find neighbors of the lead seat that are also valid seats.
                valid_neighbors = [n for n in seat_neighbors.get(lead_seat_id, []) if n in all_seat_ids]

                if len(valid_neighbors) >= group_size - 1:
                    # Find all combinations of neighbors to complete the group.
                    for combo in combinations(valid_neighbors, group_size - 1):
                        footprint = {lead_seat_id, *combo}
                        group_footprints.append(footprint)

        if not group_footprints:
            # This is a fatal error: a group is too large to be seated anywhere.
            raise ValueError(f"Error: Group '{group.FullName}' (size {group_size}) cannot be seated. "
                             f"No seat has enough neighbors to accommodate them. Please check seat layout or group size.")

        footprints_map.append(group_footprints)
    print("Pre-processing complete.")
    return footprints_map


def assign_seats(employees_data, seats_data, constraints_config, time_limit_sec=120.0):
    """
    Assigns employee groups to specific seats to maximize neighbor diversity.
    """
    if not employees_data:
        print("Warning: The list of employees is empty.")
        return employees_data

    # --- 1. Prepare Data ---
    df_employees = pd.DataFrame(employees_data)
    df_employees['Anzahl'] = pd.to_numeric(df_employees['Anzahl'], errors='coerce').fillna(1).astype(int)
    df_employees['FullName'] = df_employees['Vorname'] + ' ' + df_employees['Nachname']
    num_groups = len(df_employees)

    df_seats = pd.DataFrame(seats_data)
    all_seat_ids = sorted(list(df_seats['chair_id']))
    seat_id_to_idx = {sid: i for i, sid in enumerate(all_seat_ids)}
    num_seats = len(all_seat_ids)

    try:
        footprints_map = find_valid_footprints(df_employees, df_seats)
    except ValueError as e:
        print(e)
        return None

    # --- 2. Create the CP-SAT Model ---
    model = cp_model.CpModel()

    # Create assignment variables: assign[g, p] is true if group g gets its p-th valid footprint.
    assign = {}
    for g_idx in range(num_groups):
        for p_idx in range(len(footprints_map[g_idx])):
            assign[(g_idx, p_idx)] = model.NewBoolVar(f'assign_g{g_idx}_p{p_idx}')

    # --- 3. Add Hard Constraints ---
    # Each group must be assigned to exactly one of its valid footprints.
    for g_idx in range(num_groups):
        model.AddExactlyOne([assign[(g_idx, p_idx)] for p_idx in range(len(footprints_map[g_idx]))])

    # Each seat can be occupied by at most one group.
    for s_id in all_seat_ids:
        occupying_placements = []
        for g_idx in range(num_groups):
            for p_idx, footprint in enumerate(footprints_map[g_idx]):
                if s_id in footprint:
                    occupying_placements.append(assign[(g_idx, p_idx)])
        model.Add(cp_model.LinearExpr.Sum(occupying_placements) <= 1)

    # --- 4. Define Soft Constraints & Objective ---
    print("Building objective function... This may take a moment.")
    objective_terms = []

    # Create helper variables: group_in_seat[g,s] is true if group g occupies seat s.
    group_in_seat = {}
    for g_idx in range(num_groups):
        for s_id in all_seat_ids:
            s_idx = seat_id_to_idx[s_id]
            group_in_seat[(g_idx, s_idx)] = model.NewBoolVar(f'group{g_idx}_in_seat{s_idx}')

            placements_in_seat = [assign[(g_idx, p_idx)] for p_idx, footprint in enumerate(footprints_map[g_idx]) if
                                  s_id in footprint]
            if placements_in_seat:
                # This constraint links the main assignment to the helper variable
                model.Add(group_in_seat[(g_idx, s_idx)] == cp_model.LinearExpr.Sum(placements_in_seat))
            else:
                model.Add(group_in_seat[(g_idx, s_idx)] == 0)

    # Iterate through every pair of neighboring seats to calculate scores
    seat_neighbors_map = {row.chair_id: row.neighbor_list for _, row in df_seats.iterrows()}
    for s1_id in all_seat_ids:
        for s2_id in seat_neighbors_map.get(s1_id, []):
            if s1_id >= s2_id: continue  # Process each edge only once
            s1_idx = seat_id_to_idx[s1_id]
            s2_idx = seat_id_to_idx[s2_id]

            # Iterate through every possible pair of groups that could be neighbors
            for g1_idx in range(num_groups):
                for g2_idx in range(g1_idx, num_groups):

                    # --- REFORMULATION: More efficient modeling for neighbor relationships ---
                    # Create a variable that is true if g1 and g2 are neighbors on this specific edge.
                    are_neighbors_on_edge = model.NewBoolVar(f'neighbors_g{g1_idx}_g{g2_idx}_s{s1_idx}_s{s2_idx}')

                    # Efficiently model: are_neighbors_on_edge = (g1 in s1 AND g2 in s2) OR (g1 in s2 AND g2 in s1)
                    # This avoids the very slow reified constraints used previously.
                    temp_b_1 = model.NewBoolVar('')
                    model.AddBoolAnd([group_in_seat[(g1_idx, s1_idx)], group_in_seat[(g2_idx, s2_idx)]]).OnlyEnforceIf(
                        temp_b_1)
                    model.AddImplication(temp_b_1.Not(), group_in_seat[(g1_idx, s1_idx)].Not())
                    model.AddImplication(temp_b_1.Not(), group_in_seat[(g2_idx, s2_idx)].Not())

                    temp_b_2 = model.NewBoolVar('')
                    model.AddBoolAnd([group_in_seat[(g1_idx, s2_idx)], group_in_seat[(g2_idx, s1_idx)]]).OnlyEnforceIf(
                        temp_b_2)
                    model.AddImplication(temp_b_2.Not(), group_in_seat[(g1_idx, s2_idx)].Not())
                    model.AddImplication(temp_b_2.Not(), group_in_seat[(g2_idx, s1_idx)].Not())

                    model.AddBoolOr([temp_b_1, temp_b_2]).OnlyEnforceIf(are_neighbors_on_edge)
                    model.AddImplication(are_neighbors_on_edge.Not(), temp_b_1.Not())
                    model.AddImplication(are_neighbors_on_edge.Not(), temp_b_2.Not())

                    # Calculate the score for this potential neighborhood
                    score = 0
                    for attr, weight in constraints_config.items():
                        if weight == 0: continue

                        if attr == 'last neighborhood':
                            g1_name = df_employees.loc[g1_idx, 'FullName']
                            g2_name = df_employees.loc[g2_idx, 'FullName']
                            g1_neighbors = df_employees.loc[g1_idx].get('last neighborhood', [])
                            if isinstance(g1_neighbors, list) and g2_name in g1_neighbors:
                                score -= weight  # Penalty for being past neighbors
                        else:  # Standard diversity attributes
                            if g1_idx != g2_idx and df_employees.loc[g1_idx, attr] != df_employees.loc[g2_idx, attr]:
                                score += weight  # Reward for being diverse

                    if score != 0:
                        objective_terms.append(score * are_neighbors_on_edge)

    # --- 5. Solve the Model ---
    if objective_terms:
        model.Maximize(cp_model.LinearExpr.Sum(objective_terms))

    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = float(time_limit_sec)
    print("Solving... This may take a few minutes for complex layouts.")
    start_time = time.time()
    status = solver.Solve(model)
    end_time = time.time()
    print(f"Solver finished in {end_time - start_time:.2f} seconds.")

    # --- 6. Process the Results ---
    if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
        print(f"\nSolution found with status: {solver.StatusName(status)}")
        if objective_terms:
            print(f"Total objective score achieved: {solver.ObjectiveValue()}")

        for g_idx in range(num_groups):
            for p_idx, footprint in enumerate(footprints_map[g_idx]):
                if solver.Value(assign[(g_idx, p_idx)]) == 1:
                    current_event_assignment = sorted(list(footprint))

                    # Ensure 'SeatNr' is a list before appending
                    if not isinstance(employees_data[g_idx].get('SeatNr'), list):
                        employees_data[g_idx]['SeatNr'] = []

                    employees_data[g_idx]['SeatNr'].append(current_event_assignment)
                    break
        return employees_data
    else:
        print(f"\nNo solution found. Solver status: {solver.StatusName(status)}")
        return None


# --- Main Execution Block ---
if __name__ == "__main__":
    EMPLOYEES_JSON_PATH = 'input.json'
    SEATS_JSON_PATH = 'seat.json'
    CONSTRAINTS_JSON_PATH = 'constraints.json'
    OUTPUT_JSON_PATH = 'output_seats.json'
    SOLVER_TIME_LIMIT = 120.0

    print("--- Starting Seat Assignment ---")
    try:
        with open(EMPLOYEES_JSON_PATH, 'r', encoding='utf-8') as f:
            employee_list = json.load(f)
        with open(SEATS_JSON_PATH, 'r', encoding='utf-8') as f:
            seat_list = json.load(f)
        with open(CONSTRAINTS_JSON_PATH, 'r', encoding='utf-8') as f:
            constraints_config = json.load(f)

        assigned_employees = assign_seats(
            employees_data=employee_list,
            seats_data=seat_list,
            constraints_config=constraints_config,
            time_limit_sec=SOLVER_TIME_LIMIT
        )

        if assigned_employees:
            print(f"\nAssignment complete. Saving results to '{OUTPUT_JSON_PATH}'")

            for employee in assigned_employees:
                employee.pop('FullName', None)

            with open(OUTPUT_JSON_PATH, 'w', encoding='utf-8') as f:
                json.dump(assigned_employees, f, ensure_ascii=False, indent=2)

            print("\n--- Assignment Summary ---")
            for emp in assigned_employees:
                latest_assignment = emp.get('SeatNr', [])[-1] if emp.get('SeatNr') else "N/A"
                print(
                    f"  - {emp['Vorname']} {emp['Nachname']} (Group of {emp['Anzahl']}) assigned to seats: {latest_assignment}")
        else:
            print("Could not generate a valid seating arrangement.")

    except FileNotFoundError as e:
        print(f"Error: An input file was not found. Please ensure all JSON files exist.")
        print(f"Details: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

