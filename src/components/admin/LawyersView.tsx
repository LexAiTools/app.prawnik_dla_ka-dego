// @ts-nocheck - types will be regenerated after migration
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Star } from "lucide-react";

export const LawyersView = () => {
  const queryClient = useQueryClient();

  const { data: lawyers, isLoading } = useQuery({
    queryKey: ['admin-lawyers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lawyers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('lawyers')
        .update({ is_active: !isActive })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-lawyers'] });
      toast.success('Status prawnika zaktualizowany');
    },
    onError: () => {
      toast.error('Błąd przy aktualizacji statusu');
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Prawników</CardTitle>
          <CardDescription>Zarządzaj prawnikami w systemie</CardDescription>
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
        <CardTitle>Prawników ({lawyers?.length || 0})</CardTitle>
        <CardDescription>Zarządzaj prawnikami w systemie</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Imię i nazwisko</TableHead>
              <TableHead>Specjalizacja</TableHead>
              <TableHead>Ocena</TableHead>
              <TableHead>Liczba opinii</TableHead>
              <TableHead>Aktywny</TableHead>
              <TableHead>Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lawyers?.map((lawyer) => (
              <TableRow key={lawyer.id}>
                <TableCell className="font-medium">{lawyer.name}</TableCell>
                <TableCell>{lawyer.specialization}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    {lawyer.rating}
                  </div>
                </TableCell>
                <TableCell>{lawyer.reviews_count}</TableCell>
                <TableCell>
                  <Switch
                    checked={lawyer.is_active}
                    onCheckedChange={() => toggleActiveMutation.mutate({ id: lawyer.id, isActive: lawyer.is_active })}
                  />
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">Edytuj</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
