export const formatDiceCommand = (command: string) => {
  return command.trim().replace(/(\d+)d(\d*)/g, '$1D$2');
};
