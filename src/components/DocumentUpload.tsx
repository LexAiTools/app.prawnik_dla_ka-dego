import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';

interface DocumentUploadProps {
  onUploadComplete: () => void;
}

export const DocumentUpload = ({ onUploadComplete }: DocumentUploadProps) => {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}_${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          name: file.name,
          file_path: filePath,
          file_type: file.type || 'application/octet-stream',
          file_size: file.size
        });

      if (dbError) throw dbError;

      toast.success('Dokument został przesłany');
      onUploadComplete();
      event.target.value = '';
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Błąd podczas przesyłania pliku');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        id="document-upload"
        className="hidden"
        onChange={handleFileUpload}
        accept=".pdf,.doc,.docx,.txt"
        disabled={uploading}
      />
      <Button
        onClick={() => document.getElementById('document-upload')?.click()}
        disabled={uploading}
        className="gap-2"
      >
        <Upload className="w-4 h-4" />
        {uploading ? 'Przesyłanie...' : 'Dodaj dokument'}
      </Button>
    </div>
  );
}
