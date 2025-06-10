import { useState } from 'react';
import { Layout, Menu } from 'antd';
import { 
  DashboardOutlined, 
  CalendarOutlined, 
  TeamOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

const { Content, Footer, Sider } = Layout;

export const AppContainer = () => {
  const [collapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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
        collapsedWidth="0"
        className="bg-white border-r border-gray-200"
        onBreakpoint={(broken) => {
          console.log(broken);
        }}
        onCollapse={(collapsed, type) => {
          console.log(collapsed, type);
        }}
      >
        <div className="h-8 m-4 bg-blue-50 rounded flex items-center justify-center text-blue-600 font-bold">
          {collapsed ? "IEMP" : "Itestra Event Management Platform"}
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[getCurrentMenuKey()]}
          items={menuItems}
          className="border-r-0"
        />
      </Sider>
      <Layout className="flex-1 flex flex-col">
        <Content className="flex-1 p-8 bg-gray-50">
          <Outlet />
        </Content>
        <Footer className="text-center bg-white border-t border-gray-200">
          Itestra Event Management Platform ©{new Date().getFullYear()} Created by Itestra
        </Footer>
      </Layout>
    </Layout>
  );
}; 