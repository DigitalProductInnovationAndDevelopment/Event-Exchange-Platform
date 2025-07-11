import type { ParticipationDetails } from "types/employee";

// Utility function to export employee data as CSV
export const exportToCSV = (data: ParticipationDetails[]) => {
  // Define CSV headers
  const headers = [
    "Gitlab ID",
    "Full Name",
    "Email",
  ];
  // Map data to CSV rows
  const rows = data.map(emp => [
    emp.gitlabUsername,
    emp.fullName,
    emp.email,
  ]);
  // Combine headers and rows
  const csvContent = [headers, ...rows].map(e => e.join(";")).join("\n");
  // Create a blob and trigger download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "employees.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
