// Keep command processing deliberately small and safe. Extend this module with your KARNAIN MD commands.
export async function handleIncomingMessage(sock, message) {
  const text=message.message?.conversation || message.message?.extendedTextMessage?.text || '';
  if(!text.startsWith('!')) return;
  const command=text.slice(1).trim().split(/\s+/)[0]?.toLowerCase();
  if(command==='ping' && message.key.remoteJid && !message.key.fromMe){
    await sock.sendMessage(message.key.remoteJid,{text:'KARNAIN MD aktif ✅'} ,{quoted:message});
  }
}
