import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
export const metadata: Metadata = { title: "FoodBridge — Good food, shared better", description: "Connecting Singapore schools with charities to redistribute safe surplus food." };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en"><body><Providers>{children}</Providers></body></html>; }
