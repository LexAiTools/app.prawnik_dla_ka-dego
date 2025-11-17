// @ts-nocheck - types will be regenerated after migration
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

export const UsersView = () => {
  const queryClient = useQueryClient();
  
  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, phone_number, email, token_balance, created_at')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: documentsCount } = useQuery({
    queryKey: ['admin-documents-count'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('user_id, id');
      
      if (error) throw error;
      
      const countByUser = data.reduce((acc: any, doc: any) => {
        if (doc.user_id) {
          acc[doc.user_id] = (acc[doc.user_id] || 0) + 1;
        }
        return acc;
      }, {});
      
      return countByUser;
    },
  });

  const { data: questionsCount } = useQuery({
    queryKey: ['admin-questions-count'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('questions')
        .select('user_id, id');
      
      if (error) throw error;
      
      const countByUser = data.reduce((acc: any, q: any) => {
        if (q.user_id) {
          acc[q.user_id] = (acc[q.user_id] || 0) + 1;
        }
        return acc;
      }, {});
      
      return countByUser;
    },
  });

  const { data: userRoles } = useQuery({
    queryKey: ['admin-user-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('user_id, role');
      
      if (error) throw error;
      
      const rolesByUser = data.reduce((acc: any, ur: any) => {
        if (ur.user_id) {
          if (!acc[ur.user_id]) acc[ur.user_id] = [];
          acc[ur.user_id].push(ur.role);
        }
        return acc;
      }, {});
      
      return rolesByUser;
    },
  });

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'lawyer': return 'default';
      case 'moderator': return 'secondary';
      case 'user': return 'outline';
      default: return 'outline';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'lawyer': return 'Prawnik';
      case 'moderator': return 'Moderator';
      case 'user': return 'Użytkownik';
      default: return role;
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      // Usuń wszystkie obecne role użytkownika
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);
      
      // Dodaj nową rolę
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: newRole });
      
      if (error) throw error;
      
      toast({
        title: "Rola zaktualizowana",
        description: `Nowa rola: ${getRoleLabel(newRole)}`,
      });
      
      // Odśwież dane
      queryClient.invalidateQueries({ queryKey: ['admin-user-roles'] });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Błąd aktualizacji roli",
        description: error.message,
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Użytkownicy</CardTitle>
          <CardDescription>Zarządzaj użytkownikami systemu</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Użytkownicy ({users?.length || 0})</CardTitle>
        <CardDescription>Zarządzaj użytkownikami systemu</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Numer telefonu</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Saldo tokenów</TableHead>
              <TableHead>Dokumenty</TableHead>
              <TableHead>Pytania</TableHead>
              <TableHead>Data rejestracji</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.phone_number || '-'}</TableCell>
                <TableCell>{user.email || '-'}</TableCell>
                <TableCell>
                  <Select
                    value={userRoles?.[user.id]?.[0] || 'user'}
                    onValueChange={(value) => handleRoleChange(user.id, value)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Wybierz rolę" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">👤 Użytkownik</SelectItem>
                      <SelectItem value="lawyer">⚖️ Prawnik</SelectItem>
                      <SelectItem value="admin">👑 Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>{user.token_balance || 0}</TableCell>
                <TableCell>{documentsCount?.[user.id] || 0}</TableCell>
                <TableCell>{questionsCount?.[user.id] || 0}</TableCell>
                <TableCell>{new Date(user.created_at).toLocaleDateString('pl-PL')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
