import {useEffect, useState} from 'react';
import {Button, Card, Descriptions, Form, Input, Select, Space, Table, Typography, Modal, message} from 'antd';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import {ArrowLeftOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined} from '@ant-design/icons';
import {DietaryPreference, type Employee, Role} from "../../types/employee.ts";
import useApiService from "../../services/apiService.ts";
import {Breadcrumb} from '../../components/Breadcrumb';

const {Title} = Typography;
const {Option} = Select;


// Table columns for attended events
const eventColumns = [
    {
        title: 'Event Name',
        dataIndex: 'eventName',
        key: 'eventName',
    },
    {
        title: 'Date',
        dataIndex: 'eventDate',
        key: 'eventDate',
        render: (_: any, record: any) => {
            return new Date(record.eventDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            })
        }
    },
    {
        title: 'Type',
        dataIndex: 'eventType',
        key: 'eventType',
    },
    {
        title: 'Address',
        dataIndex: 'eventAddress',
        key: 'eventAddress',
    },
    {
        title: 'Guest Count',
        dataIndex: 'guestCount',
        key: 'guestCount',
    },
    {
        title: 'Status',
        dataIndex: 'confirmed',
        key: 'confirmed',
        render: (_: any, record: any) => {
            return record.confirmed ? 'Confirmed' : 'Not Confirmed'
        }
    },
];

