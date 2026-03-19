import { normalizeParentheses } from './normalize';

const skillNameRegex = /(?:【([^】]+)】)|(?:［([^］]+)］)|(?:《([^》]+)》)|(?:〈([^〉]+)〉)/u;

export const extractSkillNameFromMessage = (message: string): string | undefined => {
  const normalizedMessage = normalizeParentheses(message);

  // ダイス結果本文側の注釈を避けるため、コマンド部のみから技能名を抽出する
  const commandPart = normalizedMessage.split(' (')[0]?.replace(/^\(\d+\/\d+\)\s*/, '') ?? normalizedMessage;
  const match = commandPart.match(skillNameRegex);
  const wrappedSkillName = match?.[1] ?? match?.[2] ?? match?.[3] ?? match?.[4];
  if (wrappedSkillName) return wrappedSkillName;

  const tokens = commandPart.trim().split(/\s+/u);
  if (tokens.length < 2) return undefined;

  return tokens.at(-1);
};
