import json
import pandas as pd
from ortools.sat.python import cp_model
from itertools import combinations
import time
from collections import deque


def find_connected_seat_clusters(df_seats):
    """
    Analyzes the seat layout and finds all disconnected "islands" of seats.
    """
    seat_neighbors = {row.chair_id: set(row.neighbor_list) for _, row in df_seats.iterrows()}
    all_seat_ids = set(df_seats['chair_id'])

    visited = set()
    clusters = []
    for seat_id in all_seat_ids:
        if seat_id not in visited:
            new_cluster = set()
            q = deque([seat_id])
            visited.add(seat_id)
            while q:
                current_seat = q.popleft()
                new_cluster.add(current_seat)
                for neighbor in seat_neighbors.get(current_seat, []):
                    if neighbor in all_seat_ids and neighbor not in visited:
                        visited.add(neighbor)
                        q.append(neighbor)
            clusters.append(new_cluster)
    return clusters


def check_feasibility(df_employees, df_seats):
    """
    Performs a simple greedy check to see if the problem is likely solvable.
    This helps provide better error messages for geometrically impossible layouts.
    """
    print("Performing a quick pre-check for geometric feasibility...")
    clusters = find_connected_seat_clusters(df_seats)
    cluster_sizes = sorted([len(c) for c in clusters], reverse=True)

    groups = df_employees[['FullName', 'Anzahl']].sort_values(by='Anzahl', ascending=False)

    for _, group in groups.iterrows():
        group_size = group['Anzahl']
        placed = False
        # Try to fit this group into an available cluster
        for i, cluster_size in enumerate(cluster_sizes):
            if cluster_size >= group_size:
                cluster_sizes[i] -= group_size  # "Use up" the space
                placed = True
                break

        if not placed:
            # If the largest group cannot fit in the largest remaining cluster, the problem is likely infeasible.
            raise ValueError(f"Error: INFEASIBLE layout. Cannot place group '{group.FullName}' (size {group_size}). "
                             f"The seating layout is too fragmented for the required group sizes. "
                             f"Largest remaining seat cluster has size: {max(cluster_sizes) if cluster_sizes else 0}.")
    print("Pre-check passed. The layout appears to be feasible.")
    return True


def find_valid_footprints(df_employees, df_seats):
    """
    For each employee group, finds all possible sets of connected seats they can occupy.
    """
    print("Pre-processing: Finding all valid seating footprints for each group...")
    seat_neighbors = {row.chair_id: set(row.neighbor_list) for _, row in df_seats.iterrows()}
    all_seat_ids = set(df_seats['chair_id'])

    footprints_map = []
    for g_idx, group in df_employees.iterrows():
        group_size = group['Anzahl']
        group_footprints = set()

        if group_size == 1:
            for seat_id in all_seat_ids:
                group_footprints.add(tuple([seat_id]))
        else:
            for start_seat_id in all_seat_ids:
                q = deque([(start_seat_id, {start_seat_id})])
                visited_clusters = {tuple(sorted({start_seat_id}))}

                while q:
                    _, path = q.popleft()

                    if len(path) == group_size:
                        group_footprints.add(tuple(sorted(list(path))))
                        continue

                    all_neighbors_in_path = set().union(*[seat_neighbors.get(s, set()) for s in path])
                    for neighbor in all_neighbors_in_path:
                        if neighbor not in path:
                            new_path = path | {neighbor}
                            frozen_path = tuple(sorted(list(new_path)))
                            if frozen_path not in visited_clusters:
                                visited_clusters.add(frozen_path)
                                q.append((neighbor, new_path))

        if not group_footprints:
            raise ValueError(f"Error: Group '{group.FullName}' (size {group_size}) cannot be seated. "
                             f"No connected cluster of seats of the required size could be found.")

        footprints_map.append([set(fp) for fp in group_footprints])
        print(
            f"  - Found {len(group_footprints)} potential footprints for group '{group.FullName}' (size {group_size}).")

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

    total_people = df_employees['Anzahl'].sum()
    if total_people > num_seats:
        print(f"Error: INFEASIBLE PROBLEM. Not enough seats for all people.")
        print(f"  - Total people to be seated: {total_people}")
        print(f"  - Total available seats: {num_seats}")
        return None

    try:
        check_feasibility(df_employees, df_seats)
        footprints_map = find_valid_footprints(df_employees, df_seats)
    except ValueError as e:
        print(e)
        return None

    # --- 2. Create the CP-SAT Model ---
    model = cp_model.CpModel()

    assign = {}
    for g_idx in range(num_groups):
        for p_idx in range(len(footprints_map[g_idx])):
            assign[(g_idx, p_idx)] = model.NewBoolVar(f'assign_g{g_idx}_p{p_idx}')

    # --- 3. Add Hard Constraints ---
    for g_idx in range(num_groups):
        model.AddExactlyOne([assign[(g_idx, p_idx)] for p_idx in range(len(footprints_map[g_idx]))])

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

    group_in_seat = {}
    for g_idx in range(num_groups):
        for s_id in all_seat_ids:
            s_idx = seat_id_to_idx[s_id]
            group_in_seat[(g_idx, s_idx)] = model.NewBoolVar(f'group{g_idx}_in_seat{s_idx}')
            placements_in_seat = [assign[(g_idx, p_idx)] for p_idx, footprint in enumerate(footprints_map[g_idx]) if
                                  s_id in footprint]
            if placements_in_seat:
                model.Add(group_in_seat[(g_idx, s_idx)] == cp_model.LinearExpr.Sum(placements_in_seat))
            else:
                model.Add(group_in_seat[(g_idx, s_idx)] == 0)

    seat_neighbors_map = {row.chair_id: row.neighbor_list for _, row in df_seats.iterrows()}
    for s1_id in all_seat_ids:
        for s2_id in seat_neighbors_map.get(s1_id, []):
            if s1_id >= s2_id: continue
            s1_idx, s2_idx = seat_id_to_idx[s1_id], seat_id_to_idx[s2_id]

            for g1_idx in range(num_groups):
                for g2_idx in range(g1_idx, num_groups):
                    are_neighbors_on_edge = model.NewBoolVar(f'neighbors_g{g1_idx}_g{g2_idx}_s{s1_idx}_s{s2_idx}')

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

                    score = 0
                    for attr, weight in constraints_config.items():
                        if weight == 0: continue
                        if attr == 'last neighborhood':
                            g1_name, g2_name = df_employees.loc[g1_idx, 'FullName'], df_employees.loc[
                                g2_idx, 'FullName']
                            g1_neighbors = df_employees.loc[g1_idx].get('last neighborhood', [])
                            if isinstance(g1_neighbors, list) and g2_name in g1_neighbors:
                                score -= weight
                        else:
                            if g1_idx != g2_idx and df_employees.loc[g1_idx, attr] != df_employees.loc[g2_idx, attr]:
                                score += weight

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
    SOLVER_TIME_LIMIT = 1800.0

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
