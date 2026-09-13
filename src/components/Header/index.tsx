"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ThemeToggler from "./ThemeToggler";
import menuData from "./menuData";
import BrandLogo from "@/components/Common/BrandLogo";
import { ChevronDown } from "lucide-react";

const Header = () => {
  // Navbar toggle
  const [navbarOpen, setNavbarOpen] = useState(false);
  const navbarToggleHandler = () => {
    setNavbarOpen(!navbarOpen);
  };

  // Sticky Navbar
  const [sticky, setSticky] = useState(false);
  const handleStickyNavbar = () => {
    if (window.scrollY >= 80) {
      setSticky(true);
    } else {
      setSticky(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleStickyNavbar);
    return () => {
      window.removeEventListener("scroll", handleStickyNavbar);
    };
  }, []);

  // submenu handler
  const [openIndex, setOpenIndex] = useState<number>(-1);
  const handleSubmenu = (index: number) => {
    if (openIndex === index) {
      setOpenIndex(-1);
    } else {
      setOpenIndex(index);
    }
  };

  const pathname = usePathname();

  // Close mobile navbar on route change
  useEffect(() => {
    setNavbarOpen(false);
    setOpenIndex(-1);
  }, [pathname]);

  if (pathname?.startsWith("/dashboard") || pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <header
      id="main-header"
      className={`header top-0 left-0 z-40 flex w-full items-center ${
        sticky
          ? "dark:bg-gray-dark/95 dark:shadow-sticky-dark shadow-sticky fixed z-9999 bg-white/95 backdrop-blur-md transition-all duration-300 py-3"
          : "absolute bg-transparent py-5 lg:py-6"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="relative flex items-center justify-between">
          {/* HambakTech Brand Logo */}
          <div className="shrink-0 mr-4">
            <BrandLogo showSlogan={false} />
          </div>

          {/* Navigation Links */}
          <div className="flex items-center justify-end w-full lg:justify-between">
            <nav
              id="navbarCollapse"
              aria-label="Main Navigation"
              className={`navbar border border-stroke dark:border-strokedark dark:bg-dark absolute right-0 top-full z-30 w-[300px] max-w-[90vw] rounded-2xl bg-white p-6 shadow-xl duration-300 lg:visible lg:static lg:w-auto lg:max-w-none lg:border-none lg:!bg-transparent lg:p-0 lg:shadow-none lg:opacity-100 ${
                navbarOpen
                  ? "visibility opacity-100 translate-y-2"
                  : "invisible opacity-0 -translate-y-2 lg:translate-y-0"
              }`}
            >
              <ul className="block lg:flex lg:items-center lg:space-x-8">
                {menuData.map((menuItem, index) => (
                  <li key={menuItem.id} className="group relative">
                    {menuItem.path && !menuItem.submenu ? (
                      <Link
                        href={menuItem.path}
                        className={`flex py-2 text-sm font-semibold transition duration-200 lg:py-2 ${
                          pathname === menuItem.path
                            ? "text-primary dark:text-primary font-bold"
                            : "text-dark/80 hover:text-primary dark:text-white/80 dark:hover:text-primary"
                        }`}
                      >
                        {menuItem.title}
                      </Link>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleSubmenu(index)}
                          aria-expanded={openIndex === index}
                          className="flex cursor-pointer items-center justify-between w-full py-2 text-sm font-semibold text-dark/80 hover:text-primary dark:text-white/80 dark:hover:text-primary transition duration-200 lg:w-auto"
                        >
                          <span>{menuItem.title}</span>
                          <ChevronDown
                            className={`w-4 h-4 ml-1.5 transition-transform duration-200 ${
                              openIndex === index ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        {menuItem.submenu && (
                          <div
                            className={`submenu dark:bg-dark/95 relative lg:absolute lg:top-full lg:left-0 rounded-xl bg-white transition-all duration-300 border border-stroke dark:border-strokedark p-2 shadow-lg lg:w-[280px] ${
                              openIndex === index
                                ? "block my-2 lg:my-0"
                                : "hidden lg:group-hover:block"
                            }`}
                          >
                            {menuItem.submenu.map((submenuItem) => (
                              <Link
                                href={submenuItem.path || "#"}
                                key={submenuItem.id}
                                className={`block rounded-lg px-3.5 py-2 text-xs font-medium transition duration-200 ${
                                  pathname === submenuItem.path
                                    ? "bg-primary/10 text-primary font-semibold dark:bg-primary/20"
                                    : "text-dark/80 hover:bg-gray-1 hover:text-primary dark:text-white/80 dark:hover:bg-gray-dark dark:hover:text-white"
                                }`}
                              >
                                {submenuItem.title}
                              </Link>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </li>
                ))}
              </ul>

              {/* Mobile Auth Links inside drawer */}
              <div className="pt-6 mt-6 border-t border-stroke dark:border-strokedark lg:hidden space-y-3">
                <Link
                  href="/signin"
                  className="block text-center w-full py-2.5 rounded-lg border border-stroke dark:border-strokedark text-sm font-semibold text-dark dark:text-white"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="block text-center w-full py-2.5 rounded-lg bg-primary text-sm font-semibold text-white shadow-sm"
                >
                  Get Started
                </Link>
              </div>
            </nav>

            {/* Desktop Auth Controls + Theme Toggle */}
            <div className="flex items-center gap-3">
              <Link
                href="/signin"
                className="hidden md:inline-flex px-4 py-2 text-sm font-semibold text-dark dark:text-white hover:text-primary dark:hover:text-primary transition duration-200"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="hidden md:inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-primary text-sm font-semibold text-white shadow-sm shadow-primary/20 hover:bg-primary/90 transition duration-200"
              >
                Get Started
              </Link>
              <ThemeToggler />

              {/* Mobile Menu Button */}
              <button
                onClick={navbarToggleHandler}
                id="navbarToggler"
                aria-label="Toggle navigation menu"
                aria-expanded={navbarOpen}
                className="flex flex-col items-center justify-center w-10 h-10 rounded-xl border border-stroke dark:border-strokedark bg-white dark:bg-dark text-dark dark:text-white lg:hidden"
              >
                <span
                  className={`block h-0.5 w-5 bg-current transition-all duration-300 ${
                    navbarOpen ? "translate-y-1.5 rotate-45" : "-translate-y-1"
                  }`}
                />
                <span
                  className={`block h-0.5 w-5 bg-current transition-all duration-300 ${
                    navbarOpen ? "opacity-0" : "opacity-100"
                  }`}
                />
                <span
                  className={`block h-0.5 w-5 bg-current transition-all duration-300 ${
                    navbarOpen ? "-translate-y-1.5 -rotate-45" : "translate-y-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
