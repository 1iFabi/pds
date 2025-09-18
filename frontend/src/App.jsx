// src/App.jsx
import { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Hero from "./components/Hero/Hero";
import Descubre from "./components/Descubre/Descubre";
import Login from "./components/Login/Login";

export default function App() {
  const [navTheme, setNavTheme] = useState("dark");
  const location = useLocation();

  useEffect(() => {
    // Si NO estamos en la home, fija el tema (por ejemplo light en /login)
    if (location.pathname !== "/") {
      setNavTheme("light");
      return; // evita enganchar el scroll observer fuera de la home
    }

    const NAV_H = parseInt(
      getComputedStyle(document.documentElement)
        .getPropertyValue("--nav-h")
        ?.replace("px", "") || "80",
      10
    );

    let ticking = false;

    const pickTheme = () => {
      const y = NAV_H + 1; // línea justo debajo de la navbar
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

  return (
    <>
      <Navbar theme={navTheme} />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Hero />
              <Descubre />
            </>
          }
        />
        <Route path="/login" element={<Login />} />
      </Routes>
    </>
  );
}
