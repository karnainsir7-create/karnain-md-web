import jwt from 'jsonwebtoken';
export function requireAuth(req,res,next){
  const token=req.cookies?.karnain_session || (req.headers.authorization||'').replace(/^Bearer\s+/i,'');
  if(!token) return res.status(401).json({error:'Authentication required'});
  try { req.user=jwt.verify(token,process.env.AUTH_SECRET); next(); }
  catch { return res.status(401).json({error:'Session expired or invalid'}); }
}
export function requireSameOrigin(req,res,next){
  const origin=req.get('origin');
  if(origin && process.env.FRONTEND_ORIGIN && origin !== process.env.FRONTEND_ORIGIN) return res.status(403).json({error:'Origin not allowed'});
  next();
}
