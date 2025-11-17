// @ts-nocheck - types will be regenerated after migration
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

export const useAdminCheck = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/');
          return;
        }

        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();

        if (!roles) {
          navigate('/');
          return;
        }

        setIsAdmin(true);
      } catch (error) {
        console.error('Error checking admin role:', error);
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminRole();
  }, [navigate]);

  return { isAdmin, isLoading };
};
