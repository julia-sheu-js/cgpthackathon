"use client";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/shell";
import { demoProfiles } from "@/lib/demo";
export default function Schools(){const {role}=useParams<{role:string}>();return <AppShell role="admin"><div className="page-header"><div><div className="eyebrow-small">Network management</div><h1>School partners</h1><p>Organizations participating in FoodBridge.</p></div></div><div className="panel"><table><thead><tr><th>School</th><th>Email</th><th>Address</th><th>Verification</th></tr></thead><tbody>{demoProfiles.filter(p=>p.organization_type==="school").map(p=><tr key={p.id}><td><strong>{p.organization_name}</strong></td><td>{p.email}</td><td>{p.address}</td><td><span className="status">Verified</span></td></tr>)}</tbody></table></div></AppShell>}
