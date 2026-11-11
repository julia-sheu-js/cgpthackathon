"use client";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/shell";
import { useFoodBridge } from "@/components/providers";
import { FoodCard } from "@/components/food-card";
import type { Role } from "@/lib/types";
export default function Listings(){const {role}=useParams<{role:Role}>();const {profile,listings}=useFoodBridge();if(!["school","charity","admin"].includes(role))return null;const rows=role==="school"?listings.filter(l=>l.school_id===profile?.id):listings;return <AppShell role={role}><div className="page-header"><div><div className="eyebrow-small">Food marketplace</div><h1>{role==="school"?"My food listings":"Available food"}</h1><p>{role==="school"?"Manage surplus food shared by your school.":"Browse surplus food shared by participating schools."}</p></div></div><div className="food-grid">{rows.map(l=><FoodCard key={l.id} listing={l} mode={role==="school"||role==="admin"?"manage":"browse"}/>)}</div>{!rows.length&&<div className="panel empty">No food listings found.</div>}</AppShell>}
