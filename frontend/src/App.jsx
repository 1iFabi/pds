// src/App.jsx
import { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Hero from "./components/Hero/Hero";
import Descubre from "./components/Descubre/Descubre";
import Conoce from "./components/Conoce/Conoce";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import Postlogin from "./components/Postlogin/Postlogin";

export default function App() {
  const [navTheme, setNavTheme] = useState("dark");
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== "/") {
      setNavTheme("light");
      return;
    }
    const NAV_H = parseInt(
      getComputedStyle(document.documentElement)
        .getPropertyValue("--nav-h")
        ?.replace("px", "") || "80",
      10
    );

    let ticking = false;
    const pickTheme = () => {
      const y = NAV_H + 1;
      const sections = document.querySelectorAll("[data-nav-theme]");
      let foundTheme = null;

      sections.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top <= y && r.bottom > y) {
          foundTheme = el.getAttribute("data-nav-theme") || "dark";
        }
      });

      if (!foundTheme && sections.length) {
        let best = { ratio: -1, theme: "dark" };
        sections.forEach((el) => {
          const r = el.getBoundingClientRect();
          const vh = Math.max(1, window.innerHeight);
          const vis = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0)) / vh;
          if (vis > best.ratio) best = { ratio: vis, theme: el.getAttribute("data-nav-theme") || "dark" };
        });
        foundTheme = best.theme;
      }

      if (foundTheme && foundTheme !== navTheme) setNavTheme(foundTheme);
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => { pickTheme(); ticking = false; });
        ticking = true;
      }
    };

    pickTheme();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [location.pathname, navTheme]);

  // Función para determinar si mostrar la Navbar
  const shouldShowNavbar = () => {
    return location.pathname !== "/postlogin" && location.pathname !== "/register"; // Oculta navbar en postlogin y register
  };

  return (
    <>
      {shouldShowNavbar() && <Navbar theme={navTheme} />}
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Hero />
              <Descubre />
              <Conoce />
            </>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/postlogin" element={<Postlogin />} />
      </Routes>
    </>
  );
}
