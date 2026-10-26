import Link from 'next/link';
export function Nav(){return <header className="nav"><Link className="brand" href="/">KARNAIN <span>MD</span></Link><nav className="navlinks"><Link href="/connect">Connect</Link><Link href="/dashboard">Dashboard</Link><Link href="/docs">Docs</Link></nav></header>}
export function Footer(){return <footer className="footer"><span>© 2026 KARNAIN MD · Version 1.0.0</span><span><Link href="/privacy">Privacy</Link>　·　<Link href="/terms">Terms</Link></span></footer>}
export function Layout({children}:{children:React.ReactNode}){return <div className="shell"><Nav/>{children}<Footer/></div>}
