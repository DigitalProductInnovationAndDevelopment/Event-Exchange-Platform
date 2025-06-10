import { useState } from 'react';
import { Layout, Menu, Button } from 'antd';
import { 
  DashboardOutlined, 
  CalendarOutlined, 
  TeamOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Breadcrumb } from './Breadcrumb';

const { Content, Footer, Sider, Header } = Layout;

export const AppContainer = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      onClick: () => navigate('/'),
    },
    {
      key: '/events',
      icon: <CalendarOutlined />,
      label: 'Events',
      onClick: () => navigate('/events'),
    },
    {
      key: '/employees',
      icon: <TeamOutlined />,
      label: 'Employees',
      onClick: () => navigate('/employees'),
    },
  ];

  // Get current menu key based on pathname
  const getCurrentMenuKey = () => {
    const pathname = location.pathname;
    if (pathname.startsWith('/events')) return '/events';
    if (pathname.startsWith('/employees')) return '/employees';
    return pathname;
  };

  return (
    <Layout className="h-full w-full flex">
      <Sider
        breakpoint="lg"
        collapsedWidth={80}
        className="bg-[#001529]"
        collapsed={collapsed}
        onBreakpoint={(broken) => {
          console.log(broken);
        }}
        onCollapse={(collapsed, type) => {
          console.log(collapsed, type);
        }}
      >
        <div className="h-8 m-4 rounded flex items-center justify-center text-white font-bold">
          {collapsed ? "EMP" : "Event Management Platform"}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getCurrentMenuKey()]}
          items={menuItems}
          className="border-r-0"
        />
      </Sider>
      <Layout className="flex-1 flex flex-col">
        <Header className="bg-white border-b border-gray-200 px-6 flex items-center justify-between">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-md"
          />
          <Button 
            type="text" 
            icon={<LogoutOutlined />} 
            onClick={handleLogout}
            className="flex items-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-md"
          >
            Logout
          </Button>
        </Header>
        <Content className="flex-1 p-8 bg-gray-50">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <Breadcrumb />
            <Outlet />
          </div>
        </Content>
        <Footer className="text-center bg-white border-t border-gray-200">
          Itestra Event Management Platform ©{new Date().getFullYear()} Created by Itestra
        </Footer>
      </Layout>
    </Layout>
  );
}; 