import { useNavigate } from 'react-router-dom';
import EmployeeForm from './EmployeeForm';
import { Card, Button, message, Typography } from 'antd';
import { Breadcrumb } from '../../components/Breadcrumb';
import useApiService from '../../services/apiService';

const { Title } = Typography;

export const EmployeeCreate = () => {
  const navigate = useNavigate();
  const { createEmployee } = useApiService();

  const handleSave = async (values: any) => {
    try {
      await createEmployee(values);
      message.success('Employee created successfully');
      navigate('/employees');
    } catch (error) {
      message.error('Failed to create employee');
      console.error('Error creating employee:', error);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Breadcrumb items={[
        { path: '/employees', label: 'Employees' },
        { path: '/employees/new', label: 'Add Employee' },
      ]} />
      <Title level={2}>Add Employee</Title>
      <Card>
        <EmployeeForm initialValues={{}} onSave={handleSave} />
      </Card>
      <Button style={{ marginTop: 16 }} onClick={() => navigate(-1)}>Cancel</Button>
    </div>
  );
}; 