import React, { useState } from 'react';
import { Table, Input, Button, Space, Typography, Popconfirm, message, Select } from 'antd';
import { SearchOutlined, PlusOutlined, DeleteOutlined, EditOutlined, EyeOutlined, DownloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

// Define the employee data type
interface Employee {
  key: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  gender: string;
  project: string;
  location: string;
  department: string;
  email: string;
  role: string;
  dateJoined: string;
  attendedEventsCount?: number; // Number of events attended
}

// Example employee data structure
const initialData: Employee[] = [
  // You can replace this with real data from API
  {
    key: '1',
    employeeId: 'E001',
    firstName: 'John',
    lastName: 'Doe',
    gender: 'Male',
    project: 'Project Alpha',
    location: 'Germany',
    department: 'Engineering',
    email: 'john.doe@example.com',
    role: 'Developer',
    dateJoined: '2022-01-15',
    attendedEventsCount: 3,
  },
  // ... more data
];

// Define table columns with correct types
const columns = (
  onDelete: (key: string) => void,
  onNavigate: (employeeId?: string, anchor?: string, editMode?: boolean) => void
): ColumnsType<Employee> => [
  {
    title: 'Employee ID',
    dataIndex: 'employeeId',
    key: 'employeeId',
    sorter: (a, b) => a.employeeId.localeCompare(b.employeeId),
  },
  {
    title: 'First Name',
    dataIndex: 'firstName',
    key: 'firstName',
    sorter: (a, b) => a.firstName.localeCompare(b.firstName),
  },
  {
    title: 'Last Name',
    dataIndex: 'lastName',
    key: 'lastName',
    sorter: (a, b) => a.lastName.localeCompare(b.lastName),
  },
  {
    title: 'Gender',
    dataIndex: 'gender',
    key: 'gender',
    filters: [
      { text: 'Male', value: 'Male' },
      { text: 'Female', value: 'Female' },
    ],
    onFilter: (value, record) => record.gender === value,
  },
  {
    title: 'Project',
    dataIndex: 'project',
    key: 'project',
  },
  {
    title: 'Location',
    dataIndex: 'location',
    key: 'location',
  },
  {
    title: 'Department',
    dataIndex: 'department',
    key: 'department',
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
  },
  {
    title: 'Role',
    dataIndex: 'role',
    key: 'role',
  },
  {
    title: 'Date Joined',
    dataIndex: 'dateJoined',
    key: 'dateJoined',
  },
  {
    title: 'Events',
    dataIndex: 'attendedEventsCount',
    key: 'attendedEventsCount',
    render: (count: number, record: Employee) => (
      <Button type="link" onClick={() => onNavigate(record.employeeId, 'events')}>
        {count || 0}
      </Button>
    ),
  },
  {
    title: 'Actions',
    key: 'actions',
    render: (_: any, record: Employee) => (
      <Space size="middle">
        {/* View action navigates to EmployeeDetails page in view mode */}
        <Button type="link" icon={<EyeOutlined />} onClick={() => onNavigate(record.employeeId)}>View</Button>
        {/* Edit action navigates to EmployeeDetails page in edit mode */}
        <Button type="link" icon={<EditOutlined />} onClick={() => onNavigate(record.employeeId, undefined, true)}>Edit</Button>
        {/* Delete action with confirmation, styled in red */}
        <Popconfirm
          title="Are you sure to delete this employee?"
          onConfirm={() => onDelete(record.key)}
          okText="Yes"
          cancelText="No"
        >
          <Button type="link" danger icon={<DeleteOutlined />}>Delete</Button>
        </Popconfirm>
      </Space>
    ),
  },
];

// Utility function to export employee data as CSV
const exportToCSV = (data: Employee[]) => {
  // Define CSV headers
  const headers = [
    'Employee ID',
    'First Name',
    'Last Name',
    'Gender',
    'Project',
    'Location',
    'Department',
    'Email',
    'Role',
    'Date Joined',
  ];
  // Map data to CSV rows
  const rows = data.map(emp => [
    emp.employeeId,
    emp.firstName,
    emp.lastName,
    emp.gender,
    emp.project,
    emp.location,
    emp.department,
    emp.email,
    emp.role,
    emp.dateJoined,
  ]);
  // Combine headers and rows
  const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
  // Create a blob and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'employees.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const EmployeesList = () => {
  // State for search input
  const [searchText, setSearchText] = useState('');
  // State for employee data
  const [data, setData] = useState<Employee[]>(initialData);
  // State for pagination page size
  const [pageSize, setPageSize] = useState<number>(10);
  // React Router navigation hook
  const navigate = useNavigate();

  // State for project and location filters
  const [projectFilter, setProjectFilter] = useState<string | undefined>(undefined);
  const [locationFilter, setLocationFilter] = useState<string | undefined>(undefined);

  // Get unique projects and locations for filter dropdowns
  const uniqueProjects = Array.from(new Set(data.map(emp => emp.project))).filter(Boolean);
  const uniqueLocations = Array.from(new Set(data.map(emp => emp.location))).filter(Boolean);

  // Filter employees by name, employee ID, project, and location
  const filteredData = data.filter(
    (item) =>
      (item.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
        item.lastName.toLowerCase().includes(searchText.toLowerCase()) ||
        item.employeeId.toLowerCase().includes(searchText.toLowerCase())) &&
      (!projectFilter || item.project === projectFilter) &&
      (!locationFilter || item.location === locationFilter)
  );

  // Handle delete action
  const handleDelete = (key: string) => {
    setData(prev => prev.filter(item => item.key !== key));
    message.success('Employee deleted successfully');
  };

  // Handle export action
  const handleExport = () => {
    exportToCSV(filteredData);
    message.success('Exported employee data as CSV');
  };

  // Handle navigation to EmployeeDetails page
  // If employeeId is provided, go to details of that employee; otherwise, go to create page
  const handleNavigate = (employeeId?: string, anchor?: string, editMode?: boolean) => {
    if (employeeId) {
      if (anchor) {
        navigate(`/employees/${employeeId}#${anchor}`);
      } else if (editMode) {
        navigate(`/employees/${employeeId}`, { state: { editMode: true } });
      } else {
        navigate(`/employees/${employeeId}`);
      }
    } else {
      navigate('/employees/new');
    }
  };

  return (
    <div style={{ padding: 24 }}>
      {/* Page Title */}
      <Title level={2}>Employees</Title>
      {/* Top bar: Search, Filters, Add Employee, Export */}
      <div style={{ marginBottom: 16, width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Evenly distribute search and filter controls */}
        <div style={{ display: 'flex', flex: 1, gap: 16, maxWidth: 600 }}>
          {/* Search input for name or employee ID */}
          <Input
            placeholder="Search"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ flex: 1, minWidth: 0 }}
            allowClear
          />
          {/* Project filter dropdown */}
          <Select
            allowClear
            placeholder="Project"
            style={{ flex: 1, minWidth: 0 }}
            value={projectFilter}
            onChange={value => setProjectFilter(value)}
          >
            {uniqueProjects.map(project => (
              <Select.Option key={project} value={project}>
                {project}
              </Select.Option>
            ))}
          </Select>
          {/* Location filter dropdown */}
          <Select
            allowClear
            placeholder="Location"
            style={{ flex: 1, minWidth: 0 }}
            value={locationFilter}
            onChange={value => setLocationFilter(value)}
          >
            {uniqueLocations.map(location => (
              <Select.Option key={location} value={location}>
                {location}
              </Select.Option>
            ))}
          </Select>
        </div>
        {/* Export and Add Employee buttons */}
        <Space>
          <Button icon={<DownloadOutlined />} onClick={handleExport}>
            Export
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleNavigate()}>
            Add Employee
          </Button>
        </Space>
      </div>
      {/* Employee Table */}
      <Table
        columns={columns(handleDelete, handleNavigate)}
        dataSource={filteredData}
        bordered
        rowKey="employeeId"
        pagination={{
          pageSize: pageSize,
          showSizeChanger: true,
          // Set page size options to 10, 20, 50, and All (all = filteredData.length)
          pageSizeOptions: ['10', '20', '50', filteredData.length > 0 ? filteredData.length.toString() : '1000'],
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          onShowSizeChange: (_current, size) => setPageSize(size),
          showQuickJumper: false,
        }}
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
}; 