import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import pino from 'pino';
import authRoutes from './api/routes/auth.js';
import whatsappRoutes from './api/routes/whatsapp.js';
import {requireSameOrigin} from './middleware/auth.js';
const log=pino(); const app=express();
app.disable('x-powered-by'); app.use(helmet());
app.use(cors({origin:process.env.FRONTEND_ORIGIN||'http://localhost:3000',credentials:true}));
app.use(express.json({limit:'32kb'}));app.use(cookieParser());app.use(requireSameOrigin);
app.get('/api/health',(_req,res)=>res.json({ok:true,service:'karnain-md-backend',time:new Date().toISOString()}));
app.use('/api/auth',authRoutes);app.use('/api/whatsapp',whatsappRoutes);
app.use((err,req,res,_next)=>{log.error({err, path:req.path},'request error');res.status(500).json({error:'Internal server error'});});
const port=Number(process.env.PORT||4000);const server=app.listen(port,()=>log.info(`KARNAIN MD API listening on ${port}`));
async function shutdown(){log.info('Shutting down');server.close(()=>process.exit(0));setTimeout(()=>process.exit(1),10000).unref();}
process.on('SIGTERM',shutdown);process.on('SIGINT',shutdown);
