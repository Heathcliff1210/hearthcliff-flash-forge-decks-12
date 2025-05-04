
import { Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exportData: string;
}

export const ExportDialog = ({ open, onOpenChange, exportData }: ExportDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Exporter vos données</DialogTitle>
          <DialogDescription>
            Copiez ce code et conservez-le en lieu sûr pour restaurer vos données ultérieurement.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <Textarea 
            value={exportData} 
            readOnly 
            className="h-40 font-mono text-xs"
          />
        </div>
        <DialogFooter className="flex space-x-2 justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Fermer
          </Button>
          <Button
            onClick={() => {
              navigator.clipboard.writeText(exportData);
              toast({
                title: "Données copiées",
                description: "Les données ont été copiées dans le presse-papier.",
              });
            }}
          >
            <Copy className="h-4 w-4 mr-1" />
            Copier
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
