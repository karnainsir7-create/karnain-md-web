import {Router} from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {z} from 'zod';
const router=Router();
const schema=z.object({email:z.email(),password:z.string().min(8).max(200)});
router.post('/login',async(req,res)=>{
  const data=schema.safeParse(req.body); if(!data.success)return res.status(400).json({error:'Email or password is invalid'});
  const email=process.env.ADMIN_EMAIL; const password=process.env.ADMIN_INITIAL_PASSWORD;
  if(!email||!password)return res.status(503).json({error:'Admin credentials are not configured'});
  // Bootstrap credential is compared safely; replace with database-backed account management before multi-user launch.
  const match=data.data.email.toLowerCase()===email.toLowerCase() && await bcrypt.compare(data.data.password, await bcrypt.hash(password,10));
  if(!match)return res.status(401).json({error:'Invalid email or password'});
  const token=jwt.sign({sub:'admin-owner',email},process.env.AUTH_SECRET,{expiresIn:'8h'});
  res.cookie('karnain_session',token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',maxAge:8*60*60*1000,path:'/'}).json({ok:true,email});
});
router.post('/logout',(req,res)=>res.clearCookie('karnain_session',{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/'}).json({ok:true}));
router.get('/me',(req,res)=>{const token=req.cookies?.karnain_session;if(!token)return res.status(401).json({error:'Not signed in'});try{const v=jwt.verify(token,process.env.AUTH_SECRET);res.json({email:v.email});}catch{res.status(401).json({error:'Session expired'});}});
export default router;
