'use client';

import type { FC } from 'react';
import type { FieldErrors, UseFormReturn } from 'react-hook-form';

import {
  type CcfoliaEditorCharacter,
  MAX_CCFOLIA_CHARACTER_COMMANDS_LENGTH,
  MAX_CCFOLIA_CHARACTER_EXTERNAL_URL_LENGTH,
  MAX_CCFOLIA_CHARACTER_MEMO_LENGTH,
  MAX_CCFOLIA_CHARACTER_NAME_LENGTH,
} from '@/features/ccfolia/model';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';

import { ColorInput } from './ColorInput';
import { ParameterInput } from './ParameterInput';
import { StatusInput } from './StatusInput';
import { numberFormatter } from './variableFieldChangeHandler';

type InputFormProps = {
  form: UseFormReturn<CcfoliaEditorCharacter>;
  onSubmit: (value: CcfoliaEditorCharacter) => void | Promise<void>;
  onInvalid: (errors: FieldErrors<CcfoliaEditorCharacter>) => void;
  formId: string;
};

export const InputForm: FC<InputFormProps> = ({ form, onSubmit, onInvalid, formId }) => {
  return (
    <Form {...form}>
      <form id={formId} aria-label="キャラクター編集フォーム" onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
        <div className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="mb-2 block">名前</FormLabel>
                <FormControl>
                  <Input
                    ref={field.ref}
                    maxLength={MAX_CCFOLIA_CHARACTER_NAME_LENGTH}
                    placeholder="キャラクター名"
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage>入力内容を確認してください。</FormMessage>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="memo"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="mb-2 block">メモ</FormLabel>
                <FormControl>
                  <Textarea
                    ref={field.ref}
                    maxLength={MAX_CCFOLIA_CHARACTER_MEMO_LENGTH}
                    placeholder="メモ"
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage>入力内容を確認してください。</FormMessage>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="initiative"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="mb-2 block">イニシアティブ</FormLabel>
                <FormControl>
                  <Input
                    ref={field.ref}
                    type="number"
                    placeholder="イニシアティブ"
                    value={field.value ?? ''}
                    onChange={(event) => {
                      const value = event.target.value;
                      field.onChange(numberFormatter(value));
                    }}
                  />
                </FormControl>
                <FormDescription>キャラの行動力を示す値です。キャラの表示順序に影響します。</FormDescription>
                <FormMessage>入力内容を確認してください。</FormMessage>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="externalUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="mb-2 block">参照URL</FormLabel>
                <FormControl>
                  <Input
                    ref={field.ref}
                    maxLength={MAX_CCFOLIA_CHARACTER_EXTERNAL_URL_LENGTH}
                    placeholder="https://example.com/some_character"
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormDescription>キャラの参照先のURLです。通常はキャラシのURLが入ります。</FormDescription>
                <FormMessage>入力内容を確認してください。</FormMessage>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="mb-2 block">ステータス</FormLabel>
                <FormDescription>
                  {
                    'HPやMPなど、キャラに連動して変動するステータスを設定します。{ラベル名} のように発言するとチャットから現在値を参照することができます。'
                  }
                </FormDescription>
                <FormControl>
                  <StatusInput ref={field.ref} value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage>入力内容を確認してください。</FormMessage>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="params"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="mb-2 block">パラメータ</FormLabel>
                <FormDescription>
                  {
                    'キャラの能力値など、めったに変動しないパラメータを設定します。{ラベル名} のように発言するとチャットから値を参照することができます。'
                  }
                </FormDescription>
                <FormControl>
                  <ParameterInput ref={field.ref} value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage>入力内容を確認してください。</FormMessage>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="mb-2 block">チャットカラー</FormLabel>
                <FormControl>
                  <ColorInput ref={field.ref} value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage># に続けて0〜9・A〜Fの6文字を入力してください。</FormMessage>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="commands"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="mb-2 block">チャットパレット</FormLabel>
                <FormControl>
                  <Textarea
                    ref={field.ref}
                    maxLength={MAX_CCFOLIA_CHARACTER_COMMANDS_LENGTH}
                    placeholder={'CC<=70 【目星】'}
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormDescription>
                  {
                    'キャラを選択したときにチャットから素早く入力できるコマンドです。{攻撃力} のようにすることでステータス・パラメータの値を参照できます。'
                  }
                </FormDescription>
                <FormMessage>入力内容を確認してください。</FormMessage>
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
};
