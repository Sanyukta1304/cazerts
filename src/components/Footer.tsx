import Link from "next/link";
import { Instagram, MapPin, Phone, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black text-white pt-16 pb-8">
      <div className="container-max px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <h3 className="text-2xl font-extrabold text-magenta mb-3">CAZERTS</h3>
            <p className="text-white/60 text-sm leading-relaxed">
              Every Bite, A Celebration. Premium handcrafted desserts made for every moment worth celebrating.
            </p>
            <div className="flex gap-4 mt-5">
              <a href="https://www.instagram.com/cazerts/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-magenta transition-colors">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-gold">Quick Links</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/menu" className="hover:text-white transition-colors">Menu</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/locations" className="hover:text-white transition-colors">Locations</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-gold">Categories</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li>Sundaes</li>
              <li>Cake Cans</li>
              <li>Cheesecakes</li>
              <li>Milkshakes</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-gold">Get in Touch</h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li>
                <a href="https://maps.google.com/?q=Bengaluru,Karnataka,India" target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 hover:text-magenta transition-colors">
                  <MapPin size={16} className="mt-0.5 shrink-0" />
                  <span>Bengaluru, Karnataka, India</span>
                </a>
              </li>
              <li>
                <a href="tel:+910000000000" className="flex items-center gap-2 hover:text-magenta transition-colors">
                  <Phone size={16} className="shrink-0" />
                  <span>+91 00000 00000</span>
                </a>
              </li>
              <li>
                <a href="mailto:hello@cazerts.com" className="flex items-center gap-2 hover:text-magenta transition-colors">
                  <Mail size={16} className="shrink-0" />
                  <span>hello@cazerts.com</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-6 text-center text-white/40 text-xs">
          © {new Date().getFullYear()} CAZERTS. All rights reserved.
        </div>
      </div>
    </footer>
  );
}