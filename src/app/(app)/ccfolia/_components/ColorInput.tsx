import { IconHash, IconUserCircle } from '@tabler/icons-react';
import type { FC } from 'react';
import type { FormSchemaType } from '@/app/(app)/ccfolia/_components/InputForm';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';

type HexColorString = FormSchemaType['color'];

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
              キャラ1
            </span>
            <span className="text-[#757575]"> - 今日 13:04</span>
          </div>
          <div className="text-white">
            これはテストメッセージです。キャラの名前に色が反映されます。
          </div>
        </div>
      </div>

      {/* TODO: 折り返しの時に左右の余白が違う画面幅が存在する */}
      <div className="flex flex-wrap items-center gap-2 rounded-md border p-4">
        <ColorTip color="#222222" onChange={onChange} />
        <ColorTip color="#f44336" onChange={onChange} />
        <ColorTip color="#e91e63" onChange={onChange} />
        <ColorTip color="#9c27b0" onChange={onChange} />
        <ColorTip color="#673ab7" onChange={onChange} />
        <ColorTip color="#3f51b5" onChange={onChange} />
        <ColorTip color="#2196f3" onChange={onChange} />
        <ColorTip color="#03a9f4" onChange={onChange} />
        <ColorTip color="#00bcd4" onChange={onChange} />
        <ColorTip color="#009688" onChange={onChange} />
        <ColorTip color="#4caf50" onChange={onChange} />
        <ColorTip color="#8bc34a" onChange={onChange} />
        <ColorTip color="#cddc39" onChange={onChange} />
        <ColorTip color="#ffeb3b" onChange={onChange} />
        <ColorTip color="#ffc107" onChange={onChange} />
        <ColorTip color="#ff9800" onChange={onChange} />
        <ColorTip color="#ff5722" onChange={onChange} />
        <ColorTip color="#795548" onChange={onChange} />
        <ColorTip color="#607d8b" onChange={onChange} />
        <ColorTip color="#9e9e9e" onChange={onChange} />
        <ColorTip color="#e0e0e0" onChange={onChange} />

        <div className="relative">
          <div className="absolute left-0 top-0 grid h-8 w-8 place-content-center rounded-s-md bg-slate-200">
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
  onChange: (value: string) => void;
};

const ColorTip: FC<ColorTipProps> = ({ color, onChange }) => {
  return (
    <Button
      variant="ghost"
      className="h-8 w-8 p-0 transition-all duration-75 hover:opacity-80 active:scale-90"
      style={{ backgroundColor: color }}
      onClick={() => onChange(color)}
    />
  );
};
