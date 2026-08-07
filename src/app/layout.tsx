import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileCartBar from "@/components/MobileCartBar";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { ReviewsProvider } from "@/context/ReviewsContext";
import { AuthProvider } from "@/context/AuthContext";


const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "CAZERTS | Every Bite, A Celebration",
  description:
    "CAZERTS is a premium dessert brand specializing in handcrafted sundaes, signature cake cans, brownies, cheesecakes, waffles, milkshakes, coffee, and indulgent chocolate desserts.",
  keywords: [
    "CAZERTS",
    "premium desserts",
    "cake cans",
    "sundaes",
    "cheesecakes",
    "dessert brand",
    "order desserts online",
  ],
  openGraph: {
    title: "CAZERTS | Every Bite, A Celebration",
    description:
      "Premium handcrafted sundaes, cake cans, waffles, cheesecakes, brownies and signature chocolate desserts.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${plusJakarta.variable} font-sans antialiased bg-cream text-black`}>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <ReviewsProvider>
                <Navbar />
                <main>{children}</main>
                <Footer />
                <MobileCartBar />
              </ReviewsProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}