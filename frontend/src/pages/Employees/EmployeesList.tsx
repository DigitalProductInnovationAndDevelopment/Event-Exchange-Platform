import {useEffect, useMemo, useState} from 'react';
import {Button, Input, Popconfirm, Select, Space, Table, Typography, Card, Row, Col} from 'antd';
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
import { Breadcrumb } from '../../components/Breadcrumb';

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
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [locationFilter, setLocationFilter] = useState<string | undefined>(undefined);
  const [fetchedEmployees, setEmployees] = useState<Employee[]>([]);
  const { getEmployees, deleteEmployee } = useApiService();
  const [pageSize, setPageSize] = useState<number>(10);

  useEffect(() => {
    (async () => {
      try {
        const data = await getEmployees();
        setEmployees(data ?? []);
      } catch (err) {
        console.error('Failed to fetch employees:', err);
      }
    })();
  }, [getEmployees]);

  const employees = useMemo(() => fetchedEmployees.map(e => ({ ...e, key: e.profile.id })), [fetchedEmployees]);

  // Get unique locations for filter dropdown
  const uniqueLocations = useMemo(() => Array.from(new Set(employees.map(emp => emp.location))).filter(Boolean), [employees]);

  // Filter employees by name and location
  const filteredData = useMemo(() => {
    return employees.filter(item => {
      const matchesSearch =
        searchText === '' ||
        item.profile.fullName?.toLowerCase().includes(searchText.toLowerCase());
      const matchesLocation = !locationFilter || item.location === locationFilter;
      return matchesSearch && matchesLocation;
    });
  }, [employees, searchText, locationFilter]);

  // Handle delete action
  const handleDelete = async (profileId: string) => {
    try {
      await deleteEmployee(profileId);
      setEmployees(prev => prev.filter(item => item.profile.id !== profileId));
    } catch (err) {
      console.error('Failed to delete employee:', err);
    }
  };

  // Handle export action
  const handleExport = () => {
    exportToCSV(filteredData);
    toast.success('Exported employee data as CSV');
  };

  // Handle navigation to EmployeeDetails page
  const handleNavigate = (employeeId?: string, anchor?: string, editMode?: boolean) => {
    if (employeeId) {
      if (editMode) {
        navigate(`/employees/${employeeId}/edit`);
      } else {
        navigate(`/employees/${employeeId}${anchor ? `#${anchor}` : ''}`);
      }
    } else {
      navigate('/employees/new');
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Breadcrumb items={[{ path: '/employees', label: 'Employees' }]} />
      <div className="flex justify-between items-center mb-6">
        <Title level={2} className="m-0">Employees</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleNavigate()}>
          Add Employee
        </Button>
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
            />
          </Col>
          <Col span={8}>
            <Select
              allowClear
              placeholder="Location"
              style={{ width: '100%' }}
              value={locationFilter}
              onChange={value => setLocationFilter(value)}
              options={uniqueLocations.map(location => ({ value: location, label: location }))}
            />
          </Col>
          <Col span={8}>
            <Button icon={<DownloadOutlined />} onClick={handleExport} style={{ width: '100%' }}>
              Export
            </Button>
          </Col>
        </Row>
      </Card>
      <Table
        columns={columns(handleDelete, handleNavigate)}
        dataSource={filteredData}
        bordered
        rowKey={(record) => record.profile.id}
        pagination={{
          pageSize: pageSize,
          showSizeChanger: true,
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
