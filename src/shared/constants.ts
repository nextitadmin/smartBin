export const CacheKeys = {
  AgentLoginCode: (code: string) => `SMTBIN_${code}`,
  ResidentLoginCode: (code: string) => `SMTBIN_${code}`,
};
