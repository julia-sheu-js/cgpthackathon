"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { demoProfiles, initialCollections, initialListings, initialRequests, isSupabaseConfigured } from "@/lib/demo";
import type { Collection, FoodListing, FoodRequest, Profile, Role } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

type Store = {
  profile: Profile | null; listings: FoodListing[]; requests: FoodRequest[]; collections: Collection[];
  signIn: (email:string,password:string,role?:Role)=>Promise<void>;
  signOut: ()=>void; createListing:(data:Partial<FoodListing>)=>void;
  requestFood:(listingId:string,quantity:number)=>void;
  decideRequest:(id:string,approve:boolean,quantity?:number)=>void;
  updateCollection:(id:string,patch:Partial<Collection>)=>void;
};
const Ctx = createContext<Store | null>(null);
const read = <T,>(key:string, fallback:T):T => { if(typeof window==="undefined") return fallback; try { const x=localStorage.getItem(key); return x?JSON.parse(x):fallback; } catch { return fallback; } };
export function Providers({children}:{children:React.ReactNode}) {
  const [profile,setProfile] = useState<Profile|null>(null);
  const [listings,setListings] = useState<FoodListing[]>(initialListings);
  const [requests,setRequests] = useState<FoodRequest[]>(initialRequests);
  const [collections,setCollections] = useState<Collection[]>(initialCollections);
  useEffect(()=>{
    setListings(read("fb-listings",initialListings)); setRequests(read("fb-requests",initialRequests)); setCollections(read("fb-collections",initialCollections));
    const saved=read<Profile|null>("fb-profile",null); if(saved) setProfile(saved);
    const supabase=createClient();
    if(supabase){ supabase.auth.getUser().then(async ({data})=>{ if(data.user){ const {data:p}=await supabase.from("profiles").select("*").eq("id",data.user.id).single(); if(p) setProfile({id:p.id,organization_name:p.organization_name,organization_type:p.organization_type,email:p.email,phone:p.phone,address:p.address,verified:p.verified}); }}); }
  },[]);
  useEffect(()=>{ localStorage.setItem("fb-listings",JSON.stringify(listings)); },[listings]);
  useEffect(()=>{ localStorage.setItem("fb-requests",JSON.stringify(requests)); },[requests]);
  useEffect(()=>{ localStorage.setItem("fb-collections",JSON.stringify(collections)); },[collections]);
  useEffect(()=>{ if(profile) localStorage.setItem("fb-profile",JSON.stringify(profile)); else localStorage.removeItem("fb-profile"); },[profile]);
  const value=useMemo<Store>(()=>({
    profile,listings,requests,collections,
    async signIn(email,password,role){
      const supabase=createClient();
      if(supabase){
        const {data,error}=await supabase.auth.signInWithPassword({email,password}); if(error) throw error;
        const {data:p,error:pe}=await supabase.from("profiles").select("*").eq("id",data.user.id).single(); if(pe) throw pe;
        setProfile({id:p.id,organization_name:p.organization_name,organization_type:p.organization_type,email:p.email,phone:p.phone,address:p.address,verified:p.verified}); return;
      }
      const selected=role || (email.startsWith("school")?"school":email.startsWith("admin")?"admin":"charity");
      const found=demoProfiles.find(p=>p.organization_type===selected)!;
      setProfile({...found,email:email||found.email});
    },
    signOut(){ const supabase=createClient(); supabase?.auth.signOut(); setProfile(null); },
    createListing(data){
      const p=profile; if(!p||p.organization_type!=="school") return;
      const row:FoodListing={id:crypto.randomUUID(),school_id:p.id,school_name:p.organization_name,food_name:data.food_name||"Untitled food",category:data.category||"Other",total_quantity:Number(data.total_quantity)||1,unit:data.unit||"portions",description:data.description||"",allergens:data.allergens||"",preparation_time:data.preparation_time||new Date().toISOString(),collection_deadline:data.collection_deadline||new Date(Date.now()+4*3600000).toISOString(),storage_instructions:data.storage_instructions||"",status:"available",created_at:new Date().toISOString()};
      setListings(old=>[row,...old]);
      const supabase=createClient(); if(supabase) supabase.from("food_listings").insert({school_id:p.id,food_name:row.food_name,category:row.category,total_quantity:row.total_quantity,unit:row.unit,description:row.description,allergens:row.allergens,preparation_time:row.preparation_time,collection_deadline:row.collection_deadline,storage_instructions:row.storage_instructions}).then(()=>{});
    },
    requestFood(listingId,quantity){
      if(!profile||profile.organization_type!=="charity"||quantity<=0) return;
      const listing=listings.find(l=>l.id===listingId); if(!listing) return;
      const claimed=requests.filter(r=>r.listing_id===listingId&&r.status==="approved").reduce((s,r)=>s+r.approved_quantity,0);
      if(quantity>listing.total_quantity-claimed) throw new Error("That quantity is no longer available.");
      const row:FoodRequest={id:crypto.randomUUID(),listing_id:listingId,charity_id:profile.id,charity_name:profile.organization_name,requested_quantity:quantity,approved_quantity:0,status:"pending",created_at:new Date().toISOString()};
      setRequests(old=>[row,...old]);
      const supabase=createClient(); if(supabase) supabase.from("food_requests").insert({listing_id:listingId,charity_id:profile.id,requested_quantity:quantity}).then(()=>{});
    },
    decideRequest(id,approve,quantity){
      const target=requests.find(r=>r.id===id); if(!target) return;
      const listing=listings.find(l=>l.id===target.listing_id); if(!listing) return;
      const already=requests.filter(r=>r.listing_id===target.listing_id&&r.status==="approved"&&r.id!==id).reduce((s,r)=>s+r.approved_quantity,0);
      const approved=Math.min(quantity??target.requested_quantity,listing.total_quantity-already);
      if(approve&&approved<=0) throw new Error("No inventory remains.");
      setRequests(old=>old.map(r=>r.id===id?{...r,status:approve?"approved":"declined",approved_quantity:approve?approved:0}:r));
      const supabase=createClient(); if(supabase) supabase.from("food_requests").update({status:approve?"approved":"declined",approved_quantity:approve?approved:0}).eq("id",id).then(()=>{});
    },
    updateCollection(id,patch){ setCollections(old=>old.map(c=>c.id===id?{...c,...patch}:c)); }
  }),[profile,listings,requests,collections]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useFoodBridge(){ const value=useContext(Ctx); if(!value) throw new Error("Providers missing"); return value; }
