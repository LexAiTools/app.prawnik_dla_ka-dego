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
import { Badge } from "@/components/ui/badge";

export const PackagesView = () => {
  const queryClient = useQueryClient();

  const { data: packages, isLoading } = useQuery({
    queryKey: ['admin-packages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('token_packages')
        .select('*')
        .order('tokens', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('token_packages')
        .update({ is_active: !isActive })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-packages'] });
      toast.success('Status pakietu zaktualizowany');
    },
    onError: () => {
      toast.error('Błąd przy aktualizacji statusu');
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pakiety tokenów</CardTitle>
          <CardDescription>Zarządzaj pakietami tokenów</CardDescription>
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
        <CardTitle>Pakiety tokenów ({packages?.length || 0})</CardTitle>
        <CardDescription>Zarządzaj pakietami tokenów</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Liczba tokenów</TableHead>
              <TableHead>Cena</TableHead>
              <TableHead>Rabat</TableHead>
              <TableHead>Cena po rabacie</TableHead>
              <TableHead>Aktywny</TableHead>
              <TableHead>Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {packages?.map((pkg) => {
              const discountedPrice = pkg.price * (1 - pkg.discount / 100);
              return (
                <TableRow key={pkg.id}>
                  <TableCell className="font-medium">{pkg.tokens} tokenów</TableCell>
                  <TableCell>{pkg.price.toFixed(2)} zł</TableCell>
                  <TableCell>
                    {pkg.discount > 0 && (
                      <Badge variant="secondary">{pkg.discount}%</Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-semibold text-primary">
                    {discountedPrice.toFixed(2)} zł
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={pkg.is_active}
                      onCheckedChange={() => toggleActiveMutation.mutate({ id: pkg.id, isActive: pkg.is_active })}
                    />
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">Edytuj</Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
