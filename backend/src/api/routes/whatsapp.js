import {Router} from 'express';
import {z} from 'zod';
import {requireAuth} from '../../middleware/auth.js';
import {requestPairing,safeStatus,disconnectSession} from '../../whatsapp/session-manager.js';
const router=Router();
const attempts=new Map();
const phoneSchema=z.string().regex(/^\d{8,15}$/,'Use international format digits only, e.g. 628123456789');
router.use(requireAuth);
router.post('/pair',async(req,res)=>{
  const parsed=phoneSchema.safeParse(String(req.body?.phone||'').replace(/[\s()+-]/g,''));
  if(!parsed.success)return res.status(400).json({error:parsed.error.issues[0]?.message||'Invalid phone number'});
  const key=req.user.sub; const now=Date.now(); const a=attempts.get(key)||{times:[],last:0};
  a.times=a.times.filter(t=>now-t<3600000);
  if(now-a.last<Number(process.env.PAIR_COOLDOWN_SECONDS||60)*1000)return res.status(429).json({error:'Please wait before requesting another pairing code.'});
  if(a.times.length>=Number(process.env.MAX_PAIR_ATTEMPTS_PER_HOUR||5))return res.status(429).json({error:'Pairing attempt limit reached for this hour.'});
  a.last=now;a.times.push(now);attempts.set(key,a);
  try{res.json(await requestPairing(key,parsed.data));}catch(e){res.status(502).json({error:e.message||'Pairing failed'});}
});
router.get('/status',(req,res)=>res.json(safeStatus(req.user.sub)));
router.post('/disconnect',async(req,res)=>{try{res.json(await disconnectSession(req.user.sub));}catch{res.status(500).json({error:'Unable to disconnect session'});}});
export default router;
