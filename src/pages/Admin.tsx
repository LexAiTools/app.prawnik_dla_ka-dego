import { useAdminCheck } from '@/hooks/useAdminCheck';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Outlet } from 'react-router-dom';
import { Skeleton } from "@/components/ui/skeleton";

const Admin = () => {
  const { isAdmin, isLoading } = useAdminCheck();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Skeleton className="h-64 w-96" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <main className="flex-1 p-6">
          <div className="mb-4">
            <SidebarTrigger />
          </div>
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Admin;
