export const DAILY_GROUP_LIMIT = 4;

export const MAX_PARTY_SIZE = 8;

export const MIN_PARTY_SIZE = 1;

export function isValidPartySize(value: number) {
  return Number.isInteger(value) && value >= MIN_PARTY_SIZE && value <= MAX_PARTY_SIZE;
}