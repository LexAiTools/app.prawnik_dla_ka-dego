import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';

const LawyerDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLawyer, setIsLawyer] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkLawyerRole = async () => {
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
          .eq('role', 'lawyer')
          .maybeSingle();

        if (!roles) {
          navigate('/dashboard');
          return;
        }

        setIsLawyer(true);
      } catch (error) {
        console.error('Error checking lawyer role:', error);
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    checkLawyerRole();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Skeleton className="h-64 w-96" />
      </div>
    );
  }

  if (!isLawyer) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Panel Prawnika</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="icon">
              <User className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Wyloguj
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Moje Sprawy</CardTitle>
              <CardDescription>Lista aktywnych spraw klientów</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Brak aktywnych spraw</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Kalendarz</CardTitle>
              <CardDescription>Zaplanowane konsultacje</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Brak zaplanowanych konsultacji</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Wiadomości</CardTitle>
              <CardDescription>Chat z klientami</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Brak nowych wiadomości</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default LawyerDashboard;
