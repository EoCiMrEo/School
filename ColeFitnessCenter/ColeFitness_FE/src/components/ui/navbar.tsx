import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LoginModal from "./login-modal";

export default function Navbar() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  return (
    <header className="bg-white text-primary-foreground py-4 sm:py-6 shadow-md fixed w-full z-50">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="text-xl sm:text-2xl font-bold">
          Cole's Fitness Club 🌿
        </div>

        {/* Desktop Links */}
        <nav className="hidden md:flex space-x-4 justify-center items-center">
          <Link href="#memberships" className="hover:underline">
            Memberships
          </Link>
          <Link href="#locations" className="hover:underline">
            Locations
          </Link>
          <Button
            variant="default"
            className="bg-emerald-700 text-white hover:bg-emerald-600"
          >
            <Link href="/members/registration">Join Now</Link>
          </Button>
          <LoginModal></LoginModal>
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button onClick={toggleDrawer} aria-label="Toggle menu">
            {isDrawerOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Background Overlay */}
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleDrawer}
            />

            {/* Drawer */}
            <motion.div
              className="fixed top-0 right-0 w-3/4 max-w-xs bg-white text-primary-foreground h-full shadow-lg z-50 p-4"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-8">
                <div className="text-xl font-bold">Cole's Fitness Club 🌿</div>
                <button onClick={toggleDrawer} aria-label="Close menu">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="flex flex-col space-y-4">
                <Link
                  href="#memberships"
                  onClick={toggleDrawer}
                  className="hover:underline"
                >
                  Memberships
                </Link>
                <Link
                  href="#locations"
                  onClick={toggleDrawer}
                  className="hover:underline"
                >
                  Locations
                </Link>
                <Button
                  variant="default"
                  className="bg-emerald-700 text-white hover:bg-emerald-600 w-full"
                  onClick={toggleDrawer}
                >
                  <Link href="/members/registration">Join Now</Link>
                </Button>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
