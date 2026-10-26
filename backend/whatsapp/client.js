// Socket construction is centralized in session-manager.js to prevent accidental duplicate sessions.
export { requestPairing, getSession, safeStatus, disconnectSession } from './session-manager.js';
