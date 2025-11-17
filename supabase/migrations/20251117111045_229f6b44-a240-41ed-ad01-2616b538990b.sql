-- Dodaj wartość 'lawyer' do istniejącego enuma app_role
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'lawyer' 
        AND enumtypid = 'app_role'::regtype
    ) THEN
        ALTER TYPE app_role ADD VALUE 'lawyer';
    END IF;
END $$;