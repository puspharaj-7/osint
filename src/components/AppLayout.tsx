import { Outlet } from 'react-router-dom';
import AppSidebar from './AppSidebar';

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-background grid-bg">
      <AppSidebar />
      <main className="ml-64 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
