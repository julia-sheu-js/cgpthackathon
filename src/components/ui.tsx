import Link from "next/link";
import { ArrowRight, Leaf } from "lucide-react";
export function Brand({light=false}:{light?:boolean}){return <Link href="/" className={`brand ${light?"brand-light":""}`}><span className="brand-icon"><Leaf size={19}/></span><span>foodbridge</span></Link>}
export function PublicNav(){return <header className="public-nav"><Brand/><nav><Link href="/about">Our mission</Link><Link href="/contact">Contact</Link><Link href="/login" className="nav-login">Log in</Link><Link href="/register" className="btn btn-primary btn-small">Join the network <ArrowRight size={15}/></Link></nav></header>}
export function Stat({value,label}:{value:string;label:string}){return <div className="stat"><strong>{value}</strong><span>{label}</span></div>}
export function Pill({children,tone="green"}:{children:React.ReactNode;tone?:string}){return <span className={`pill pill-${tone}`}>{children}</span>}
