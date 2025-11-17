// @ts-nocheck - types will be regenerated after migration
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, MessageSquare, Coins } from "lucide-react";

export const DashboardView = () => {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [usersRes, docsRes, questionsRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('documents').select('id', { count: 'exact', head: true }),
        supabase.from('questions').select('id', { count: 'exact', head: true }),
      ]);

      return {
        users: usersRes.count || 0,
        documents: docsRes.count || 0,
        questions: questionsRes.count || 0,
      };
    },
  });

  const statCards = [
    {
      title: "Użytkownicy",
      value: stats?.users || 0,
      icon: Users,
      description: "Zarejestrowani użytkownicy",
    },
    {
      title: "Dokumenty",
      value: stats?.documents || 0,
      icon: FileText,
      description: "Wgrane dokumenty",
    },
    {
      title: "Pytania",
      value: stats?.questions || 0,
      icon: MessageSquare,
      description: "Zadane pytania",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Statystyki i przegląd systemu</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
