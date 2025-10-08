import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface AccessibilityStatementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (data: AccessibilityStatementData) => void;
}

export interface AccessibilityStatementData {
  auditorName: string;
  browsersDevices: string;
  technologies: string;
  assistiveTech: string;
  automatedTests: string;
}

export const AccessibilityStatementModal = ({ 
  open, 
  onOpenChange, 
  onGenerate 
}: AccessibilityStatementModalProps) => {
  const [formData, setFormData] = useState<AccessibilityStatementData>({
    auditorName: '',
    browsersDevices: '',
    technologies: '',
    assistiveTech: '',
    automatedTests: 'Evinced',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.auditorName.trim()) {
      toast.error('Please enter the auditor name');
      return;
    }

    onGenerate(formData);
    onOpenChange(false);
    
    // Reset form after generation
    setFormData({
      auditorName: '',
      browsersDevices: '',
      technologies: '',
      assistiveTech: '',
      automatedTests: 'Evinced',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate Accessibility Statement</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="auditorName">Auditor *</Label>
            <Input
              id="auditorName"
              placeholder="Name"
              value={formData.auditorName}
              onChange={(e) => setFormData({ ...formData, auditorName: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="browsersDevices">Browsers & devices tested</Label>
            <Textarea
              id="browsersDevices"
              placeholder="e.g., Chrome 120, Safari 17, Firefox 121 on macOS and Windows"
              value={formData.browsersDevices}
              onChange={(e) => setFormData({ ...formData, browsersDevices: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="technologies">Technologies / CMS / libraries</Label>
            <Textarea
              id="technologies"
              placeholder="e.g., React, Next.js, WordPress, Tailwind CSS"
              value={formData.technologies}
              onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assistiveTech">Assistive tech used</Label>
            <Textarea
              id="assistiveTech"
              placeholder="e.g., NVDA, JAWS, VoiceOver, TalkBack"
              value={formData.assistiveTech}
              onChange={(e) => setFormData({ ...formData, assistiveTech: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="automatedTests">Automated tests</Label>
            <Textarea
              id="automatedTests"
              placeholder="e.g., Evinced, axe DevTools, Lighthouse"
              value={formData.automatedTests}
              onChange={(e) => setFormData({ ...formData, automatedTests: e.target.value })}
              rows={3}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button type="submit">
              Confirm
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
