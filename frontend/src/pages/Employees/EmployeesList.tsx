import {useEffect, useState} from 'react';
import {Button, Input, Popconfirm, Select, Space, Table, Typography} from 'antd';
import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  SearchOutlined
} from '@ant-design/icons';
import type {ColumnsType} from 'antd/es/table';
import {useNavigate} from 'react-router-dom';
import type {Employee} from "types/employee.ts";
import useApiService from "../../services/apiService.ts";
import toast from "react-hot-toast";

const { Title } = Typography;


// Define table columns with correct types
const columns = (
  onDelete: (key: string) => void,
  onNavigate: (employeeId?: string, anchor?: string, editMode?: boolean) => void
): ColumnsType<Employee> => [
  {
    title: 'Full Name',
    dataIndex: ['profile', 'fullName'],
    key: 'profile.fullName',
    sorter: (a, b) => (a.profile?.fullName ?? '').localeCompare(b.profile?.fullName ?? ''),
  },
  {
    title: 'Gender',
    dataIndex: ['profile', 'gender'],
    key: 'profile.gender',
    filters: [
      { text: 'Male', value: 'Male' },
      { text: 'Female', value: 'Female' },
    ],
    onFilter: (value, record) => record.profile.gender === value,
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
    dataIndex: ['profile', 'email'],
    key: 'profile.email',
  },
  {
    title: 'Role',
    dataIndex: ['profile', 'authorities'],
    key: 'profile.authorities',
    render: (authorities: string[] | undefined) => {
      if (!authorities || authorities.length === 0) return '-';
      return authorities.join(', ');
    },
  },
  {
    title: 'Date Joined',
    dataIndex: 'employmentStartDate',
    key: 'employmentStartDate',
  },
  {
    title: 'Events',
    dataIndex: 'attendedEventsCount',
    key: 'attendedEventsCount',
    render: (_count: number, record: Employee) => (
        <Button type="link" onClick={() => onNavigate(record.profile.id, 'events')}>
          {record.participations?.length || 0}
      </Button>
    ),
  },
  {
    title: 'Actions',
    key: 'actions',
    render: (_, record: Employee) => (
        <Space size="small" align="end">
          <Button type="link" icon={<EyeOutlined/>} onClick={() => onNavigate(record.profile.id)}>View</Button>
          <Button type="link" icon={<EditOutlined/>}
                  onClick={() => onNavigate(record.profile.id, undefined, true)}>Edit</Button>
          {<Popconfirm
          title="Are you sure to delete this employee?"
          onConfirm={() => onDelete(record.profile.id)}
          okText="Yes"
          cancelText="No"
        >
          <Button type="link" danger icon={<DeleteOutlined />}>Delete</Button>
          </Popconfirm>}
      </Space>
    ),
  },
];

// Utility function to export employee data as CSV
const exportToCSV = (data: Employee[]) => {
  // Define CSV headers
  const headers = [
    'Gitlab ID',
    'Full Name',
    'Gender',
    'Projects',
    'Location',
    'Email',
    'Roles',
    'Date Joined',
  ];
  // Map data to CSV rows
  const rows = data.map(emp => [
    emp.profile.gitlabUsername,
    emp.profile.fullName,
    emp.profile.gender,
    emp.projects,
    emp.location,
    emp.profile.email,
    emp.profile.authorities,
    emp.employmentStartDate,
  ]);
  // Combine headers and rows
  const csvContent = [headers, ...rows].map(e => e.join(";")).join("\n");
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
  const [data, setData] = useState<Employee[]>([]);
  // State for pagination page size
  const [pageSize, setPageSize] = useState<number>(10);
  // React Router navigation hook
  const navigate = useNavigate();
  const {getEmployees, deleteEmployee} = useApiService();
  // State for project and location filters
  const [projectFilter, setProjectFilter] = useState<string | undefined>(undefined);
  const [locationFilter, setLocationFilter] = useState<string | undefined>(undefined);

  // Get unique projects and locations for filter dropdowns
  const uniqueProjects = Array.from(new Set(data.map(emp => emp.projects))).filter(Boolean);
  const uniqueLocations = Array.from(new Set(data.map(emp => emp.location))).filter(Boolean);

  useEffect(() => {
    (async () => {
      try {
        const data = await getEmployees();
        setData(data!);
      } catch (err) {
        console.error('Failed to fetch employees:', err);
      }
    })();
  }, [getEmployees]);


  // Filter employees by name, employee ID, project, and location
  const filteredData = data.filter(
    (item) =>
        (item.profile.fullName?.toLowerCase().includes(searchText.toLowerCase())) &&
        (!projectFilter || item.projects.find(prj => prj.name === projectFilter)) &&
      (!locationFilter || item.location === locationFilter)
  );

  // Handle delete action
  const handleDelete = async (profileId: string) => {
    try {
      await deleteEmployee(profileId);
      setData(prev => prev.filter(item => item.profile.id !== profileId));
    } catch (err) {
      console.error('Failed to fetch employee:', err);
    }
  };

  // Handle export action
  const handleExport = () => {
    exportToCSV(filteredData);
    toast.success('Exported employee data as CSV');
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
          {/* <Select
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
          </Select>*/}
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
        rowKey={(record) => record.profile.id}
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
