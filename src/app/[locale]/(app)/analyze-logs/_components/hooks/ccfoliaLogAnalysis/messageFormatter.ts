export const formatMessage = (message: string) => {
  const match = message.match(/^s?x(\d+)\s/i);
  if (match === null) return [message];

  const repeatCount = Number.parseInt(match[1], 10);
  const messageWithoutRepeatCommand = message.replace(/^s?x\d+\s/i, '');
  const firstRollMarkerIndex = messageWithoutRepeatCommand.search(/\s+#1(?:\s|$)/);
  if (firstRollMarkerIndex === -1) return [message];

  const diceRollStr = messageWithoutRepeatCommand.slice(0, firstRollMarkerIndex).trim();
  const repeatedRollsStr = messageWithoutRepeatCommand.slice(firstRollMarkerIndex).trim();

  const formattedMessages = Array.from(repeatedRollsStr.matchAll(/#(\d+)\s+([\s\S]*?)(?=\s+#\d+\s+|$)/g)).map(
    ([, rollIndex, rollResult]) => `(${rollIndex}/${repeatCount}) ${diceRollStr} ${rollResult.trim()}`,
  );

  return formattedMessages.length === 0 ? [message] : formattedMessages;
};
