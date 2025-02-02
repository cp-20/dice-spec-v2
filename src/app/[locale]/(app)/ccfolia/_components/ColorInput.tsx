import { IconCheck, IconHash, IconUserCircle } from '@tabler/icons-react';
import clsx from 'clsx';
import { t } from 'i18next';
import type { FC } from 'react';
import type { InputFormSchemaType } from './hooks/useInputForm';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { checkIsDarkColor } from '@/shared/lib/isDarkColor';

type HexColorString = InputFormSchemaType['color'];

type ColorInputProps = {
  value: HexColorString;
  onChange: (value: string) => void;
};

export const ColorInput: FC<ColorInputProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-md bg-[#2b2a2a] p-4 ">
        <IconUserCircle size="48" className="text-white" stroke="1" />
        <div className="space-y-1">
          <div>
            <span className="font-bold" style={{ color: value }}>
              {t('ccfolia:input.color.character')}
            </span>
            <span className="text-[#757575]"> - {t('ccfolia:input.color.time')}</span>
          </div>
          <div className="text-white">{t('ccfolia:input.color.message')}</div>
        </div>
      </div>

      {/* TODO: 折り返しの時に左右の余白が違う画面幅が存在する */}
      <div className="flex flex-wrap items-center gap-2 rounded-md border p-4">
        <ColorTip color="#222222" value={value} onChange={onChange} />
        <ColorTip color="#f44336" value={value} onChange={onChange} />
        <ColorTip color="#e91e63" value={value} onChange={onChange} />
        <ColorTip color="#9c27b0" value={value} onChange={onChange} />
        <ColorTip color="#673ab7" value={value} onChange={onChange} />
        <ColorTip color="#3f51b5" value={value} onChange={onChange} />
        <ColorTip color="#2196f3" value={value} onChange={onChange} />
        <ColorTip color="#03a9f4" value={value} onChange={onChange} />
        <ColorTip color="#00bcd4" value={value} onChange={onChange} />
        <ColorTip color="#009688" value={value} onChange={onChange} />
        <ColorTip color="#4caf50" value={value} onChange={onChange} />
        <ColorTip color="#8bc34a" value={value} onChange={onChange} />
        <ColorTip color="#cddc39" value={value} onChange={onChange} />
        <ColorTip color="#ffeb3b" value={value} onChange={onChange} />
        <ColorTip color="#ffc107" value={value} onChange={onChange} />
        <ColorTip color="#ff9800" value={value} onChange={onChange} />
        <ColorTip color="#ff5722" value={value} onChange={onChange} />
        <ColorTip color="#795548" value={value} onChange={onChange} />
        <ColorTip color="#607d8b" value={value} onChange={onChange} />
        <ColorTip color="#9e9e9e" value={value} onChange={onChange} />
        <ColorTip color="#e0e0e0" value={value} onChange={onChange} />

        <div className="relative">
          <div className="absolute left-0 top-0 grid size-8 place-content-center rounded-s-md bg-slate-200">
            <IconHash size="16" />
          </div>
          <Input
            value={value}
            placeholder="#888888"
            onChange={(e) => onChange(e.target.value)}
            className="h-8 w-40 pl-10 pr-2"
          />
        </div>
      </div>
    </div>
  );
};

type ColorTipProps = {
  color: HexColorString;
  value: HexColorString;
  onChange: (value: string) => void;
};

const ColorTip: FC<ColorTipProps> = ({ color, value, onChange }) => {
  const isDarkColor = checkIsDarkColor(color);
  return (
    <Button
      variant="ghost"
      className="h-8 w-8 p-0 transition-all duration-75 hover:opacity-80 active:scale-90"
      style={{ backgroundColor: color }}
      onClick={() => onChange(color)}
    >
      {value === color && <IconCheck size="16" className={clsx(isDarkColor && 'text-white')} />}
    </Button>
  );
};
