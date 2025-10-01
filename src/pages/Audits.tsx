import { ClipboardCheck } from 'lucide-react';

const Audits = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <ClipboardCheck className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Section Audits</h1>
        <p className="text-muted-foreground">
          Cette section affichera la liste de tous vos audits en cours
        </p>
      </div>
    </div>
  );
};

export default Audits;
