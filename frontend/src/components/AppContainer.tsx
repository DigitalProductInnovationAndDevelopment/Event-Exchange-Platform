import {Avatar, Dropdown, Layout, Menu} from 'antd';
import {Outlet, useLocation, useNavigate} from 'react-router-dom';
import {CalendarOutlined, DashboardOutlined, LogoutOutlined, TeamOutlined, UserOutlined,} from '@ant-design/icons';
import {useAuth} from '../contexts/AuthContext';
import useApiService from '../services/apiService.ts';
import {useState} from "react";
import itestraEventLogo from '../assets/itestra_event_logo.png';

const { Header, Sider, Content, Footer } = Layout;

export const AppContainer = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { logoutRequest } = useApiService();
  const [collapsed, setCollapsed] = useState(false);

  const mainMenuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/events',
      icon: <CalendarOutlined />,
      label: 'Events',
    },
    {
      key: '/employees',
      icon: <TeamOutlined />,
      label: 'Employees',
    },
  ];

  const handleMenuClick = (key: string) => {
    if (key === 'logout') {
      logoutRequest().then(() => logout());
    } else {
      navigate(key);
    }
  };

  const userMenuItems = [
    {
      key: '/profile',
      icon: <UserOutlined />,
      label: 'Profile Settings',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
    },
  ];

  // Get the base path for menu selection
  const getBasePath = (path: string) => {
    const segments = path.split('/');
    return `/${segments[1]}`;
  };

  return (
    <Layout className="min-h-screen">
      <Sider theme="dark" className="fixed h-full z-10" breakpoint="lg" collapsedWidth="0"
             onCollapse={(value) => setCollapsed(value)} onBreakpoint={(broken) => setCollapsed(broken)}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 100, marginTop: 16, marginBottom: 4 }}>
          <img
            src={itestraEventLogo}
            alt="itestra event planning logo"
            style={{ height: '64px' }}
          />
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getBasePath(location.pathname)]}
          items={mainMenuItems}
          onClick={({ key }) => handleMenuClick(key)}
        />
      </Sider>
      <Layout className="flex flex-col min-h-screen"
              style={{
                marginLeft: collapsed ? 0 : 200,
              }}>
        <Header className="bg-white px-6 flex items-center justify-between shadow-sm">
          <Dropdown
            menu={{
              items: userMenuItems,
              onClick: ({ key }) => handleMenuClick(key),
            }}
            placement="bottomRight"
          >
            <div className="flex items-center cursor-pointer">
              <Avatar icon={<UserOutlined />} className="bg-blue-500" />
              <span className="ml-2">{user?.name || user?.email || 'User'}</span>
            </div>
          </Dropdown>
        </Header>
        <Content className="bg-gray-50 flex-1 overflow-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </Content>
        <Footer className="text-center bg-white border-t border-gray-200">
          Event Exchange Platform ©{new Date().getFullYear()}
        </Footer>
      </Layout>
    </Layout>
  );
};
