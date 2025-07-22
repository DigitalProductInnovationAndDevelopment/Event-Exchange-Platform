import type { ParticipationDetails } from "types/employee";
import type { Employee } from "types/employee";

// Utility function to export participation data as CSV
export const exportParticipationToCSV = (data: ParticipationDetails[]) => {
  // Define CSV headers
  const headers = [
    "Gitlab ID",
    "Name",
    "Last Name",
    "Email",
  ];
  // Map data to CSV rows
  const rows = data.map(emp => [
    emp.gitlabUsername,
    emp.name,
    emp.lastName,
    emp.email,
  ]);
  // Combine headers and rows
  const csvContent = [headers, ...rows].map(e => e.join(";")).join("\n");
  // Create a blob and trigger download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "Event_Participations.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Utility function to export a list of Employee objects as CSV
export const exportEmployeesToCSV = (employees: Employee[]) => {
  const headers = [
    "First Name",
    "Last Name",
    "Email",
    "Location",
    "Date Joined",
    "Gender",
    "Gitlab Username"
  ];
  const rows = employees.map(emp => [
    emp.profile.name,
    emp.profile.lastName,
    emp.profile.email,
    emp.location,
    emp.employmentStartDate,
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
