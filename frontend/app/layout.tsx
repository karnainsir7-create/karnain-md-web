import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'KARNAIN MD — WhatsApp Connector',description:'Secure WhatsApp Multi-Device pairing and bot dashboard.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="id"><body>{children}</body></html>}
