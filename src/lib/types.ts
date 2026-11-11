export type Role = "school" | "charity" | "admin";
export type ListingStatus = "available" | "fully_claimed" | "expired" | "cancelled";
export type RequestStatus = "pending" | "approved" | "declined" | "cancelled" | "completed";
export type Profile = { id: string; organization_name: string; organization_type: Role; email: string; phone?: string; address?: string; verified: boolean };
export type FoodListing = {
  id: string; school_id: string; school_name: string; food_name: string; category: string;
  total_quantity: number; unit: string; description: string; allergens: string;
  preparation_time: string; collection_deadline: string; storage_instructions: string;
  status: ListingStatus; created_at: string;
};
export type FoodRequest = { id: string; listing_id: string; charity_id: string; charity_name: string; requested_quantity: number; approved_quantity: number; status: RequestStatus; created_at: string };
export type Collection = { id: string; request_id: string; listing_id: string; food_name: string; school_name: string; charity_name: string; collection_address: string; collection_time: string; contact_person: string; contact_phone: string; notes: string; status: "proposed" | "confirmed" | "completed" | "cancelled" };
