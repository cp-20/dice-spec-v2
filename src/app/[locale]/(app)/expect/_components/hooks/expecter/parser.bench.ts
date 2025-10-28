import { bench, run } from 'mitata';
import { parseDiceCommand } from './parser';

bench('単純な数字をパースできる', () => {
  parseDiceCommand('123');
});

bench('スペースが含まれている数字をパースできる', () => {
  parseDiceCommand(' 123 ');
});

bench('タブ文字が含まれている数字をパースできる', () => {
  parseDiceCommand('\t123\t');
});

bench('ダイスをパースできる', () => {
  parseDiceCommand('1d6');
});

bench('単純な計算式をパースできる', () => {
  parseDiceCommand('1 + 2');
});

bench('複雑な計算式をパースできる', () => {
  parseDiceCommand('1 + 2 * 3');
});

bench('括弧を含む計算式をパースできる', () => {
  parseDiceCommand('(1 + 2) / 3');
});

bench('ダイスを含む計算式をパースできる', () => {
  parseDiceCommand('1 + 2d6');
});

bench('ダイスと括弧を含む計算式をパースできる', () => {
  parseDiceCommand('(1 + 2d3) * 2 + 10d6');
});

bench('比較式をパースできる', () => {
  parseDiceCommand('1 + 2d6 >= 10');
});

await run();
