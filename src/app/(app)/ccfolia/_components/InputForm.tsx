'use client';

import { type FC } from 'react';
import { ColorInput } from './ColorInput';
import { ParameterInput } from './ParameterInput';
import { StatusInput } from './StatusInput';
import { useInputForm } from './hooks/useInputForm';
import {
  Form,
  FormControl,
  FormField,
  FormLabel,
  FormItem,
  FormDescription,
} from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';

export const InputForm: FC = () => {
  const { form, handleSubmit } = useInputForm();

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit}>
        <div className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>名前</FormLabel>
                <FormControl>
                  <Input
                    placeholder="キャラクター名"
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="memo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>メモ</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="メモ"
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="initiative"
            render={({ field }) => (
              <FormItem>
                <FormLabel>イニシアチブ</FormLabel>
                <FormControl>
                  <Input
                    placeholder="10"
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormDescription>
                  キャラの行動力を示す値です。キャラの表示順序に影響します。
                </FormDescription>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="externalUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>参照URL</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://example.com/some_character"
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormDescription>
                  キャラの参照先のURLです。通常はキャラシのURlが入ります。
                </FormDescription>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ステータス</FormLabel>
                <FormDescription>
                  HPやMPなど、キャラに連動して変動するステータスを設定します。
                  <span className="mx-1 font-bold">{'{ラベル名}'}</span>
                  のように発言するとチャットから現在値を参照することができます。
                </FormDescription>
                <FormControl>
                  <StatusInput value={field.value} onChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="params"
            render={({ field }) => (
              <FormItem>
                <FormLabel>パラメータ</FormLabel>
                <FormDescription>
                  キャラの能力値など、めったに変動しないパラメータを設定します。
                  <span className="mx-1 font-bold">{'{ラベル名}'}</span>
                  のように発言するとチャットから値を参照することができます。
                </FormDescription>
                <FormControl>
                  <ParameterInput
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>チャットカラー</FormLabel>
                <FormControl>
                  <ColorInput value={field.value} onChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="commands"
            render={({ field }) => (
              <FormItem>
                <FormLabel>チャットパレット</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="CC<=70 【目星】"
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormDescription>
                  キャラを選択したときにチャットから素早く入力できるコマンドです。
                  <span className="mx-1 font-bold">{'{攻撃力}'}</span>
                  のようにすることでステータス・パラメータの値を参照できます。
                </FormDescription>
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
};
