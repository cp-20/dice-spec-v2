'use client';

import { IconLoader2 } from '@tabler/icons-react';
import { useAtomValue, useSetAtom } from 'jotai';
import type { FC } from 'react';

import { meAtom } from '@/features/account/firebase/accountStore';
import { CCFOLIA_CHARACTER_SAVE_LIMIT_FREE } from '@/features/ccfolia/model';
import { CustomLink } from '@/shared/components/elements/CustomLink';
import { Button } from '@/shared/components/ui/button';

import { CcfoliaSavedCharacterGrid } from './CcfoliaSavedCharacterGrid';
import { CcfoliaSavedCharactersAlert } from './CcfoliaSavedCharactersAlert';
import {
  canCreateSavedCharacterAtom,
  loadMoreCharactersAtom,
  savedCharacterCountAtom,
  savedCharactersAtom,
  selectedCharacterQueryAtom,
} from './savedCharacters';

export const CcfoliaSavedCharactersContent: FC = () => {
  const characters = useAtomValue(savedCharactersAtom);
  const selectedCharacter = useAtomValue(selectedCharacterQueryAtom);
  const isPro = useAtomValue(meAtom)?.plan === 'pro';
  const savedCount = useAtomValue(savedCharacterCountAtom);
  const canCreate = useAtomValue(canCreateSavedCharacterAtom);
  const loadMoreCharacters = useSetAtom(loadMoreCharactersAtom);

  return (
    <div className="space-y-3">
      <CcfoliaSavedCharacterGrid />
      {characters.hasMore && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={() => void loadMoreCharacters()}
          disabled={characters.loadingMore}
        >
          {characters.loadingMore && <IconLoader2 className="size-4 animate-spin" />}
          {characters.loadingMore ? '読み込み中…' : '保存済みキャラクターをさらに読み込む'}
        </Button>
      )}
      <CcfoliaSavedCharactersAlert />
      {(characters.error || selectedCharacter.error) && (
        <p role="alert" className="text-sm text-destructive">
          保存済みキャラクターを読み込めませんでした
        </p>
      )}
      <div className="flex justify-end">
        {!isPro && (
          <p className="text-xs text-muted-foreground">
            {`${savedCount} / ${CCFOLIA_CHARACTER_SAVE_LIMIT_FREE}件保存中`}
            {!canCreate && (
              <>
                {' · '}
                プロなら保存件数は無制限です。{' '}
                <CustomLink className="font-medium text-foreground underline underline-offset-4" href="/profile">
                  プロプランを見る
                </CustomLink>
              </>
            )}
          </p>
        )}
      </div>
    </div>
  );
};
