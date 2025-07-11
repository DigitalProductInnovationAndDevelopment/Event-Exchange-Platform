import { useEffect, useMemo, useState } from "react";
import { Button, Card, Col, Input, Modal, Row, Select, Space, Table, Typography } from "antd";
import {
  DownloadOutlined,
  EyeOutlined,
  PlusOutlined,
  SearchOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "react-router-dom";
import type { Employee } from "types/employee.ts";
import useApiService from "services/apiService.ts";
import toast from "react-hot-toast";
import { Breadcrumb } from "components/Breadcrumb";
import { EmployeeTypeTag } from "components/EmployeeTypeTag.tsx";
import { exportToCSV } from "../../utils/utils";
import { parse } from "papaparse";
import { Role } from "../../types/employee";

const { Title } = Typography;

// Define table columns with correct types
const columns = (
  onNavigate: (employeeId?: string, anchor?: string, editMode?: boolean) => void
): ColumnsType<Employee> => [
  {
    title: "Full Name",
    dataIndex: ["profile", "fullName"],
    key: "profile.fullName",
    sorter: (a, b) => (a.profile?.fullName ?? "").localeCompare(b.profile?.fullName ?? ""),
  },
  {
    title: "Email",
    dataIndex: ["profile", "email"],
    key: "profile.email",
  },
  {
    title: "Location",
    dataIndex: "location",
    key: "location",
  },
  {
    title: "Employment Type",
    dataIndex: "employmentType",
    key: "employmentType",
    render: (type: string) => <EmployeeTypeTag type={type} />,
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
        {record.participations?.length || 0}
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
      </Space>
    ),
  },
];

function downloadCSV(): void {
  const employees: Employee[] = [
    {
      profile: {
        fullName: "Alice Smith",
        gender: "Female",
        gitlabUsername: "asmith",
        email: "alice.smith@example.com",
        dietTypes: [],
        id: "",
      },
      location: "Munich",
      employmentStartDate: "2023-01-15",
      employmentType: "FULLTIME",
      projects: [],
    },
    {
      profile: {
        fullName: "Bob Johnson",
        gender: "Male",
        gitlabUsername: "bjohnson",
        email: "bob.johnson@example.com",
        dietTypes: [],
        id: "",
      },
      location: "Berlin",
      employmentStartDate: "2022-09-01",
      employmentType: "PARTTIME",
      projects: [],
    },
    {
      profile: {
        fullName: "Clara Lee",
        gender: "Female",
        gitlabUsername: "clee",
        email: "clara.lee@example.com",
        dietTypes: [],
        id: "",
      },
      location: "Munich",
      employmentStartDate: "2024-03-10",
      employmentType: "WORKING_STUDENT",
      projects: [],
    },
    {
      profile: {
        fullName: "David Brown",
        gender: "Female",
        gitlabUsername: "dbrown",
        email: "david.brown@example.com",
        dietTypes: [],
        id: "",
      },
      location: "Frankfurt",
      employmentStartDate: "2023-11-20",
      employmentType: "THESIS",
      projects: [],
    },
  ];
  const headers = [
    "Name",
    "Last Name",
    "Location",
    "Employment Start Date",
    "Employment Type",
    "Email",
    "Gender",
    "Gitlab Username",
  ];

  const rows = employees.map(emp => [
    emp.profile.fullName.split(" ")[0],
    emp.profile.fullName.split(" ")[1],
    emp.location,
    emp.employmentStartDate,
    emp.employmentType,
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
  const [pageSize, setPageSize] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importedRows, setImportedRows] = useState<any[]>([]);

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

  // Filter employees by name and location
  const filteredData = useMemo(() => {
    return employees.filter(item => {
      const matchesSearch =
        searchText === "" ||
        item.profile.fullName?.toLowerCase().includes(searchText.toLowerCase());
      const matchesLocation = !locationFilter || item.location === locationFilter;
      return matchesSearch && matchesLocation;
    });
  }, [employees, searchText, locationFilter]);

  // Handle export action
  const handleImportEmployeeTemplate = () => {
    downloadCSV();
    toast.success("Downloaded employee import template .csv");
  };

  // Handle export action
  const handleExport = () => {
    exportToCSV(filteredData);
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
    setImportFile(file || null);
    if (file) {
      const reader = new FileReader();
      reader.onload = event => {
        const csv = event.target?.result as string;
        parse(csv, {
          header: true,
          skipEmptyLines: true,
          complete: results => {
            // Expecting columns: name, last name, location, employment start date, employment type, email, gender, gitlab username
            const rows = (results.data as any[])
              .map(row => ({
                name: row["Name"]?.trim() || "",
                lastName: row["Last Name"]?.trim() || "",
                location: row["Location"]?.trim() || "",
                startDate: row["Employment Start Date"]?.trim() || "",
                employmentType: row["Employment Type"]?.trim() || "",
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
        id: "", // Required by Employee/Profile type, will be ignored by backend
        fullName: `${row.name} ${row.lastName}`.trim(),
        gender: row.gender,
        gitlabUsername: row.gitlabUsername,
        email: row.email,
        dietTypes: [], // Could be extended to parse from CSV
        authorities: [Role.EMPLOYEE],
      },
      employmentStartDate: row.startDate, // Should be ISO string or yyyy-mm-dd
      employmentType: row.employmentType,
      location: row.location,
      projects: [],
    }));
    try {
      const result = await createEmployeeBatch(payload);
      if (result) {
        toast.success("Employees imported successfully!");
        setImportModalOpen(false);
        setImportFile(null);
        setImportedRows([]);
        employees.push(...result.map(e => ({ ...e, key: e.profile.id })));
        setEmployees([...employees]);
      }
    } catch (err) {
      toast.error("Failed to import employees");
    }
  };

  return (
    <div style={{ padding: 0 }}>
      <Breadcrumb items={[{ path: "/employees", label: "Employees" }]} />
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>Employees</Title>
        <Space>
          <Button type="primary" icon={<UploadOutlined />} onClick={() => setImportModalOpen(true)}>
            Import Employees
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleNavigate()}>
            Add Employee
          </Button>
        </Space>
      </div>
      <Card className="mb-6">
        <Row gutter={16}>
          <Col span={8}>
            <Input
              placeholder="Search Employee Name or ID"
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
              value={locationFilter}
              onChange={value => setLocationFilter(value)}
              options={uniqueLocations.map(location => ({ value: location, label: location }))}
            />
          </Col>
          <Col span={6}>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleImportEmployeeTemplate}
              style={{ width: "100%" }}
            >
              Download Import Template
            </Button>
          </Col>
          <Col span={4}>
            <Button icon={<DownloadOutlined />} onClick={handleExport} style={{ width: "100%" }}>
              Export
            </Button>
          </Col>
        </Row>
      </Card>
      <Table
        columns={columns(handleNavigate)}
        dataSource={filteredData}
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
          setImportFile(null);
          setImportedRows([]);
        }}
        footer={[
          <Button
            key="addall"
            type="primary"
            disabled={importedRows.length === 0}
            onClick={handleAddAllEmployees}
          >
            Add All
          </Button>,
        ]}
      >
        <Input type="file" accept=".csv" className="mb-4" onChange={handleImportFile} />
        {importFile && <div className="mt-2 text-green-600">Selected file: {importFile.name}</div>}
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
          />
        )}
      </Modal>
    </div>
  );
};
