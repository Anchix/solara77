export const DHANTERAS_WHEEL_PRIZES = [
  { value: 15, label: "15% OFF", firstIndex: 0, count: 90 },
  { value: 10, label: "10% OFF", firstIndex: 90, count: 9 },
  { value: 20, label: "20% OFF", firstIndex: 99, count: 1 },
] as const;

export const selectDhanterasPrize = (roll: number) => {
  const normalized = Math.max(0, Math.min(0.999999999999, roll));
  const index = Math.floor(normalized * 100);
  const prize = DHANTERAS_WHEEL_PRIZES.find(
    (candidate) => index >= candidate.firstIndex && index < candidate.firstIndex + candidate.count,
  ) ?? DHANTERAS_WHEEL_PRIZES[0];
  return { ...prize, index };
};