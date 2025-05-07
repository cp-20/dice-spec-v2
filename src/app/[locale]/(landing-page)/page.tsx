import type { IconProps } from '@tabler/icons-react';
import { IconBrandDiscord, IconBrandX, IconDice5, IconSearch, IconTimeline } from '@tabler/icons-react';
import { IconBrandGithub } from '@tabler/icons-react';
import { t } from 'i18next';
import type { NextPage } from 'next';
import type { FC } from 'react';
import { ExternalLinkWithIcon } from './_components/ExternalLinkWithIcon';
import { LinkableIconPanel } from './_components/LinkableIconPanel';
import { Panel } from './_components/Panel';
import { Footer } from '@/shared/components/Layout/Footer';
import { H2 } from '@/shared/components/Typography/H2';
import { Text } from '@/shared/components/Typography/Text';
import { CustomLink } from '@/shared/components/elements/CustomLink';
import { UpdateAnnouncement } from '@/shared/components/elements/UpdateAnnouncement';
import { Button } from '@/shared/components/ui/button';
import {
  localeHelper,
  type MetadataGenerator,
  metadataHelper,
  viewportGenerator,
} from '@/shared/lib/metadataGenerator';
import LogoIcon from '/public/icon.svg';
import TitleLogoJP from '/public/title-logo.svg';
import TitleLogoEN from '/public/title-logo-en.svg';
import { wrapPage } from '@/shared/i18n/page-layout';

export const generateMetadata: MetadataGenerator = async (props) => {
  const locale = await localeHelper(props);
  return metadataHelper({
    description: t('landing-page:description'),
    locale,
  });
};
export const viewport = viewportGenerator();

const featureIcons: Record<string, FC<IconProps>> = {
  expect: IconSearch,
  dice: IconDice5,
  'analyze-logs': IconTimeline,
};

const LandingPage: NextPage = () => {
  const TitleLogo = t('lang') === 'en' ? TitleLogoEN : TitleLogoJP;
  return (
    <>
      <div className="flex min-h-screen w-full flex-col">
        <UpdateAnnouncement />
        <main className="mx-auto flex w-full max-w-(--breakpoint-lg) flex-1 flex-col items-center gap-16 px-8 py-8 max-sm:px-4">
          <div className="mt-16 flex max-w-full items-center justify-center gap-8 max-md:mt-8 max-md:flex-col max-md:gap-2 max-sm:mt-4">
            <div>
              <LogoIcon className="size-32 max-sm:h-24 max-sm:w-24" />
            </div>

            <div className="flex max-w-full flex-col">
              <h1 className="max-w-full max-md:mx-auto max-md:px-4">
                <TitleLogo className="max-w-full text-slate-800 md:h-16" />
              </h1>

              <Text className="text-balance max-md:text-center">{t('landing-page:catchphrase')}</Text>
            </div>
          </div>

          <Button className="font-bold" asChild>
            <CustomLink href={t('link', { href: '/expect' })}>{t('landing-page:try-it-out')}</CustomLink>
          </Button>

          <div>
            <H2 className="m-0 mb-4 border-none p-0 text-center text-xl">{t('landing-page:features.label')}</H2>

            <div className="flex gap-4 max-md:flex-col">
              {['expect', 'dice', 'analyze-logs'].map((key) => (
                <LinkableIconPanel
                  key={key}
                  href={t('link', { href: `/${key}` })}
                  icon={featureIcons[key]}
                  label={t(`common:${key}.title`)}
                  contents={t(`common:${key}.description`)}
                  className="md:flex-1"
                />
              ))}
            </div>
          </div>

          <div>
            <H2 className="m-0 mb-4 border-none p-0 text-center text-xl">{t('landing-page:characteristics.label')}</H2>

            <div className="flex gap-4 max-md:flex-col">
              {[0, 1, 2].map((key) => (
                <Panel
                  key={key}
                  label={t(`landing-page:characteristics.${key}.label`)}
                  contents={t(`landing-page:characteristics.${key}.contents`)}
                  className="md:flex-1"
                />
              ))}
            </div>
          </div>

          <div>
            <H2 className="m-0 mb-4 border-none p-0 text-center text-xl">{t('landing-page:links.label')}</H2>

            <div className="flex gap-4 max-md:flex-col">
              <ExternalLinkWithIcon icon={IconBrandDiscord} href="https://discord.gg/YQ7negGTUK">
                {t('landing-page:links.discord')}
              </ExternalLinkWithIcon>
              <ExternalLinkWithIcon icon={IconBrandX} href="https://twitter.com/__cp20__">
                {t('landing-page:links.twitter')}
              </ExternalLinkWithIcon>
              <ExternalLinkWithIcon icon={IconBrandGithub} href="https://github.com/cp-20/dice-spec-v2">
                {t('landing-page:links.github')}
              </ExternalLinkWithIcon>
            </div>
          </div>

          <div>
            <H2 className="m-0 mb-4 border-none p-0 text-center text-xl">{t('landing-page:credit')}</H2>

            <a
              className="underline hover:text-slate-500"
              href="https://www.flaticon.com/free-icons/dice"
              target="_blank"
              rel="noopener noreferrer"
            >
              Dice icons created by Tanah Basah - Flaticon
            </a>
          </div>

          <div>
            <H2 className="m-0 mb-4 border-none p-0 text-center text-xl">{t('landing-page:privacy-policy.label')}</H2>

            <p className="max-w-[43rem] text-xs">{t('landing-page:privacy-policy.description')}</p>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default wrapPage(LandingPage);
