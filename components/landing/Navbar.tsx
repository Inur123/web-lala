"use client";

import { useState, useEffect } from "react";
import { NAV_LINKS } from "@/constants/landing";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollToSection = (href: string) => {
    setIsMobileMenuOpen(false);
    const targetId = href.replace("#", "");
    const element = document.getElementById(targetId);
    
    if (element) {
      const offsetPosition = element.offsetTop - 70;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <header
      className={`fixed left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
        isScrolled
          ? "top-0 mx-auto max-w-full w-full bg-white/95 shadow-sm backdrop-blur-sm rounded-none"
          : "top-4 mx-auto max-w-6xl w-[90%] bg-white/80 shadow-md backdrop-blur-md rounded-[40px]"
      }`}
    >
      <div className={`mx-auto flex items-center justify-between transition-all duration-500 ease-in-out ${
        isScrolled ? "px-8 py-4" : "px-10 py-3.5"
      }`}>
        {/* Logo */}
        <span 
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} 
          className="flex flex-col leading-tight cursor-pointer select-none"
        >
          <span className="text-xs font-black tracking-wider text-[#1a4d2e]">
            LATIN-LATPEL
          </span>
          <span className="text-[8px] font-semibold text-gray-400 tracking-wider">
            PC IPNU IPPNU MAGETAN
          </span>
        </span>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link, i) => (
            <span
              key={`${link.href}-${i}`}
              onClick={() => handleScrollToSection(link.href)}
              className="text-[11px] font-bold text-gray-500 transition-colors duration-200 hover:text-[#1a4d2e] cursor-pointer select-none"
            >
              {link.label}
            </span>
          ))}
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleScrollToSection("#daftar")}
            className="hidden rounded-full bg-[#1a4d2e] px-6 py-2 text-[11px] font-bold text-white transition-all duration-200 hover:bg-[#0f2d1a] hover:shadow-md md:inline-flex cursor-pointer border-0"
          >
            Daftar
          </button>

          {/* Mobile Menu Button */}
          <button
            id="navbar-mobile-menu-btn"
            aria-label="Toggle mobile menu"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="text-gray-600 md:hidden hover:text-[#1a4d2e] cursor-pointer border-0 bg-transparent"
            type="button"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <nav
          className={`bg-white px-6 pb-6 pt-2 md:hidden transition-all duration-300 ${
            isScrolled ? "rounded-none" : "rounded-3xl mt-2 shadow-lg"
          }`}
          aria-label="Mobile navigation"
        >
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link, i) => (
              <li key={`${link.href}-${i}`}>
                <span
                  onClick={() => handleScrollToSection(link.href)}
                  className="block rounded-lg px-3 py-2 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50 hover:text-[#1a4d2e] cursor-pointer select-none"
                >
                  {link.label}
                </span>
              </li>
            ))}
            <li>
              <button
                onClick={() => handleScrollToSection("#daftar")}
                className="mt-2 block w-full rounded-full bg-[#1a4d2e] px-4 py-2 text-center text-xs font-semibold text-white cursor-pointer border-0"
              >
                Daftar
              </button>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
