import { useNavigate } from 'react-router-dom';
import EmployeeForm from './EmployeeForm';
import { Card, Button, message, Typography } from 'antd';

const { Title } = Typography;

export const EmployeeCreate = () => {
  const navigate = useNavigate();

  const handleSave = (values: any) => {
    // Create employee (replace with API call)
    message.success('Employee created successfully');
    navigate('/employees');
  };

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      <Title level={2}>Add Employee</Title>
      <Card>
        <EmployeeForm initialValues={{}} onSave={handleSave} />
      </Card>
      <Button style={{ marginTop: 16 }} onClick={() => navigate(-1)}>Cancel</Button>
    </div>
  );
}; 