export const EmployeeDetails = () => {
    const {employeeId} = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [employee, setEmployee] = useState<Employee | null>(null);
    const {getEmployeeById, createEmployee, updateEmployee, deleteEmployee} = useApiService();
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const isNew = !employeeId || employeeId === 'new';

    const [isEdit, setIsEdit] = useState(
        isNew || (location.state && location.state.editMode) || location.search.includes('edit=true')
    );

    useEffect(() => {
        (async () => {
            try {
                if (!isNew) {
                    const data = await getEmployeeById(employeeId!);
                    setEmployee(data!);
                    form.setFieldsValue(data);
                }
            } catch (err) {
                console.error('Failed to fetch employee:', err);
            }
        })();
    }, [employeeId, getEmployeeById, form, isNew]);


    const basicFields = [
        {label: 'Gitlab Username', value: employee?.profile.gitlabUsername},
        {label: 'Full Name', value: employee?.profile.fullName},
        {label: 'Gender', value: employee?.profile.gender},
        {label: 'Project', value: employee?.projects},
        {label: 'Role', value: employee?.profile.authorities},
        {label: 'Dietary Preferences', value: employee?.profile.dietTypes},
        {label: 'Location', value: employee?.location},
        {label: 'Employment Type', value: employee?.employmentType},
        {label: 'Date Joined', value: employee?.employmentStartDate},
    ];

    const contactFields = [
        {label: 'Email', value: employee?.profile.email},
    ];

    // Scroll to events section if hash is #events
    useEffect(() => {
        if (location.hash === '#events') {
            const el = document.getElementById('events-section');
            if (el) {
                el.scrollIntoView({behavior: 'smooth'});
            }
        }
    }, [location.hash]);

    // Handle back button click
    const handleBack = () => {
        navigate(-1);
    };


    const handleSave = async (values: Employee) => {
        if (isNew) {
            try {
                await createEmployee(values!);
            } catch (error) {
                console.error('Error creating employee:', error);
            }
        } else {
            try {
                await updateEmployee(employeeId, values!);
            } catch (error) {
                console.error('Error updating employee:', error);
            }
        }
        setIsEdit(false);
    };

    // Handle cancel edit
    const handleCancelEdit = () => {
        setIsEdit(false);
    };

    const showDeleteModal = () => {
        setDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await deleteEmployee(employeeId!);
            message.success('Employee deleted successfully');
            navigate('/employees');
        } catch (error) {
            message.error('Failed to delete employee');
            console.error('Error deleting employee:', error);
        } finally {
            setDeleteModalOpen(false);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteModalOpen(false);
    };

    // If editing, show editable form; if viewing, show read-only details
    const renderBasicInfo = () => {
        if (isNew || isEdit) {
            // Editable form for add or edit
            return (
                <Card title="Basic Information" style={{marginBottom: 24}}>
                    <Form form={form} layout="vertical" initialValues={employee || {}} onFinish={handleSave}>
                        {/* Employee ID field for add and edit form, always editable in edit mode */}
                        <Form.Item
                            label="Gitlab Username"
                            name={['profile', 'gitlabUsername']}
                            rules={[{required: true, message: 'Please enter Gitlab Username'}]}
                        >
                            <Input placeholder="Enter Gitlab Username"/>
                        </Form.Item>

                        <Form.Item
                            label="Full Name"
                            name={['profile', 'fullName']}
                            rules={[{required: true, message: 'Please enter full name of the employee'}]}
                        >
                            <Input placeholder="Enter full name of the employee"/>
                        </Form.Item>

                        {/* Gender as a select field */}
                        <Form.Item
                            label="Gender"
                            name={['profile', 'gender']}
                            rules={[{required: true, message: 'Please select gender'}]}
                        >
                            <Select placeholder="Select gender">
                                <Option value="Male">Male</Option>
                                <Option value="Female">Female</Option>
                                <Option value="Diverse">Diverse</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item label="Projects" name="projects">
                            <Input placeholder="Enter project"/>
                        </Form.Item>


                        <Form.Item
                            label="Role"
                            name={['profile', 'authorities']}
                            rules={[{required: false, message: 'Please select at least one role!'}]}
                        >
                            <Select
                                disabled
                                mode="multiple"
                                placeholder="Enter roles"
                                options={Object.entries(Role).map(([key, value]) => ({
                                    label: value,
                                    value: key,
                                }))}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Dietary Preferences"
                            name={['profile', 'dietTypes']}
                            rules={[{required: true, message: 'Please select at least one dietary preference!'}]}
                        >
                            <Select
                                mode="multiple"
                                placeholder="Select dietary preferences"
                                options={Object.entries(DietaryPreference).map(([key, value]) => ({
                                    label: value,
                                    value: key,
                                }))}
                            />
                        </Form.Item>

                        <Form.Item label="Location" name="location">
                            <Input placeholder="Enter location"/>
                        </Form.Item>

                        <Form.Item label="Employment Type" name="employmentType">
                            <Input placeholder="Enter employment type"/>
                        </Form.Item>

                        <Form.Item label="Date Joined" name="employmentStartDate">
                            <Input placeholder="Enter date joined"/>
                        </Form.Item>
                    </Form>
                </Card>
            );
        }
        // View Details Mode
        return (
            <Card title="Basic Information" style={{marginBottom: 24}}>
                <Descriptions column={2} bordered>
                    {basicFields.map(
                        (field) =>
                            field.value && (
                                <Descriptions.Item label={field.label} key={field.label}>
                                    {field.value.toString()}
                                </Descriptions.Item>
                            )
                    )}
                </Descriptions>
            </Card>
        );
    };

    const renderContactInfo = () => {
        if (isNew || isEdit) {
            // Editable form for add or edit
            return (
                <>
                    <Card title="Contact Information" style={{marginBottom: 24}}>
                        <Form form={form} layout="vertical" initialValues={employee || {}} onFinish={handleSave}>
                            <Form.Item label="Email" name={['profile', 'email']}>
                                <Input placeholder="Enter email"/>
                            </Form.Item>
                        </Form>
                    </Card>
                    <div style={{marginBottom: 24, display: 'flex', justifyContent: 'center'}}>
                        <Space>
                            <Button type="primary" onClick={() => form.submit()}>Save</Button>
                            <Button onClick={isNew ? handleBack : handleCancelEdit}>Cancel</Button>
                        </Space>
                    </div>
                </>
            );
        }
        // Read-only details
        return (
            <Card title="Contact Information" style={{marginBottom: 24}}>
                <Descriptions column={1} bordered>
                    {contactFields.map(
                        (field) =>
                            field.value && (
                                <Descriptions.Item label={field.label} key={field.label}>
                                    {field.value}
                                </Descriptions.Item>
                            )
                    )}
                </Descriptions>
            </Card>
        );
    };

    return (
        <div>
            <Breadcrumb
                items={[
                    { path: '/employees', label: 'Employees' },
                    { path: `/employees/${employeeId}`, label: employee?.profile?.fullName || 'Employee Details' }
                ]}
            />
            {/* Back Button at the very top left, above the page title, styled with Ant Design */}
            <div style={{marginBottom: 16}}>
                <Button
                    type="text"
                    icon={<ArrowLeftOutlined/>}
                    onClick={handleBack}
                    style={{paddingLeft: 0}}
                >
                    Back
                </Button>
            </div>
            {/* Page Title */}
            <div className="flex justify-between items-center mb-6">
                <Title level={2} className="m-0">{employee?.profile?.fullName || 'Employee Details'}</Title>
                <Space>
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => navigate(`/employees/${employeeId}/edit`)}
                    >
                        Edit
                    </Button>
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={showDeleteModal}
                    >
                        Delete
                    </Button>
                    <Modal
                        title={
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <ExclamationCircleOutlined style={{ color: '#faad14' }} />
                                Confirm Delete
                            </div>
                        }
                        centered
                        open={deleteModalOpen}
                        onOk={handleDeleteConfirm}
                        onCancel={handleDeleteCancel}
                        okText="Yes, Delete"
                        cancelText="Cancel"
                        okButtonProps={{ danger: true }}
                        width={400}
                    >
                        <p>Are you sure you want to delete this employee?</p>
                        <p style={{ color: '#8c8c8c', fontSize: '14px' }}>This action cannot be undone.</p>
                    </Modal>
                </Space>
            </div>

            {/* Basic Information Section (editable or read-only) */}
            {renderBasicInfo()}

            {/* Contact Information Section (editable or read-only) */}
            {renderContactInfo()}

            {/* Attended Events List Section (only show for view or edit, not for add) */}
            {!isNew && !isEdit && (
                <div id="events-section">
                    <Card title="Attended Events List" style={{marginBottom: 24}}>
                        <Table
                            columns={eventColumns}
                            dataSource={employee?.participations ?? []}
                            bordered
                            rowKey="key"
                            pagination={false}
                        />
                    </Card>
                </div>
            )}
        </div>
    );
};
