import type { Metadata } from 'next';
import { H1 } from '@/shared/components/Typography/H1';
import { Text } from '@/shared/components/Typography/Text';
import { metadataGenerator } from '@/shared/lib/metadataGenerator';

export const metadata: Metadata = metadataGenerator({
  title: 'Next.js App Router with shadcn/ui Template',
  description:
    'shadcn/ui を利用した Next.js (App Router) のテンプレートリポジトリです',
});

const LandingPage = () => {
  return (
    <div className="w-screen min-h-screen flex flex-col justify-center items-center">
      <div>
        <H1>Next.js App Router with shadcn/ui Template</H1>
        <Text>
          shadcn/ui を利用した Next.js (App Router) のテンプレートリポジトリです
        </Text>
      </div>
    </div>
  );
};

export default LandingPage;
