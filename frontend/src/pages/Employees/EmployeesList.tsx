import { useEffect, useMemo, useState } from "react";
import { Button, Card, Col, Input, Modal, Row, Select, Space, Table, Typography } from "utils/antd.tsx";
import {
  DownloadOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  PlusOutlined,
  SearchOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "react-router-dom";
import { type Employee, getFullName, Role } from "types/employee.ts";
import useApiService from "services/apiService.ts";
import toast from "react-hot-toast";
import { Breadcrumb } from "components/Breadcrumb";
import { exportEmployeesToCSV } from "utils/utils.ts";
import { parse } from "papaparse";
import dayjs from "dayjs";

const { Title } = Typography;

function parseDate(dateStr: string) {
  const result = dayjs(dateStr, ["DD.MM.YYYY", "D.MM.YYYY", "DD.M.YYYY", "D.M.YYYY", "YYYY-MM-DD"]).format("YYYY-MM-DD");
  if (result === "Invalid Date") {
    return null;
  } else return result;
}

// Define table columns with correct types
const columns = (
  onNavigate: (employeeId?: string, anchor?: string, editMode?: boolean) => void,
  onDeleteClick: (employeeId: string, employeeName: string) => void
): ColumnsType<Employee> => [
    {
      title: "Name",
      dataIndex: ["profile", "name"],
      key: "profile.name",
      sorter: (a, b) => (a.profile?.name ?? "").localeCompare(b.profile?.name ?? ""),
    },
    {
      title: "Last Name",
      dataIndex: ["profile", "lastName"],
      key: "profile.lastName",
      sorter: (a, b) => (a.profile?.lastName ?? "").localeCompare(b.profile?.lastName ?? ""),
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
    },
    {
      title: "Date Joined",
      dataIndex: "employmentStartDate",
      key: "employmentStartDate",
    },
    {
      title: "Events",
      dataIndex: "attendedEventsCount",
      key: "attendedEventsCount",
      render: (_count: number, record: Employee) => (
        <Button
          type="link"
          style={{ color: "black" }}
          onClick={() => onNavigate(record.profile.id, "events")}
        >
          {record.participationCount}
        </Button>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record: Employee) => (
        <Space size="small" align="end">
          <Button
            type="default"
            icon={<EyeOutlined />}
            onClick={() => onNavigate(record.profile.id)}
            style={{ background: "#fff", border: "1px solid #d9d9d9" }}
          >
            View
          </Button>
          <Button danger type="default" onClick={(e) => {
            e.stopPropagation();
            onDeleteClick(record.profile.id, getFullName(record.profile));
          }}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

function downloadCSV(): void {
  const employees: Employee[] = [
    {
      profile: {
        name: "Alice",
        lastName: "Smith",
        gender: "Female",
        email: "alice.smith@example.com",
        dietTypes: [],
        gitlabUsername: "asmith",
        id: "",
      },
      location: "Munich",
      employmentStartDate: "2023-01-15",
    },
    {
      profile: {
        name: "Bob",
        lastName: "Johnson",
        gender: "Male",
        email: "bob.johnson@example.com",
        dietTypes: [],
        gitlabUsername: "bjohn",
        id: "",
      },
      location: "Berlin",
      employmentStartDate: "2022-09-01",
    },
    {
      profile: {
        name: "Clara",
        lastName: "Lee",
        gender: "Female",
        email: "clara.lee@example.com",
        dietTypes: [],
        gitlabUsername: "clee",
        id: "",
      },
      location: "Munich",
      employmentStartDate: "2024-03-10",
    },
    {
      profile: {
        name: "David",
        lastName: "Brown",
        gender: "Female",
        email: "david.brown@example.com",
        dietTypes: [],
        gitlabUsername: "dbrown",
        id: "",
      },
      location: "Frankfurt",
      employmentStartDate: "2023-11-20",
    },
  ];
  const headers = [
    "Name",
    "Last Name",
    "Location",
    "Employment Start Date",
    "Email",
    "Gender",
    "Gitlab Username"
  ];

  const rows = employees.map(emp => [
    emp.profile.name,
    emp.profile.lastName,
    emp.location,
    emp.employmentStartDate,
    emp.profile.email,
    emp.profile.gender,
    emp.profile.gitlabUsername,
  ]);

  const csvContent = [headers, ...rows].map(e => e.map(val => `${val}`).join(";")).join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "import_employees_example.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export const EmployeesList = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [locationFilter, setLocationFilter] = useState<string | undefined>(undefined);
  const [fetchedEmployees, setEmployees] = useState<Employee[]>([]);
  const { getEmployees, createEmployeeBatch } = useApiService();
  const { deleteEmployee } = useApiService();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<{ id: string; name: string } | null>(null);

  const handleDeleteEmployee = async () => {
    if (!employeeToDelete) return;
    const res = await deleteEmployee(employeeToDelete.id);
    if (res !== undefined) {
      setEmployees(prev => prev.filter(e => e.profile.id !== employeeToDelete.id));
    }
    setDeleteModalOpen(false);
    setEmployeeToDelete(null);
  };

  const handleDeleteClick = (employeeId: string, employeeName: string) => {
    setEmployeeToDelete({ id: employeeId, name: employeeName });
    setDeleteModalOpen(true);
  };

  const [pageSize, setPageSize] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importedRows, setImportedRows] = useState<any[]>([]);
  const [fileInputKey, setFileInputKey] = useState<number>(0);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getEmployees();
        setEmployees(data ?? []);
      } catch (err) {
        console.error("Failed to fetch employees:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [getEmployees]);

  const employees = useMemo(
    () => fetchedEmployees.map(e => ({ ...e, key: e.profile.id })),
    [fetchedEmployees]
  );

  // Get unique locations for filter dropdown
  const uniqueLocations = useMemo(
    () => Array.from(new Set(employees.map(emp => emp.location))).filter(Boolean),
    [employees]
  );

  const ALL_LOCATIONS_VALUE = '__ALL__';

  // Filter employees by name and location
  const filteredData = useMemo(() => {
    return employees.filter(item => {
      const matchesSearch =
        searchText === "" ||
        item.profile.email.toLowerCase().includes(searchText.toLowerCase()) ||
        (getFullName(item.profile)).toLowerCase().includes(searchText.toLowerCase());
      // If locationFilter is undefined, show all locations
      const matchesLocation = locationFilter === undefined || item.location === locationFilter;
      return matchesSearch && matchesLocation;
    });
  }, [employees, searchText, locationFilter]);

  // Handle export action
  const handleExport = () => {
    exportEmployeesToCSV(filteredData);
    toast.success("Exported employee data as CSV");
  };

  // Handle navigation to EmployeeDetails page
  const handleNavigate = (employeeId?: string, anchor?: string, editMode?: boolean) => {
    if (employeeId) {
      if (editMode) {
        navigate(`/employees/${employeeId}/edit`);
      } else {
        navigate(`/employees/${employeeId}${anchor ? `#${anchor}` : ""}`);
      }
    } else {
      navigate("/employees/new");
    }
  };

  // CSV file parsing handler for employee import
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = event => {
        const csv = event.target?.result as string;
        parse(csv, {
          header: true,
          skipEmptyLines: true,
          complete: results => {
            // Validate headers
            const expectedHeaders = ['Name', 'Last Name', 'Location', 'Employment Start Date', 'Email', 'Gender', 'Gitlab Username'];
            const actualHeaders = results.meta.fields || [];
            const hasValidHeaders = expectedHeaders.every(header => 
              actualHeaders.includes(header)
            );
            const hasOnlyExpectedHeaders = actualHeaders.every(header => 
              expectedHeaders.includes(header)
            );

            if (!hasValidHeaders || !hasOnlyExpectedHeaders) {
              toast.error(
                `Invalid CSV format. Expected columns: ${expectedHeaders.join(', ')}. Found: ${actualHeaders.join(', ')}`,
                { duration: 5000 }
              );
              setImportedRows([]);
              return;
            }

            // Expecting columns: name, last name, location, employment start date, email, gender, gitlab username
            const rows = (results.data as any[])
              .map(row => ({
                name: row["Name"]?.trim() || "",
                lastName: row["Last Name"]?.trim() || "",
                location: row["Location"]?.trim() || "",
                startDate: parseDate(row["Employment Start Date"]?.trim() || ""),
                email: row["Email"]?.trim() || "",
                gender: row["Gender"]?.trim() || "",
                gitlabUsername: row["Gitlab Username"]?.trim() || "",
              }))
              .filter(row => row.email);
            setImportedRows(rows);
            console.log(importedRows);
          },
        });
      };
      reader.readAsText(file);
    } else {
      setImportedRows([]);
    }
  };

  // Add All Employees handler for import modal
  const handleAddAllEmployees = async () => {
    if (!importedRows.length) return;
    // Map importedRows to EmployeeCreateDTO-like objects
    const payload = importedRows.map(row => ({
      profile: {
        name: row.name.trim(),
        lastName: row.lastName.trim(),
        gender: row.gender,
        gitlabUsername: row.gitlabUsername.length > 0 ? row.gitlabUsername : null,
        email: row.email,
        authorities: [Role.EMPLOYEE],
      },
      employmentStartDate: row.startDate,
      location: row.location,
    }));
    try {
      setLoading(true);
      const result = await createEmployeeBatch(payload);
      if (result) {
        toast.success(
          `Employees imported successfully! Created: ${result.insertedEmployees.length}, Updated: ${result.updatedEmployees.length}`,
          { duration: 6000 }
        );
        setImportModalOpen(false);
        setImportedRows([]);
        // Force file input to re-render and clear
        setFileInputKey(prev => prev + 1);
        employees.push(...result.insertedEmployees.map(e => ({ ...e, key: e.profile.id })));
        setEmployees([...employees]);
      }
    } catch (err) {
      toast.error("Failed to import employees");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 0 }}>
      <Breadcrumb items={[{ path: "/employees", label: "Employees" }]} />
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>Employees</Title>
        <Space>
          <Button type="primary" icon={<UploadOutlined />} onClick={() => setImportModalOpen(true)}>
            Import / Update Employees
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleNavigate()}>
            Add Employee
          </Button>
        </Space>
      </div>
      <Card className="mb-6">
        <Row gutter={16}>
          <Col span={12}>
            <Input
              placeholder="Search Employee Name or Email"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              allowClear
              style={{ width: "100%" }}
            />
          </Col>
          <Col span={6}>
            <Select
              allowClear
              placeholder="Location"
              style={{ width: "100%" }}
              value={locationFilter === undefined ? ALL_LOCATIONS_VALUE : locationFilter}
              onChange={value => setLocationFilter(value === ALL_LOCATIONS_VALUE ? undefined : value)}
              options={[
                { value: ALL_LOCATIONS_VALUE, label: "All Locations" },
                ...uniqueLocations.map(location => ({ value: location, label: location }))
              ]}
            />
          </Col>
          <Col span={6}>
            <Button icon={<DownloadOutlined />} onClick={handleExport} style={{ width: "100%" }}>
              Export
            </Button>
          </Col>
        </Row>
      </Card>
      <Table
        columns={columns(handleNavigate, handleDeleteClick)}
        dataSource={filteredData}
        onRow={(record: Employee) => {
          return {
            onClick: () => handleNavigate(record.profile.id),
          };
        }}
        bordered={false}
        rowKey={record => record.profile.id}
        loading={loading}
        pagination={{
          pageSize: pageSize,
          showSizeChanger: true,
          pageSizeOptions: [
            "10",
            "20",
            "50",
            filteredData.length > 0 ? filteredData.length.toString() : "1000",
          ],
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          onShowSizeChange: (_current, size) => setPageSize(size),
          showQuickJumper: false,
        }}
        scroll={{ x: "max-content" }}
      />

      <Modal
        width={{
          xs: "90%",
          sm: "80%",
          md: "70%",
          lg: "60%",
          xl: "50%",
          xxl: "40%",
        }}
        style={{
          maxHeight: "70vh",
          overflow: "auto",
        }}
        centered
        title="Import Employees"
        open={importModalOpen}
        onCancel={() => {
          setImportModalOpen(false);
          setImportedRows([]);
          // Force file input to re-render and clear
          setFileInputKey(prev => prev + 1);
        }}
        footer={[
          <Button
            key="addall"
            type="primary"
            disabled={importedRows.length === 0 || loading}
            onClick={handleAddAllEmployees}
          >
            Add All
          </Button>,
        ]}
      >
        <div style={{ marginBottom: 12, color: '#faad14' }}>
          <strong>Disclaimer:</strong> Please provide a CSV file with the columns <code>Name</code>, <code>Last
          Name</code>, <code>Location</code>, <code>Employment Start
          Date</code>, <code>Email</code>, <code>Gender</code>, and <code>Gitlab Username</code>. Note: <code>Gitlab
          Username</code> is optional and can stay empty.
        </div>
        <Button
          style={{ marginBottom: 12 }}
          onClick={downloadCSV}
        >
          Download CSV Template
        </Button>
        <Input key={fileInputKey} type="file" accept=".csv" className="mb-4" onChange={handleImportFile} />
        {importedRows.length > 0 && (
          <Table
            columns={[
              { title: "Name", dataIndex: "name", key: "name" },
              { title: "Last Name", dataIndex: "lastName", key: "lastName" },
              { title: "Location", dataIndex: "location", key: "location" },
              { title: "Email", dataIndex: "email", key: "email" },
            ]}
            dataSource={importedRows.map((row, idx) => ({ ...row, key: idx }))}
            pagination={false}
            className="mt-4"
            loading={loading}
          />
        )}
      </Modal>

      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ExclamationCircleOutlined style={{ color: "#faad14" }} />
            Confirm Delete
          </div>
        }
        centered
        open={deleteModalOpen}
        onOk={handleDeleteEmployee}
        onCancel={() => { setDeleteModalOpen(false); setEmployeeToDelete(null); }}
        okText="Yes, Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
        width={400}
      >
        <p>Are you sure you want to delete this employee{employeeToDelete ? ` (${employeeToDelete.name})` : ""}?</p>
        <p style={{ color: "#8c8c8c", fontSize: "14px" }}>This action cannot be undone.</p>
      </Modal>
    </div>
  );
};
