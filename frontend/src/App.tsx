import {RouterProvider} from 'react-router-dom';
import {ConfigProvider} from 'antd';
import {AuthProvider} from './contexts/AuthContext';
import {router} from './routes/routes';
import {Toaster} from "react-hot-toast";

function App() {
  return (
    <ConfigProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
        <Toaster position="top-right"/>
    </ConfigProvider>
  );
}

export default App;
