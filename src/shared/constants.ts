export const CacheKeys = {
  AgentLoginCode: (code: string) => `SMTBIN_AG_${code}`,
  ResidentLoginCode: (code: string) => `SMTBIN_RS_${code}`,
  FacilityManagerLoginCode: (code: string) => `SMTBIN_FM_${code}`,
  CorporateLoginCode: (code: string) => `SMTBIN_CM_${code}`,
};

export const AdminMessagePatternCommands = Object.freeze({
  Smartbin: {
    GetOverview: 'GET_OVERVIEW',
    GetDelivered: "GET_DELIVERED_BINS",
    GetApplications: 'GET_ALL_APPLICATIONS',
    GetApplicationDetails: 'APPLICATION_DETAILS',
  },
});
