# 🎉 Itestra Event-Exchange-Platform

A smart web-based platform for planning and managing internal company events — built to enhance employee networking, streamline event organization, and automate intelligent seat allocation.

---

## 🚀 Overview

The **Event-Exchange-Platform** supports the organization of internal events at **itestra**, helping event managers:

- Plan events efficiently
- Manage employees and guests
- Design seating layouts visually
- Automatically allocate participants to seats using smart matching algorithms
- Avoid repeated pairings across events

---

## ✨ Key Features

- **Dashboard Overview**: Real-time summary of events, participation, and engagement.
- **Event Management**: Create/edit/delete events with support for detailed metadata.
- **Employee Directory**: Import, edit, and manage employees with filtering/export options.
- **Smart Matching Engine**: Apply constraints (e.g., location diversity, gender balance, avoid repeat pairs) to generate optimized seating plans.
- **Drag-and-Drop Seat Layout Designer**: Visually arrange tables and chairs.
- **Export Tools**: Export event data, seating plans, and participant lists as files for logistics or printing.
- **Past Match Memory**: Prevent repeat seatings across multiple events for improved networking.

---

## 🧠 Tech Stack

| Layer        | Technologies Used                             |
|-------------|------------------------------------------------|
| **Frontend** | React, Tailwind CSS, Ant Design, Vite         |
| **Backend**  | Java, Spring Boot, REST API, JPA (Hibernate)  |
| **Database** | PostgreSQL                                    |
| **DevOps**   | Docker, Docker Compose, GitHub Actions        |
| **Auth**     | GitLab OAuth                                  |
| **Testing**  | JUnit, Mockito, Vitest, React Testing Library |

---

## 🛠 Deployment

To run the platform locally or deploy on-premise:

```bash
# Clone the repository
git clone https://github.com/DigitalProductInnovationAndDevelopment/Event-Exchange-Platform.git

# Navigate to project root
cd Event-Exchange-Platform

# Start all services using Docker Compose
docker-compose up --build
```

Ensure you have the appropriate `.env` file configured for environment-specific variables.

---

## 📘 Usage Documentation

Full usage and feature instructions are available in the GitHub Wiki:

👉 **[Access the Usage Documentation](https://github.com/DigitalProductInnovationAndDevelopment/Event-Exchange-Platform/wiki/Usage-Documentation)**

You'll find step-by-step guides on:

- Creating and managing events
- Importing employees
- Designing seating layouts
- Allocating participants
- Exporting seating plans and data

> This documentation is intended for both event organizers and developers contributing to the platform.

---

## 📦 Repository Structure

```
Event-Exchange-Platform/
├── backend/                 # Spring Boot backend
├── frontend/                # React + Tailwind frontend
├── docker-compose.yml       # Service orchestration
├── .env.example             # Sample environment config
└── README.md                # You're here!
```

---

## 👥 Contributors & Stakeholders

- **Event Managers** – Define event structures, goals, and constraints
- **HR/P&O** – Manage participants and configure constraints
- **Developers** – Maintain, improve, and extend the platform
- **System Admins** – Deploy and monitor the containerized app

---

## 📄 License

This project is internal to **itestra** and intended for use within the organization.

---

