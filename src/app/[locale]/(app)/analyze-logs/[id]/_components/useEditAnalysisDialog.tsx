'use client';

import { IconLoader2, IconLock, IconLockOpen, IconSparkles } from '@tabler/icons-react';
import { Timestamp } from 'firebase/firestore';
import { t } from 'i18next';
import { useAtomValue } from 'jotai';
import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { useUpdateAnalysis } from '@/shared/lib/firebase/stores/analyses/mutations';
import type { AnalysisVisibilityLevel } from '@/shared/lib/firebase/stores/collections';
import { analysisIdAtom, currentAnalysisAtom } from './atoms';

interface VisibilityOption {
  value: AnalysisVisibilityLevel;
  labelKey: `analyze-logs:edit-dialog.visibility.${AnalysisVisibilityLevel}`;
  icon: typeof IconLock;
}

const visibilityOptions: VisibilityOption[] = [
  { value: 'private', labelKey: 'analyze-logs:edit-dialog.visibility.private', icon: IconLock },
  { value: 'unlisted', labelKey: 'analyze-logs:edit-dialog.visibility.unlisted', icon: IconSparkles },
  { value: 'public', labelKey: 'analyze-logs:edit-dialog.visibility.public', icon: IconLockOpen },
];

export const useEditAnalysisDialog = () => {
  const analysisId = useAtomValue(analysisIdAtom);
  const { analysis, loading } = useAtomValue(currentAnalysisAtom);
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [visibility, setVisibility] = useState<AnalysisVisibilityLevel>('private');
  const [showRecordDetails, setShowRecordDetails] = useState(false);
  const [sessionDate, setSessionDate] = useState('');
  const { updateAnalysis, updating } = useUpdateAnalysis();

  const isValid = analysisId !== undefined && title.trim().length > 0;

  const analysisSessionDate = analysis?.sessionDate
    ? new Date(analysis.sessionDate.seconds * 1000).toISOString().split('T')[0]
    : '';

  const isDirty =
    analysis &&
    (title.trim() !== analysis.title ||
      visibility !== analysis.visibilityLevel ||
      showRecordDetails !== analysis.showRecordDetails ||
      sessionDate !== analysisSessionDate);

  const handleSave = async () => {
    if (!isValid || !isDirty || loading || updating) return;
    await updateAnalysis(analysisId, {
      title: title.trim(),
      visibilityLevel: visibility,
      showRecordDetails: showRecordDetails,
      sessionDate: sessionDate ? Timestamp.fromDate(new Date(sessionDate)) : null,
    });
    setIsOpen(false);
  };

  const open = () => {
    if (analysis) {
      setTitle(analysis.title);
      setVisibility(analysis.visibilityLevel);
      setShowRecordDetails(analysis.showRecordDetails ?? false);
      setSessionDate(
        analysis.sessionDate ? new Date(analysis.sessionDate.seconds * 1000).toISOString().split('T')[0] : '',
      );
    }
    setIsOpen(true);
  };

  const close = () => setIsOpen(false);

  const render = () => (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('analyze-logs:edit-dialog.title')}</DialogTitle>
          <DialogDescription>{t('analyze-logs:edit-dialog.description')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">{t('analyze-logs:edit-dialog.title-label')}</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('analyze-logs:edit-dialog.title-placeholder')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-visibility">{t('analyze-logs:edit-dialog.visibility-label')}</Label>
            <Select value={visibility} onValueChange={(v) => setVisibility(v as AnalysisVisibilityLevel)}>
              <SelectTrigger id="edit-visibility">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {visibilityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <span className="inline-flex items-center gap-2">
                      <option.icon className="size-4" />
                      {t(option.labelKey)}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-sessionDate">{t('analyze-logs:edit-dialog.session-date-label')}</Label>
            <Input
              id="edit-sessionDate"
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="edit-showRecordDetails"
              checked={showRecordDetails}
              onCheckedChange={(checked) => setShowRecordDetails(checked === true)}
            />
            <label
              htmlFor="edit-showRecordDetails"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              {t('analyze-logs:edit-dialog.show-record-details-label')}
            </label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={close} disabled={updating}>
            {t('analyze-logs:edit-dialog.cancel')}
          </Button>
          <Button onClick={handleSave} disabled={!isValid || !isDirty || loading || updating}>
            {updating ? (
              <>
                <IconLoader2 className="size-4 animate-spin" />
                <span>{t('analyze-logs:edit-dialog.saving')}</span>
              </>
            ) : (
              <>{t('analyze-logs:edit-dialog.save')}</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return { open, close, render };
};
