import type { Employee, ParticipationDetails, Profile } from "types/employee";


interface DietaryCombinationsResult {
  dietaryCombinationsEmployees: Record<string, number>;
  dietaryCombinationsGuests: Record<string, number>;
}


// Utility function to export participation data as CSV
export const exportParticipationToCSV = (data: ParticipationDetails[], eventName: string) => {
  // Sort data alphabetically by last name
  const sortedData = data.sort((a, b) => a.lastName.localeCompare(b.lastName));
  
  // Define CSV headers
  const headers = [
    "Gitlab ID",
    "Name",
    "Last Name",
    "Email",
    "Guest Count",
  ];
  // Map data to CSV rows
  const rows = sortedData.map(emp => [
    emp.gitlabUsername,
    emp.name,
    emp.lastName,
    emp.email,
    emp.guestCount.toString(),
  ]);
  // Combine headers and rows
  const csvContent = [headers, ...rows].map(e => e.join(";")).join("\n");
  // Create a blob and trigger download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${eventName.replace(/\s+/g, "_")}_Participant_List.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Utility function to export a list of Employee objects as CSV
export const exportEmployeesToCSV = (employees: Employee[]) => {
  const headers = ["Name", "Last Name", "Location", "Employment Start Date", "Email", "Gender", "Gitlab Username"];
  const rows = employees.map(emp => [
    emp.profile.name,
    emp.profile.lastName,
    emp.location,
    emp.employmentStartDate,
    emp.profile.email,
    emp.profile.gender,
    emp.profile.gitlabUsername
  ]);
  const csvContent = [headers, ...rows].map(e => e.join(";")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "Full_Employee_List.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Utility function to export dietary preferences as CSV
export const exportDietaryPreferencesToCSV = (dietaryStats: Record<string, number>, eventName: string) => {
  // Sort dietary preferences alphabetically by preference name
  const sortedEntries = Object.entries(dietaryStats).sort(([a], [b]) => a.localeCompare(b));

  // Define CSV headers
  const headers = [
    "Dietary Preference",
    "Count",
  ];
  // Map data to CSV rows
  const rows = sortedEntries.map(([preference, count]) => [
    preference,
    count.toString(),
  ]);
  // Combine headers and rows
  const csvContent = [headers, ...rows].map(e => e.join(";")).join("\n");
  // Create a blob and trigger download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${eventName.replace(/\s+/g, "_")}_Dietary_Preferences.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};


export function prettifyDiet(diets: string[]) {
  return diets.length === 0
    ? "Regular"
    : diets.map(diet =>
      diet
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/(^|\s)\S/g, l => l.toUpperCase()),
    ).join(", ");
}

export function aggregateDietaryCombinations(
  participantProfiles: Profile[],
): DietaryCombinationsResult {
  const comboCountsEmployees: Record<string, number> = {};
  const comboCountsGuests: Record<string, number> = {};

  for (const p of participantProfiles) {
    if (p.dietTypes && p.dietTypes.length > 0) {
      // Sort to ensure consistent key for same combinations
      const comboKey = prettifyDiet(p.dietTypes.slice().sort());
      if (p.isVisitor) {
        comboCountsGuests[comboKey] = (comboCountsGuests[comboKey] || 0) + 1;
      } else {
        comboCountsEmployees[comboKey] = (comboCountsEmployees[comboKey] || 0) + 1;
      }
    } else {
      if (p.isVisitor) {
        comboCountsGuests["None"] = (comboCountsGuests["None"] || 0) + 1;
      } else {
        comboCountsEmployees["None"] = (comboCountsEmployees["None"] || 0) + 1;
      }
    }
  }

  return {
    dietaryCombinationsEmployees: comboCountsEmployees,
    dietaryCombinationsGuests: comboCountsGuests,
  };
}