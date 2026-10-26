// Connection lifecycle is currently handled in session-manager.js.
// This file is reserved for persistent event/audit integration in the production deployment.
export const CONNECTION_STATES = Object.freeze(['DISCONNECTED','GENERATING_PAIRING_CODE','WAITING_FOR_LINKING','CONNECTED','CONNECTION_ERROR']);
