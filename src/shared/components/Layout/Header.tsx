import { IconMessageReply } from '@tabler/icons-react';
import { t } from 'i18next';
import { type ComponentProps, type FC, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { CustomLink } from '@/shared/components/elements/CustomLink';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { useToast } from '@/shared/components/ui/use-toast';
import { appVersion } from '@/shared/lib/const';
import { sendFeedback } from '@/shared/lib/webhook';
import TitleLogoJP from '/public/title-logo.svg';
import TitleLogoEN from '/public/title-logo-en.svg';

export const Header: FC<ComponentProps<'header'>> = ({ className, ...props }) => {
  const TitleLogo = t('lang') === 'en' ? TitleLogoEN : TitleLogoJP;
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [feedback, setFeedback] = useState('');
  const { toast } = useToast();

  const feedbackSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      sendFeedback({
        name: e.currentTarget['feedback-form-name'].value,
        feedback: e.currentTarget['feedback-form-feedback'].value,
      });
      setOpen(false);
      toast({
        title: t('common:header.feedback.submitted'),
        description: t('common:header.feedback.submitted-description'),
        variant: 'default',
      });
    } catch (_err) {
      toast({
        title: t('common:header.feedback.error'),
        variant: 'destructive',
      });
    }
  };

  return (
    <header className={twMerge('flex items-center justify-between border-b px-4 py-2', className)} {...props}>
      <div className="flex items-center gap-2">
        <CustomLink
          href={t('link', { href: '/' })}
          className="transition-opacity duration-100 hover:opacity-70"
          aria-label={t('common:header.app-name')}
        >
          <TitleLogo className="h-5 w-auto text-slate-800 max-sm:h-7 max-sm:w-[10rem]" />
        </CustomLink>
        <div>v{appVersion}</div>
      </div>
      <div className="flex gap-2">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              title={t('common:header.feedback-button')}
              onClick={() => setOpen(true)}
            >
              <IconMessageReply className="size-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <form onSubmit={feedbackSubmitHandler}>
              <DialogHeader>
                <DialogTitle>{t('common:header.feedback.title')}</DialogTitle>
                <DialogDescription>{t('common:header.feedback.description')}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-6">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="feedback-form-name">{t('common:header.feedback.name')}</Label>
                    <Input id="feedback-form-name" value={name} onChange={(e) => setName(e.currentTarget.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="feedback-form-feedback">{t('common:header.feedback.feedback')}</Label>
                    <Textarea
                      id="feedback-form-feedback"
                      value={feedback}
                      onChange={(e) => setFeedback(e.currentTarget.value)}
                      // @ts-expect-error fieldSizing is a newer CSS property
                      style={{ fieldSizing: 'content' }}
                      required
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{t('common:header.feedback.submit')}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
};
