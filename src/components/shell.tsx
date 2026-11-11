"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, ChevronDown, CircleHelp, ClipboardList, HandHeart, LayoutDashboard, LogOut, Package, Settings, ShieldCheck, Truck, Users, Utensils, Plus, School } from "lucide-react";
import { Brand } from "./ui";
import { useFoodBridge } from "./providers";
import type { Role } from "@/lib/types";
const nav:Record<Role,{label:string;href:string;icon:any}[]> = {
 school:[{label:"Overview",href:"/school/dashboard",icon:LayoutDashboard},{label:"My food listings",href:"/school/listings",icon:Package},{label:"Create a listing",href:"/school/listings/new",icon:Plus},{label:"Charity requests",href:"/school/requests",icon:HandHeart},{label:"Collections",href:"/school/collections",icon:Truck},{label:"Organization profile",href:"/school/settings",icon:Settings}],
 charity:[{label:"Overview",href:"/charity/dashboard",icon:LayoutDashboard},{label:"Browse available food",href:"/charity/listings",icon:Utensils},{label:"My requests",href:"/charity/requests",icon:ClipboardList},{label:"Collections",href:"/charity/collections",icon:Truck},{label:"Organization profile",href:"/charity/settings",icon:Settings}],
 admin:[{label:"Overview",href:"/admin/dashboard",icon:LayoutDashboard},{label:"Schools",href:"/admin/schools",icon:School},{label:"Charities",href:"/admin/charities",icon:HandHeart},{label:"All food listings",href:"/admin/listings",icon:Package},{label:"Requests",href:"/admin/requests",icon:ClipboardList},{label:"Collections",href:"/admin/collections",icon:Truck},{label:"Analytics",href:"/admin/analytics",icon:Users}]
};
export function AppShell({children,role}:{children:React.ReactNode;role:Role}){
 const path=usePathname(),router=useRouter(),{profile,signOut}=useFoodBridge();
 const org=profile?.organization_name || (role==="school"?"School workspace":role==="charity"?"Charity workspace":"Platform admin");
 return <div className="app-shell"><aside className="sidebar"><div className="side-brand"><Brand/></div><div className="workspace-label">WORKSPACE</div><div className="workspace-switch"><span className="workspace-avatar">{role==="school"?"S":role==="charity"?"C":"A"}</span><span><b>{org}</b><small>{role==="school"?"School partner":role==="charity"?"Charity partner":"Administrator"}</small></span><ChevronDown size={15}/></div><nav className="side-nav">{nav[role].map(item=>{const Icon=item.icon;return <Link key={item.href} href={item.href} className={path===item.href?"active":""}><Icon size={17}/>{item.label}</Link>})}</nav><div className="sidebar-bottom"><Link href="/contact"><CircleHelp size={17}/> Help & support</Link><button onClick={()=>{signOut();router.push("/login")}}><LogOut size={17}/> Sign out</button><div className="user-mini"><span className="user-avatar">{org.slice(0,1)}</span><span><b>{profile?.email||"demo@foodbridge.sg"}</b><small>{role} account</small></span></div></div></aside><main className="main-area"><header className="topbar"><div className="breadcrumb">Workspace <span>/</span> {role[0].toUpperCase()+role.slice(1)}</div><div className="top-actions"><span className="live-dot"/> Live workspace <button className="icon-button" aria-label="Notifications"><Bell size={18}/></button></div></header><div className="page-content">{children}</div></main></div>
}
