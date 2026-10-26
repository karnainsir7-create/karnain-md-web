import fs from 'node:fs';
import path from 'node:path';
import pino from 'pino';
import { default as makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';

const logger=pino({level: process.env.NODE_ENV==='production'?'warn':'info'});
const sessions=new Map();
const authRoot=path.resolve(process.env.WHATSAPP_AUTH_DIR || './data/whatsapp-auth');
fs.mkdirSync(authRoot,{recursive:true,mode:0o700});
const maskPhone=(p)=>p.length>5?`${p.slice(0,3)}••••${p.slice(-2)}`:'••••';

export function getSession(ownerId){ return sessions.get(ownerId) || {status:'DISCONNECTED',phoneMasked:null,connectedAt:null,lastError:null}; }
export async function requestPairing(ownerId, phone){
  let current=sessions.get(ownerId);
  if(current?.status==='CONNECTED') throw new Error('A WhatsApp session is already connected. Disconnect it first.');
  if(current?.socket) { try { current.socket.end(undefined); } catch {} }
  const authDir=path.join(authRoot, ownerId.replace(/[^a-zA-Z0-9_-]/g,'_'));
  fs.mkdirSync(authDir,{recursive:true,mode:0o700});
  const {state,saveCreds}=await useMultiFileAuthState(authDir);
  const {version}=await fetchLatestBaileysVersion();
  const entry={status:'GENERATING_PAIRING_CODE',phoneMasked:maskPhone(phone),connectedAt:null,lastError:null,pairingCode:null,socket:null,updatedAt:Date.now()};
  sessions.set(ownerId,entry);
  const sock=makeWASocket({version,auth:state,logger:logger.child({ownerId}),printQRInTerminal:false,browser:['KARNAIN MD','Chrome','1.0.0'],syncFullHistory:false,markOnlineOnConnect:false});
  entry.socket=sock;
  sock.ev.on('creds.update',saveCreds);
  sock.ev.on('connection.update',({connection,lastDisconnect})=>{
    if(connection==='open'){entry.status='CONNECTED';entry.connectedAt=new Date().toISOString();entry.pairingCode=null;entry.lastError=null;entry.updatedAt=Date.now();}
    else if(connection==='connecting'){if(entry.status!=='WAITING_FOR_LINKING') entry.status='GENERATING_PAIRING_CODE';}
    else if(connection==='close'){
      const code=lastDisconnect?.error?.output?.statusCode;
      entry.status=code===DisconnectReason.loggedOut?'DISCONNECTED':'CONNECTION_ERROR';
      entry.lastError=code===DisconnectReason.loggedOut?'WhatsApp session logged out':'Connection closed; request a new pairing if needed';
      entry.socket=null;entry.updatedAt=Date.now();
      if(code===DisconnectReason.loggedOut){try{fs.rmSync(authDir,{recursive:true,force:true});}catch{}}
    }
  });
  // Allow the socket to initialize before requesting a pairing code.
  await new Promise(r=>setTimeout(r,1200));
  if(!sock.authState.creds.registered){
    try { entry.pairingCode=await sock.requestPairingCode(phone); entry.status='WAITING_FOR_LINKING'; }
    catch(err){entry.status='CONNECTION_ERROR';entry.lastError='WhatsApp did not issue a pairing code. Try again later.';entry.socket=null;try{sock.end(err)}catch{};throw new Error(entry.lastError);}
  } else { entry.status='GENERATING_PAIRING_CODE'; }
  entry.updatedAt=Date.now();
  return {status:entry.status,pairingCode:entry.pairingCode,phoneMasked:entry.phoneMasked};
}
export async function disconnectSession(ownerId){
  const entry=sessions.get(ownerId);
  if(entry?.socket){try{await entry.socket.logout();}catch{try{entry.socket.end(undefined)}catch{}}}
  const dir=path.join(authRoot,ownerId.replace(/[^a-zA-Z0-9_-]/g,'_'));
  try{fs.rmSync(dir,{recursive:true,force:true});}catch{}
  sessions.set(ownerId,{status:'DISCONNECTED',phoneMasked:null,connectedAt:null,lastError:null,updatedAt:Date.now()});
  return getSession(ownerId);
}
export function safeStatus(ownerId){const s=getSession(ownerId);return {status:s.status,phoneMasked:s.phoneMasked,connectedAt:s.connectedAt,lastError:s.lastError,updatedAt:s.updatedAt||null};}
