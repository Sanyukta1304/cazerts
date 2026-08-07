"use client";

import { motion } from "framer-motion";
import { MapPin, Clock, Phone } from "lucide-react";

const stores = [
  {
    name: "CAZERTS - BTM Layout",
    address: "BTM Layout, Bengaluru, Karnataka 560068",
    hours: "2:00 PM - 12:00 AM",
    phone: "+91 90000 00003",
  },
  {
    name: "CAZERTS - Indiranagar",
    address: "100 Feet Road, Indiranagar, Bengaluru, Karnataka 560038",
    hours: "2:00 PM - 12:00 AM",
    phone: "+91 90000 00001",
  },
  {
    name: "CAZERTS - Koramangala",
    address: "5th Block, Koramangala, Bengaluru, Karnataka 560095",
    hours: "2:00 PM - 12:00 AM",
    phone: "+91 90000 00002",
  },
];

export default function LocationsPage() {
  return (
    <div className="pt-28 pb-16 bg-cream min-h-screen">
      <div className="container-max px-6 md:px-12 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="text-magenta uppercase tracking-[0.25em] text-xs font-semibold mb-3">
            Find Us
          </p>
          <h1 className="text-3xl md:text-5xl font-extrabold text-black">
            Our Locations
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stores.map((store, i) => (
            <motion.div
              key={store.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white rounded-3xl p-7 shadow-card hover:shadow-premium transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-full bg-magenta/10 flex items-center justify-center mb-5">
                <MapPin size={22} className="text-magenta" />
              </div>
              <h3 className="font-bold text-lg text-black mb-3">
                {store.name}
              </h3>
              <div className="space-y-3 text-sm text-black/60">
                <div className="flex items-start gap-2">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-magenta" />
                  <span>{store.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="shrink-0 text-magenta" />
                  <span>{store.hours}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={16} className="shrink-0 text-magenta" />
                  <span>{store.phone}</span>
                </div>
              </div>
              <a href={`https://maps.google.com/?q=${encodeURIComponent(store.address)}`} target="_blank" rel="noopener noreferrer" className="mt-6 inline-block w-full text-center bg-magenta text-white font-semibold text-sm px-5 py-3 rounded-full hover:bg-magenta-dark transition-colors">
                Get Directions
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}