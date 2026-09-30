const availableDice = ['3', '4', '6', '8', '10', '12', '20', '100'] as const;

export type AvailableDice = (typeof availableDice)[number];
export type SimpleDices = Record<AvailableDice, number>;
