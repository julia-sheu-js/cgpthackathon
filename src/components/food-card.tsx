"use client";
import { useState } from "react";
import { Clock3, MapPin, Package, ArrowUpRight } from "lucide-react";
import type { FoodListing, FoodRequest } from "@/lib/types";
import { Pill } from "./ui";
import { useFoodBridge } from "./providers";
export function FoodCard({listing,mode="browse"}:{listing:FoodListing;mode?:"browse"|"manage"}){
 const {requests,requestFood}=useFoodBridge(); const [qty,setQty]=useState("5"); const [message,setMessage]=useState("");
 const approved=requests.filter(r=>r.listing_id===listing.id&&r.status==="approved").reduce((s,r)=>s+r.approved_quantity,0);
 const remaining=Math.max(0,listing.total_quantity-approved),percent=listing.total_quantity?Math.min(100,approved/listing.total_quantity*100):0;
 const deadline=new Date(listing.collection_deadline);
 function submit(){try{requestFood(listing.id,Number(qty));setMessage("Request sent to the school for approval.");}catch(e){setMessage(e instanceof Error?e.message:"Could not submit request.");}}
 return <article className="food-card"><div className="food-card-top"><div className="food-icon"><Package size={21}/></div><Pill tone={remaining?"green":"gray"}>{remaining?"Available":"Fully claimed"}</Pill></div><div className="food-category">{listing.category}</div><h3>{listing.food_name}</h3><p className="food-school">{listing.school_name}</p><p className="food-description">{listing.description||"Surplus food available for community redistribution."}</p><div className="inventory-line"><span>Claimed</span><b>{approved} / {listing.total_quantity} {listing.unit}</b></div><div className="progress-track"><div className="progress-fill" style={{width:`${percent}%`}}/></div><div className="progress-caption"><span>{Math.round(percent)}% claimed</span><b>{remaining} {listing.unit} left</b></div><div className="food-meta"><span><Clock3 size={14}/> Collect by {deadline.toLocaleTimeString("en-SG",{hour:"numeric",minute:"2-digit"})}</span><span><MapPin size={14}/> Singapore</span></div>{mode==="browse"&&remaining>0&&<div className="request-row"><input aria-label="Quantity to request" type="number" min="1" max={remaining} value={qty} onChange={e=>setQty(e.target.value)}/><button className="btn btn-primary" onClick={submit}>Request food <ArrowUpRight size={15}/></button></div>}{message&&<p className="inline-message">{message}</p>}{mode==="manage"&&<p className="manage-note">Your organization’s listing</p>}</article>
}
