import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Coins, FileText, MessageSquare, Calendar } from 'lucide-react';

interface UserProfileProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBuyTokens: () => void;
}

export default function UserProfile({ open, onOpenChange, onBuyTokens }: UserProfileProps) {
  const [fullName, setFullName] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const { data: profile, refetch: refetchProfile } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setFullName(data.full_name || '');
      }
      
      return data;
    },
    enabled: open
  });

  const { data: documentsCount = 0 } = useQuery({
    queryKey: ['user-documents-count'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const { count, error } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (error) throw error;
      return count || 0;
    },
    enabled: open
  });

  const { data: conversationsCount = 0 } = useQuery({
    queryKey: ['user-conversations-count'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const { count, error } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (error) throw error;
      return count || 0;
    },
    enabled: open
  });

  const handleSaveProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({ 
          full_name: fullName,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Profil zaktualizowany pomyślnie');
      refetchProfile();
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Błąd aktualizacji profilu');
    }
  };

  const handleCancel = () => {
    setFullName(profile?.full_name || '');
    setIsEditing(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Moje konto</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informacje podstawowe */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informacje podstawowe</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile?.email || ''}
                  disabled
                  className="bg-muted"
                />
              </div>

              {profile?.phone_number && (
                <div className="space-y-2">
                  <Label htmlFor="phone">Numer telefonu</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profile.phone_number}
                    disabled
                    className="bg-muted"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="fullName">Imię i nazwisko</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={!isEditing}
                  placeholder="Wprowadź swoje imię i nazwisko"
                  className={!isEditing ? 'bg-muted' : ''}
                />
              </div>

              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} variant="outline" className="w-full">
                  Edytuj dane
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleCancel} variant="outline" className="flex-1">
                    Anuluj
                  </Button>
                  <Button onClick={handleSaveProfile} className="flex-1">
                    Zapisz zmiany
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Saldo tokenów */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Saldo tokenów</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-primary" />
                  <span className="text-lg font-semibold">
                    {profile?.token_balance || 0} tokenów
                  </span>
                </div>
                <Button onClick={onBuyTokens} size="sm">
                  Kup tokeny
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Statystyki */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Twoja aktywność</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Dokumenty</span>
                </div>
                <span className="font-semibold">{documentsCount}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Konwersacje</span>
                </div>
                <span className="font-semibold">{conversationsCount}</span>
              </div>

              {profile?.created_at && (
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Data rejestracji</span>
                  </div>
                  <span className="font-semibold">
                    {new Date(profile.created_at).toLocaleDateString('pl-PL')}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Zamknij
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
