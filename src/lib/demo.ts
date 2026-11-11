import type { FoodListing, FoodRequest, Profile, Role, Collection } from "./types";

export const demoProfiles: Profile[] = [
  { id: "school-1", organization_name: "Riverside Secondary School", organization_type: "school", email: "school@demo.sg", phone: "+65 6123 4567", address: "123 River Valley Road, Singapore", verified: true },
  { id: "charity-1", organization_name: "Community Table SG", organization_type: "charity", email: "charity@demo.sg", phone: "+65 6234 5678", address: "45 Jalan Besar, Singapore", verified: true },
  { id: "admin-1", organization_name: "FoodBridge Admin", organization_type: "admin", email: "admin@demo.sg", verified: true }
];
const now = Date.now();
export const initialListings: FoodListing[] = [
  { id:"food-1", school_id:"school-1", school_name:"Riverside Secondary School", food_name:"Vegetarian fried rice", category:"Rice & noodles", total_quantity:50, unit:"portions", description:"Freshly prepared vegetarian fried rice, packed in sealed catering trays.", allergens:"Soy; may contain egg", preparation_time:new Date(now-3600000).toISOString(), collection_deadline:new Date(now+5*3600000).toISOString(), storage_instructions:"Keep hot above 60°C; transport in insulated containers.", status:"available", created_at:new Date(now-1800000).toISOString() },
  { id:"food-2", school_id:"school-1", school_name:"Riverside Secondary School", food_name:"Seasonal fruit cups", category:"Fruit", total_quantity:36, unit:"cups", description:"Assorted cut fruit in individual sealed cups.", allergens:"None declared", preparation_time:new Date(now-1800000).toISOString(), collection_deadline:new Date(now+3*3600000).toISOString(), storage_instructions:"Keep chilled below 5°C.", status:"available", created_at:new Date(now-900000).toISOString() },
  { id:"food-3", school_id:"school-2", school_name:"Hillview Primary School", food_name:"Vegetable pasta", category:"Prepared meals", total_quantity:40, unit:"portions", description:"Tomato and vegetable pasta in covered trays.", allergens:"Contains wheat; may contain dairy", preparation_time:new Date(now-2700000).toISOString(), collection_deadline:new Date(now+4*3600000).toISOString(), storage_instructions:"Keep hot above 60°C.", status:"available", created_at:new Date(now-1200000).toISOString() }
];
export const initialRequests: FoodRequest[] = [
  { id:"req-1", listing_id:"food-1", charity_id:"charity-1", charity_name:"Community Table SG", requested_quantity:10, approved_quantity:10, status:"approved", created_at:new Date(now-600000).toISOString() },
  { id:"req-2", listing_id:"food-2", charity_id:"charity-1", charity_name:"Community Table SG", requested_quantity:8, approved_quantity:0, status:"pending", created_at:new Date(now-300000).toISOString() }
];
export const initialCollections: Collection[] = [
  { id:"col-1", request_id:"req-1", listing_id:"food-1", food_name:"Vegetarian fried rice", school_name:"Riverside Secondary School", charity_name:"Community Table SG", collection_address:"123 River Valley Road, Singapore", collection_time:new Date(now+2*3600000).toISOString(), contact_person:"Cafeteria coordinator", contact_phone:"+65 6123 4567", notes:"Use the service entrance. Bring insulated food carriers.", status:"confirmed" }
];
export const roleHome = (role: Role) => `/${role}/dashboard`;
export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  // The README suggests copying .env.example to .env.local. Those template
  // values are placeholders, not usable credentials, so keep demo mode active.
  if (!url || !key) return false;
  if (url.includes("YOUR_PROJECT") || key.includes("YOUR_SUPABASE_ANON_KEY")) return false;
  if (!url.startsWith("https://") || !url.includes(".supabase.co")) return false;
  return true;
}
