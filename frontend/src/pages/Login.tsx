import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Button, Card, message} from 'antd';
import {useAuth} from '../contexts/AuthContext';
import logo from '../assets/itestra_logo.png';

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [, setIsLoading] = useState(false);

  const from = '/login_success';

  const onVisitorLogin = async () => {
    setIsLoading(true);
    const values = { email: '', name: 'Visitor', roles: ['VISITOR'] };
    try {
      await login(values);
      message.success('Welcome!');
      navigate(from, { replace: true });
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-1/5 h-2/5 shadow-lg">
        <div className="flex flex-col items-center space-y-6">
          <img src={logo} alt="Company Logo" className="w-28 h-28 object-contain" />
          <Button
            type="primary"
            className="w-48"
            onClick={() =>
              (window.location.href = 'http://localhost:8000/oauth2/authorization/gitlab')
            }
          >
            Employee Login
          </Button>
          <Button type="default" className="w-48" onClick={() => onVisitorLogin()}>
            Guest Login
          </Button>
        </div>
      </Card>
    </div>
  );
};
