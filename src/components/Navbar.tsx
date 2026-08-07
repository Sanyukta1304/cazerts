"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, ShoppingCart, Heart, User, LogOut, ChevronDown, Crown, Trophy, Receipt } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { getCustomerCrowns } from "@/lib/orders";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Menu", href: "/menu" },
  { name: "About Us", href: "/about" },
  { name: "Locations", href: "/locations" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [crowns, setCrowns] = useState<number | null>(null);
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, isLoggedIn, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isHomepage = pathname === "/";
  const isSolid = scrolled || !isHomepage;
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isLoggedIn && user?.phone) {
      getCustomerCrowns(user.phone)
        .then((result) => setCrowns(result.crowns))
        .catch(() => setCrowns(0));
    } else {
      setCrowns(null);
    }
  }, [isLoggedIn, user?.phone]);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    router.push("/");
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isSolid ? "glass shadow-card py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="container-max flex items-center justify-between px-6 md:px-12 lg:px-20">
        <Link
          href="/"
          className={`text-2xl font-extrabold tracking-tight transition-colors ${
            isSolid ? "text-magenta" : "text-white"
          }`}
        >
          CAZERTS
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-magenta ${
                isSolid ? "text-black/80" : "text-white/90"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-5">
          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className={`relative transition-colors hover:text-magenta ${
              isSolid ? "text-black" : "text-white"
            }`}
          >
            <Heart size={20} />
            <span className="absolute -top-2 -right-2 bg-magenta text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
              {wishlistCount}
            </span>
          </Link>
          <Link
            href="/cart"
            aria-label="Cart"
            className={`relative transition-colors hover:text-magenta ${
              isSolid ? "text-black" : "text-white"
            }`}
          >
            <ShoppingCart size={20} />
            <span className="absolute -top-2 -right-2 bg-magenta text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
              {cartCount}
            </span>
          </Link>

          {/* Profile / Account - always last */}
          {isLoggedIn ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-1.5"
                aria-label="Profile menu"
              >
                <span className="w-8 h-8 rounded-full overflow-hidden bg-magenta/10 flex items-center justify-center">
                  {user?.avatarId ? (
                    <img
                      src={`/avatars/${user.avatarId}.jpg`}
                      alt="Your avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={16} className="text-magenta" />
                  )}
                </span>
                <ChevronDown
                  size={14}
                  className={`transition-colors ${isSolid ? "text-black" : "text-white"}`}
                />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-3 w-56 bg-white rounded-2xl shadow-premium py-2 z-50">
                  <div className="px-4 py-3 border-b border-black/5">
                    <p className="font-semibold text-black text-sm truncate">
                      {user?.name || "CAZERTS Customer"}
                    </p>
                    <p className="text-black/40 text-xs">{user?.phone}</p>
                  </div>

                  <div className="px-4 py-3 border-b border-black/5 flex items-center gap-2">
                    <Crown size={16} className="text-gold" />
                    <span className="text-sm font-semibold text-black">
                      {crowns === null ? "..." : crowns} Crowns
                    </span>
                  </div>

                  <Link
                    href="/leaderboard"
                    onClick={() => setProfileOpen(false)}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-black/70 hover:bg-black/5 transition-colors"
                  >
                    <Trophy size={15} />
                    Leaderboard
                  </Link>

                  <Link
                    href="/order-history"
                    onClick={() => setProfileOpen(false)}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-black/70 hover:bg-black/5 transition-colors border-b border-black/5"
                  >
                    <Receipt size={15} />
                    Order History
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={15} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              aria-label="Account"
              className={`transition-colors hover:text-magenta ${
                isSolid ? "text-black" : "text-white"
              }`}
            >
              <User size={20} />
            </Link>
          )}
        </div>

        <button
          className={`md:hidden transition-colors ${
            isSolid ? "text-black" : "text-white"
          }`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden fixed inset-x-4 top-20 z-50 bg-white rounded-2xl shadow-2xl p-6 flex flex-col gap-4 max-h-[calc(100vh-6rem)] overflow-y-auto">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="text-base font-medium text-black/80 hover:text-magenta transition-colors"
            >
              {link.name}
            </Link>
          ))}
          {isLoggedIn ? (
            <>
              <div className="flex items-center gap-2 text-sm text-black/60">
                <Crown size={15} className="text-gold" />
                {crowns === null ? "..." : crowns} Crowns
              </div>
              <Link
                href="/leaderboard"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 text-base font-medium text-black/80 hover:text-magenta transition-colors"
              >
                <Trophy size={16} />
                Leaderboard
              </Link>
              <Link
                href="/order-history"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 text-base font-medium text-black/80 hover:text-magenta transition-colors"
              >
                <Receipt size={16} />
                Order History
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileOpen(false);
                }}
                className="flex items-center gap-2 text-base font-medium text-red-500"
              >
                <LogOut size={16} />
                Logout ({user?.name || "Account"})
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="text-base font-medium text-black/80 hover:text-magenta transition-colors"
            >
              Login / Sign Up
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}