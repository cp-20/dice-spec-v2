export const formatMessage = (message: string) => {
  const match = message.match(/^x(\d+)\s/);
  if (match === null) return [message];

  const repeatCount = Number.parseInt(match[1], 10);
  const normalizedMessage = message.replace(/(x\d+.*)\s#1\n/, '$1\n\n#1\n');

  const diceRollStr = normalizedMessage.split('\n')[0].replace(/^x\d+\s/, '');

  return normalizedMessage
    .replace(/\n#(\d+)\n/g, `($1/${repeatCount}) ${diceRollStr} `)
    .split('\n')
    .slice(1);
};
