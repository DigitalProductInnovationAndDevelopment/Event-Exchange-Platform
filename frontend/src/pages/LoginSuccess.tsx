import { useLocation, useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';
import useApiService from '../services/apiService';

export const LoginSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const { getOwnProfile } = useApiService();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  useEffect(() => {
    const doLogin = async () => {
      const ownProfile = await getOwnProfile();

      const values = {
        name: ownProfile!.name || '',
        email: ownProfile!.email || '',
        roles: ownProfile!.authorities || [],
      };

      try {
        await login(values);
        message.success('Welcome!');
        navigate(from, { replace: true });
      } catch (err) {
        message.error('Login failed');
        console.error(err);
      }
    };
    doLogin();
  }, [login, navigate, from, isAuthenticated, getOwnProfile]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      Success. Redirecting to the dashboard...
    </div>
  );
};
