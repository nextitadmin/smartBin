export const CacheKeys = {
  AgentLoginCode: (code: string) => `SMTBIN_AG_${code}`,
  ResidentLoginCode: (code: string) => `SMTBIN_RS_${code}`,
  FacilityManagerLoginCode: (code: string) => `SMTBIN_FM_${code}`,
  CorporateLoginCode: (code: string) => `SMTBIN_CM_${code}`,
};

export const AdminMessagePatternCommands = Object.freeze({
  Users: {
    GetUsers: 'GET_USERS',
    GetUser: 'GET_USER',
    GetFacilityUsers: 'GET_FACILITY_USERS',
    GetAgentRegisteredUsers: 'GET_AGENT_REGISTERED_USERS',

  },
  Smartbin: {
    GetOverview: 'GET_OVERVIEW',
    GetDelivered: "GET_DELIVERED_BINS",
    GetApplications: 'GET_ALL_APPLICATIONS',
    GetApplicationDetails: 'APPLICATION_DETAILS',
  },
});
