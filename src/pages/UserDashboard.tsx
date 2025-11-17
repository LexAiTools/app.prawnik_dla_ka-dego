import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import Dashboard from './Dashboard';

const UserDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isUser, setIsUser] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/auth');
          return;
        }

        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'user')
          .maybeSingle();

        if (!roles) {
          navigate('/');
          return;
        }

        setIsUser(true);
      } catch (error) {
        console.error('Error checking user role:', error);
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    checkUserRole();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Skeleton className="h-64 w-96" />
      </div>
    );
  }

  if (!isUser) {
    return null;
  }

  return <Dashboard />;
};

export default UserDashboard;
