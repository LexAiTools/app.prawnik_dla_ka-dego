import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, MessageCircle } from 'lucide-react';

interface HelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function HelpDialog({ open, onOpenChange }: HelpDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl">Pomoc i wsparcie</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <p className="text-muted-foreground">
            Potrzebujesz pomocy? Skontaktuj się z nami w jeden z poniższych sposobów:
          </p>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Email
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Napisz do nas na adres:
              </p>
              <a 
                href="mailto:pomoc@asystentprawny.pl" 
                className="text-primary hover:underline font-medium"
              >
                pomoc@asystentprawny.pl
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Telefon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Zadzwoń do nas:
              </p>
              <a 
                href="tel:+48123456789" 
                className="text-primary hover:underline font-medium"
              >
                +48 123 456 789
              </a>
              <p className="text-xs text-muted-foreground mt-2">
                Dostępni: Pn-Pt 9:00-17:00
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Chat
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Użyj asystenta prawnego w zakładce "Chat", aby zadać pytanie dotyczące Twojej sprawy.
              </p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
