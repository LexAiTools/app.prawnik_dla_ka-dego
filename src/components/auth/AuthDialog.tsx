import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: 'signin' | 'signup' | 'forgot';
}

export const AuthDialog = ({ open, onOpenChange, defaultTab = 'signin' }: AuthDialogProps) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'user' | 'lawyer'>('user');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const navigate = useNavigate();

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setSelectedRole('user');
      setResetSent(false);
      setLoading(false);
    }
  }, [open]);

  // Update active tab when defaultTab changes
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast({
        title: "Zalogowano pomyślnie!",
      });
      onOpenChange(false);
      
      // Check user role and redirect accordingly
      if (data.user) {
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id);
        
        if (roles && roles.length > 0) {
          const userRoles = roles.map(r => r.role);
          
          // Priority: admin > lawyer > user
          if (userRoles.includes('admin')) {
            navigate('/admin');
          } else if (userRoles.includes('lawyer')) {
            navigate('/lawyer-dashboard');
          } else {
            navigate(`/dashboard/${data.user.id}`);
          }
        } else {
          navigate(`/dashboard/${data.user.id}`);
        }
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Błąd podczas logowania",
        description: error.message || 'Sprawdź email i hasło',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Hasła nie są identyczne",
      });
      return;
    }
    
    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Hasło musi mieć minimum 6 znaków",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      if (error) throw error;
      
      // If user is created and logged in immediately (auto-confirm enabled)
      if (data.user) {
        // If user selected 'lawyer', update their role
        if (selectedRole === 'lawyer') {
          // Remove default 'user' role
          await supabase
            .from('user_roles')
            .delete()
            .eq('user_id', data.user.id)
            .eq('role', 'user');
          
          // Add 'lawyer' role
          await supabase
            .from('user_roles')
            .insert({ user_id: data.user.id, role: 'lawyer' });
        }
        
        navigate(`/dashboard/${data.user.id}`);
      }
      
      toast({
        title: "Konto utworzone!",
        description: data.user ? "Zalogowano pomyślnie!" : "Sprawdź email aby potwierdzić.",
      });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Błąd podczas rejestracji",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        variant: "destructive",
        title: "Wprowadź adres email",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (error) throw error;
      
      setResetSent(true);
      toast({
        title: "Link resetujący wysłany",
        description: "Sprawdź swoją skrzynkę email",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Błąd podczas wysyłania linku",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Asystent Prawny</DialogTitle>
          <DialogDescription>
            Zaloguj się lub utwórz nowe konto
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="signin">Logowanie</TabsTrigger>
            <TabsTrigger value="signup">Rejestracja</TabsTrigger>
            <TabsTrigger value="forgot">Odzyskaj</TabsTrigger>
          </TabsList>
          
          {/* LOGIN TAB */}
          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="twoj@email.pl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signin-password">Hasło</Label>
                <Input
                  id="signin-password"
                  type="password"
                  placeholder="••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logowanie...
                  </>
                ) : (
                  'Zaloguj się'
                )}
              </Button>
              <div className="text-center text-sm space-y-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('forgot')}
                  className="text-primary hover:underline"
                >
                  Nie pamiętasz hasła?
                </button>
                <div>
                  <span className="text-muted-foreground">Nie masz konta? </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('signup')}
                    className="text-primary hover:underline"
                  >
                    Zarejestruj się
                  </button>
                </div>
              </div>
            </form>
          </TabsContent>
          
          {/* REGISTER TAB */}
          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="twoj@email.pl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Hasło</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="Minimum 6 znaków"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Potwierdź hasło</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Powtórz hasło"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Rejestracja...
                  </>
                ) : (
                  'Zarejestruj się'
                )}
              </Button>
              <div className="text-center text-sm">
                <span className="text-muted-foreground">Masz już konto? </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('signin')}
                  className="text-primary hover:underline"
                >
                  Zaloguj się
                </button>
              </div>
            </form>
          </TabsContent>
          
          {/* FORGOT PASSWORD TAB */}
          <TabsContent value="forgot">
            {resetSent ? (
              <div className="space-y-4 text-center py-4">
                <div className="text-sm text-muted-foreground">
                  Link resetujący hasło został wysłany na adres <strong>{email}</strong>. 
                  Sprawdź swoją skrzynkę email.
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setResetSent(false);
                    setActiveTab('signin');
                  }}
                >
                  Wróć do logowania
                </Button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="forgot-email">Email</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="twoj@email.pl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Wyślemy Ci link do zresetowania hasła
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Wysyłanie...
                    </>
                  ) : (
                    'Wyślij link resetujący'
                  )}
                </Button>
                <div className="text-center text-sm">
                  <button
                    type="button"
                    onClick={() => setActiveTab('signin')}
                    className="text-primary hover:underline"
                  >
                    Wróć do logowania
                  </button>
                </div>
              </form>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
