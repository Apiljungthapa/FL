import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./App.css";
import logoMark from "./assets/logo.png";
import financeAccountingImg from "./assets/solutions/finance-accounting.jpeg";
import bookCleanupImg from "./assets/solutions/book-cleanup.jpeg";
import payrollAccountingImg from "./assets/solutions/payroll-accounting.jpeg";
import taxSolutionsImg from "./assets/solutions/tax-solutions.jpeg";
import financialStatementsImg from "./assets/solutions/financial-statements.jpeg";
import auditSupportImg from "./assets/solutions/audit-support.jpeg";
import bookkeepingServiceImg from "./assets/services/bookkeeping.jpeg";
import financialReportingImg from "./assets/services/financial-reporting.jpeg";
import accountsPayableReceivableImg from "./assets/services/accounts-payable-receivable.jpeg";
import payrollSupportImg from "./assets/services/payroll-support.jpeg";
import cloudAccountingImg from "./assets/services/cloud-accounting.jpeg";
import cfoServicesImg from "./assets/services/cfo-services.jpeg";
import cpaFirmSupportImg from "./assets/services/cpa-firm-support.jpeg";
import amritImg from "./assets/Amrit1.jpeg";
import anupamImg from "./assets/Anupam.png";
import basantaImg from "./assets/Basanta.jpeg";
import diwasImg from "./assets/Diwas.jpeg";
import samirImg from "./assets/Samir.jpeg";
import utsabImg from "./assets/utsav_bhandari.jpeg";
import prashantImg from "./assets/prashant_joshi.jpeg";
import anamolImg from "./assets/anamol_sitaula.jpeg";
import realEstateImg from "./assets/industries/real-estate.jpeg";
import accountingImg from "./assets/industries/accounting.jpeg";
import constructionImg from "./assets/industries/construction.jpeg";
import hospitalityImg from "./assets/industries/hospitality.jpeg";
import technologyImg from "./assets/industries/technology.jpeg";
import startupsImg from "./assets/industries/startups.jpeg";
import quickbooksLogo from "./assets/tools/quickbooks.svg";
import xeroLogo from "./assets/tools/xero.png";
import taxdomeLogo from "./assets/tools/taxdome.png";
import netsuiteLogo from "./assets/tools/netsuite.png";
import karbonLogo from "./assets/tools/karbon.svg";
import canopyLogo from "./assets/tools/canopy.png";
import floqastLogo from "./assets/tools/floqast.png";

function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible");
          io.unobserve(el);
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

function Reveal({ children, className = "" }) {
  const ref = useReveal();
  return (
    <div ref={ref} className={`fl-reveal ${className}`}>
      {children}
    </div>
  );
}

function CountUp({ end, suffix = "", formatter, duration = 1500 }) {
  const ref = useRef(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let frameId;
    let hasStarted = false;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const animate = () => {
      hasStarted = true;

      if (prefersReducedMotion) {
        setValue(end);
        return;
      }

      const startTime = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);

        setValue(end * eased);

        if (progress < 1) {
          frameId = requestAnimationFrame(tick);
        }
      };

      frameId = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          animate();
          io.unobserve(entry.target);
        }
      },
      { threshold: 0.35 },
    );

    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frameId);
    };
  }, [duration, end]);

  const displayValue = formatter
    ? formatter(value)
    : `${Math.round(value)}${suffix}`;

  return <strong ref={ref}>{displayValue}</strong>;
}

/* ---------------- SOLAR ICONS ---------------- */
const TOAST_DURATION = 5000;

const solarIcons = {
  arrowRight: (
    <>
      <path d="M4 12h15" />
      <path d="m13 6 6 6-6 6" />
    </>
  ),
  arrowUp: (
    <>
      <path d="M12 19V5" />
      <path d="m6 11 6-6 6 6" />
    </>
  ),
  book: (
    <>
      <path d="M5 5.5c0-1.1.9-2 2-2h12v15H7a2 2 0 0 0-2 2v-15Z" />
      <path d="M5 20.5c0-1.1.9-2 2-2h12" />
      <path d="M9 7.5h6M9 11h4" />
    </>
  ),
  bolt: <path d="m13 2-9 12h6l-1 8 10-13h-6l1-7Z" />,
  briefcase: (
    <>
      <path d="M4 9.5c0-1.4 1.1-2.5 2.5-2.5h11C18.9 7 20 8.1 20 9.5v7c0 1.4-1.1 2.5-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5v-7Z" />
      <path d="M9 7V5.8c0-1 .8-1.8 1.8-1.8h2.4c1 0 1.8.8 1.8 1.8V7M4 12.5h16M10 12.5v1h4v-1" />
    </>
  ),
  calendar: (
    <>
      <path d="M5 6.5c0-1.4 1.1-2.5 2.5-2.5h9C17.9 4 19 5.1 19 6.5v10c0 1.4-1.1 2.5-2.5 2.5h-9A2.5 2.5 0 0 1 5 16.5v-10Z" />
      <path d="M8 3v3M16 3v3M5 9h14M8.5 13h2.5M13 13h2.5M8.5 16h2.5" />
    </>
  ),
  card: (
    <>
      <path d="M4 7.5C4 6.1 5.1 5 6.5 5h11C18.9 5 20 6.1 20 7.5v9c0 1.4-1.1 2.5-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5v-9Z" />
      <path d="M4 10h16M8 15h4" />
    </>
  ),
  chart: (
    <>
      <path d="M5 20V5M5 20h15" />
      <path d="M9 16v-5M13 16V8M17 16v-3" />
    </>
  ),
  check: <path d="m5 12 4.2 4.2L19 6.5" />,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  checklist: (
    <>
      <path d="M9 6h10M9 12h10M9 18h10" />
      <path d="m4 6 .9.9L6.5 5M4 12l.9.9 1.6-1.9M4 18l.9.9 1.6-1.9" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5v5l3.2 2" />
    </>
  ),
  close: <path d="m6 6 12 12M18 6 6 18" />,
  cloud: <path d="M7 18a4 4 0 0 1-.6-7.96 5.5 5.5 0 0 1 10.71-1.94A4 4 0 0 1 17 18H7Z" />,
  document: (
    <>
      <path d="M7 3.5h6l4 4v11c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2v-13c0-1.1.9-2 2-2Z" />
      <path d="M13 3.5v4h4M8 12h6M8 15.5h6" />
    </>
  ),
  facebook: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
      <path d="M13.4 20v-6.6h2.2l.3-2.6h-2.5V9.1c0-.75.2-1.3 1.3-1.3h1.4V5.5c-.25-.03-1.1-.1-2-.1-2 0-3.4 1.2-3.4 3.5v1.8H8.4v2.6h2.3V20" />
    </>
  ),
  instagram: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="16.8" cy="7.2" r="0.7" fill="currentColor" stroke="none" />
    </>
  ),
  linkedin: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
      <circle cx="8" cy="8" r="1.3" fill="currentColor" stroke="none" />
      <path d="M8 11v7" />
      <path d="M12 18v-7" />
      <path d="M12 13.5c0-1.7 1-2.8 2.5-2.8s2.5 1.1 2.5 2.8V18" />
    </>
  ),
  mail: (
    <>
      <path d="M4 7.5C4 6.1 5.1 5 6.5 5h11C18.9 5 20 6.1 20 7.5v9c0 1.4-1.1 2.5-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5v-9Z" />
      <path d="m5 8 7 5 7-5" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  phone: (
    <>
      <path d="M7.5 4.5 9.6 4c1 .8 1.6 2 1.8 3.3L10 8.7a12.4 12.4 0 0 0 5.3 5.3l1.4-1.4c1.3.2 2.5.8 3.3 1.8l-.5 2.1c-.2 1-1.1 1.7-2.1 1.6C10.9 17.5 6.5 13.1 5.9 6.6c-.1-1 .6-1.9 1.6-2.1Z" />
      <path d="M15 5.5c2 .5 3.5 2 4 4M15 9c.6.2 1 .6 1.2 1.2" />
    </>
  ),
  receipt: (
    <>
      <path d="M6 3.5h12v17l-2-1.2-2 1.2-2-1.2-2 1.2-2-1.2-2 1.2v-17Z" />
      <path d="M9 8h6M9 12h6M9 16h3" />
    </>
  ),
  rocket: (
    <>
      <path d="M5.5 15.5s-.7-4.2 3.1-8 8.9-3.5 8.9-3.5.3 5.1-3.5 8.9-8.5 2.6-8.5 2.6Z" />
      <circle cx="14" cy="8.8" r="1.3" />
      <path d="M8.2 15.5 5 18.7M5.4 13.2 3.5 15l2.4 2.4 1.9-1.9" />
    </>
  ),
  shield: <path d="M12 3.5 19 6v5.6c0 4.1-2.9 7.1-7 8.9-4.1-1.8-7-4.8-7-8.9V6l7-2.5Z" />,
  star: <path d="m12 3.5 2.4 5.1 5.6.7-4.1 3.8 1.1 5.5-5-2.8-5 2.8 1.1-5.5L4 9.3l5.6-.7L12 3.5Z" />,
  trendUp: (
    <>
      <path d="m4.5 15.5 4.7-4.7 3.4 3.4 6.9-6.9" />
      <path d="M15.5 7.3h4v4" />
    </>
  ),
  users: (
    <>
      <path d="M8.5 11a3.3 3.3 0 1 0 0-6.6 3.3 3.3 0 0 0 0 6.6ZM3.5 19c.5-3.1 2.5-5 5-5s4.5 1.9 5 5" />
      <path d="M15 10.5a2.7 2.7 0 1 0 0-5.4M16 14.2c2.2.6 3.6 2.3 4 4.8" />
    </>
  ),
  wallet: (
    <>
      <path d="M4 8.5C4 7.1 5.1 6 6.5 6h11C18.9 6 20 7.1 20 8.5v7c0 1.4-1.1 2.5-2.5 2.5h-11A2.5 2.5 0 0 1 4 15.5v-7Z" />
      <path d="M16 12h4M7 6V4.5h8V6" />
    </>
  ),
};

function SolarIcon({ name, size = 20, strokeWidth = 1.8, className = "" }) {
  return (
    <svg
      className={`fl-solar-icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {solarIcons[name] ?? solarIcons.star}
    </svg>
  );
}

function Toast({ toast, onDismiss }) {
  if (!toast) return null;
  return createPortal(
    <div className="fl-toast-viewport">
      <div
        key={toast.id}
        className={`fl-toast fl-toast--${toast.type}`}
        role="status"
        aria-live="polite"
        style={{ "--fl-toast-duration": `${TOAST_DURATION}ms` }}
      >
        <span className="fl-toast-icon">
          <SolarIcon
            name={toast.type === "success" ? "check" : "close"}
            size={18}
            strokeWidth={2.6}
          />
        </span>
        <div className="fl-toast-body">
          <strong>{toast.type === "success" ? "Request sent" : "Submission failed"}</strong>
          <p>{toast.message}</p>
        </div>
        <button
          type="button"
          className="fl-toast-close"
          aria-label="Dismiss notification"
          onClick={onDismiss}
        >
          <SolarIcon name="close" size={13} strokeWidth={2.6} />
        </button>
        <span className="fl-toast-progress" />
      </div>
    </div>,
    document.body
  );
}

function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => setVisible(window.scrollY > 480);
    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      className={`fl-back-to-top ${visible ? "is-visible" : ""}`}
      onClick={scrollToTop}
      aria-label="Back to top"
    >
      <SolarIcon name="arrowUp" size={20} strokeWidth={2.4} />
    </button>
  );
}

/* ---------------- NAV ---------------- */
function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);
  const aboutRef = useRef(null);
  const links = [
    {
      label: "About",
      children: [
        { label: "About Us", href: "#about-us" },
        { label: "Why Choose Us", href: "#why-us" },
        { label: "Team", href: "#team" },
      ],
    },
    { label: "Services", href: "#services" },
    { label: "Industries", href: "#industries" },
    { label: "Process", href: "#process" },
    { label: "Insight", href: "#results" },
  ];

  useEffect(() => {
    if (!aboutOpen) return;
    const handleClickOutside = (e) => {
      if (aboutRef.current && !aboutRef.current.contains(e.target)) {
        setAboutOpen(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === "Escape") setAboutOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [aboutOpen]);

  useEffect(() => {
    const updateNav = () => {
      setScrolled(window.scrollY > 24);
    };

    updateNav();
    window.addEventListener("scroll", updateNav, { passive: true });
    return () => window.removeEventListener("scroll", updateNav);
  }, []);

  return (
    <header className={`fl-nav ${scrolled ? "is-scrolled" : ""}`}>

      <div className="fl-container fl-nav-inner">
        <a
          href="/"
          className="fl-logo"
          onClick={(e) => {
            e.preventDefault();
            window.location.href = "/";
          }}
        >
          <img src={logoMark} alt="Forth Ledger" className="fl-logo-image" />
        </a>
        <nav className="fl-nav-links">
          {links.map((link) =>
            link.children ? (
              <div
                className="fl-nav-item fl-has-dropdown"
                key={link.label}
                ref={aboutRef}
              >
                <button
                  type="button"
                  className="fl-nav-dropdown-trigger"
                  aria-expanded={aboutOpen}
                  aria-haspopup="true"
                  onClick={() => setAboutOpen((v) => !v)}
                >
                  {link.label}
                  <svg
                    className={`fl-nav-chevron ${aboutOpen ? "is-open" : ""}`}
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
                <div className={`fl-nav-dropdown ${aboutOpen ? "is-open" : ""}`}>
                  {link.children.map((child) => (
                    <a
                      key={child.href}
                      href={child.href}
                      onClick={() => setAboutOpen(false)}
                    >
                      {child.label}
                    </a>
                  ))}
                </div>
              </div>
            ) : (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ),
          )}
        </nav>
        <a href="#contact" className="fl-btn fl-btn-primary fl-nav-cta">
          Contact Us
        </a>
        <button
          className="fl-nav-toggle"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <SolarIcon name={open ? "close" : "menu"} />
        </button>
      </div>
      <div className={`fl-container fl-mobile-menu ${open ? "is-open" : ""}`}>
        {links.map((link) =>
          link.children ? (
            <div className="fl-mobile-dropdown" key={link.label}>
              <button
                type="button"
                className="fl-mobile-dropdown-trigger"
                aria-expanded={mobileAboutOpen}
                onClick={() => setMobileAboutOpen((v) => !v)}
              >
                {link.label}
                <svg
                  className={`fl-nav-chevron ${mobileAboutOpen ? "is-open" : ""}`}
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              <div
                className={`fl-mobile-submenu ${mobileAboutOpen ? "is-open" : ""}`}
              >
                {link.children.map((child) => (
                  <a
                    key={child.href}
                    href={child.href}
                    onClick={() => {
                      setOpen(false);
                      setMobileAboutOpen(false);
                    }}
                  >
                    {child.label}
                  </a>
                ))}
              </div>
            </div>
          ) : (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
              {link.label}
            </a>
          ),
        )}
        <a
          href="#contact"
          onClick={() => setOpen(false)}
          style={{ color: "#a9a2ff", fontWeight: 600 }}
        >
          Contact Us →
        </a>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="fl-hero" id="top">
      <div className="fl-container fl-hero-shell">
        <div className="fl-hero-watermark" aria-hidden="true">
          DISCOVER
        </div>
        <div className="fl-hero-inner">
          <h1>
            Precision Beyond
            <br />
            Borders
          </h1>
          <p className="lede">
            High-growth accounting outsourcing and financial management for
            modern businesses.
          </p>
          <div className="fl-hero-ctas">
            <a href="#contact" className="fl-btn fl-btn-primary">
              Book Consultation <span aria-hidden="true">↗</span>
            </a>
            <a href="#solutions" className="fl-btn fl-btn-outline-onnavy">
              Explore capabilities
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- WHAT WE SOLVE ---------------- */
function WhatWeSolve() {
  const problems = [
    {
      icon: "clock",
      title: "Capacity gaps",
      body: "Scale through busy periods without rushing permanent local hiring.",
    },
    {
      icon: "checklist",
      title: "Process inconsistency",
      body: "Create dependable workflows, clear review points, and reporting visibility.",
    },
    {
      icon: "chart",
      title: "Finance complexity",
      body: "Access specialist support across bookkeeping, payroll, audit, and tax operations.",
    },
  ];
  return (
    <section className="fl-section" id="solve">
      <div className="fl-container">
        <div className="fl-solve-grid">
          <Reveal>
            <div className="fl-solve-left">
              <div className="fl-eyebrow fl-eyebrow--center">What we solve</div>
              <div className="fl-problem-list">
                {problems.map((p) => (
                  <div className="fl-problem-card" key={p.title}>
                    <div className="fl-problem-icon">
                      <SolarIcon name={p.icon} />
                    </div>
                    <div>
                      <h3>{p.title}</h3>
                      <p>{p.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal>
            <div className="fl-solve-panel">
              <h2 className="fl-h2">
                More control, enhanced capacity,{" "}
                <span className="accent">less operational drag</span>.
              </h2>
              <p className="fl-sub">
                Streamline your finance operations with clearer workflows,
                reliable accounting support, and the capacity to scale, so your
                team spends less time managing tasks and more time driving
                growth.
              </p>
              <a
                href="#contact"
                className="fl-btn fl-btn-dark"
                style={{ marginTop: 26 }}
              >
                Book a Consultation <SolarIcon name="arrowRight" size={15} />
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------------- TRUSTED PERFORMANCE ---------------- */
function TrustedPerformance() {
  const stats = [
    { end: 50, suffix: "+", label: "Business scaled" },
    { end: 5, suffix: "+", label: "Countries active" },
    { end: 95, suffix: "%", label: "Client retention" },
    {
      end: 100000,
      label: "Transactions processed",
      formatter: (value) =>
        value >= 999500 ? "100K+" : `${Math.round(value / 1000)}K+`,
    },
  ];

  return (
    <section className="fl-trusted-section" id="about-us">
      <div className="fl-container">
        <Reveal>
          <div className="fl-trusted-header">
            <div className="fl-trusted-eyebrow">About Us</div>
            <h2 className="fl-trusted-title">
              Your Trusted Offshore
              <br />
              Accounting Partner
            </h2>
          </div>
        </Reveal>
        <Reveal>
          <div className="fl-trusted-body">
            <p>
              Forth Ledger was founded by two Chartered Accountants who
              believe offshore accounting should mean more than cost
              savings. It should mean precision you don't have to
              double-check.
            </p>
            <p>
              We help CPA firms, accounting practices, and growing
              businesses strengthen their financial operations through
              dependable offshore support, including bookkeeping,
              financial reporting, payroll, reconciliations, and
              month-end close, delivered with the accuracy of a firm
              that's been in the room where the numbers actually matter.
            </p>
            <p>
              Our team works as a seamless extension of yours. By
              combining qualified professionals, cloud-based technology,
              and standardized processes, we help you increase capacity,
              reduce operational costs, and stay focused on what matters
              most, serving your clients and growing your practice.
            </p>
            <p>
              Built on Accuracy, Reliability, and Partnership, Forth
              Ledger is committed to secure, scalable, and dependable
              accounting support that goes beyond outsourcing.
            </p>
          </div>
          <p className="fl-trusted-tagline">
            Bookkeeping Beyond Borders. Partnership Beyond Expectations.
          </p>
        </Reveal>
        <Reveal>
          <div className="fl-trusted-stats" aria-label="Trusted network stats">
            {stats.map(({ end, suffix, formatter, label }) => (
              <div className="fl-trusted-stat" key={label}>
                <CountUp end={end} suffix={suffix} formatter={formatter} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- SOLUTIONS ---------------- */
function Solutions() {
  const items = [
    {
      title: "Finance & Accounting",
      body: "From audit preparation to strategic CFO services, we professionalize your financial stack.",
      image: financeAccountingImg,
    },
    {
      title: "Book Cleanup",
      body: "Custom dashboards and real-time reporting that turn raw data into strategic leverage.",
      image: bookCleanupImg,
    },
    {
      title: "Payroll Accounting",
      body: "Architecture and deployment of enterprise-grade accounting stacks.",
      image: payrollAccountingImg,
    },
    {
      title: "Tax Solutions",
      body: "Global talent integration for seamless scaling of your finance team.",
      image: taxSolutionsImg,
    },
    {
      title: "Financial Statements",
      body: "Securing and structuring your most valuable asset, so every number reconciles.",
      image: financialStatementsImg,
    },
    {
      title: "Audit Support",
      body: "End-to-end preparation and documentation so audits close faster, with fewer surprises.",
      image: auditSupportImg,
    },
  ];
  return (
    <section className="fl-section" id="solutions">
      <div className="fl-container">
        <Reveal>
          <div className="fl-header-row" style={{ textAlign: "center" }}>
            <div className="fl-eyebrow fl-eyebrow--center">Our solutions</div>
            <h2 className="fl-h2 fl-h2--center">
              Integrated Solutions Built For{" "}
              <span className="accent">Modern Businesses</span>
            </h2>
          </div>
        </Reveal>
        <Reveal>
          <div className="fl-sol-grid">
            {items.map((it) => (
              <div className="fl-sol-card" key={it.title}>
                <div className="fl-sol-image">
                  <img src={it.image} alt={it.title} />
                </div>
                <h3>{it.title}</h3>
                <p>{it.body}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- SERVICES SHOWCASE ---------------- */
function ServicesShowcase() {
  const services = [
    {
      icon: "book",
      title: "Bookkeeping & Accounting",
      image: bookkeepingServiceImg,
      position: "42% 46%",
      accent: "#6366f1",
      bullets: [
        "Daily, weekly, and monthly bookkeeping",
        "General ledger maintenance",
        "Chart of accounts setup & cleanup",
        "Bank & credit card reconciliation",
        "Historical catch-up bookkeeping",
      ],
    },
    {
      icon: "chart",
      title: "Financial Reporting",
      image: financialReportingImg,
      position: "58% 55%",
      accent: "#4f46e5",
      bullets: [
        "Monthly & quarterly management reports",
        "P&L, balance sheet, and cash flow statements",
        "Month-end & year-end close",
        "Custom reporting dashboards",
      ],
    },
    {
      icon: "card",
      title: "Accounts Payable & Receivable",
      image: accountsPayableReceivableImg,
      position: "50% 45%",
      accent: "#7c3aed",
      bullets: [
        "Invoice processing & vendor management",
        "AP/AR tracking and aging reports",
        "Collections follow-up support",
      ],
    },
    {
      icon: "wallet",
      title: "Payroll Support",
      image: payrollSupportImg,
      position: "50% 30%",
      accent: "#5b6df4",
      bullets: [
        "Payroll processing (weekly/biweekly/monthly)",
        "Payroll compliance support",
        "Direct deposit & payslip management",
        "Multi-jurisdiction payroll coordination",
      ],
    },
    {
      icon: "cloud",
      title: "Cloud Accounting Solutions",
      image: cloudAccountingImg,
      position: "45% 50%",
      accent: "#3f37c9",
      bullets: [
        "Software setup & migration (QuickBooks, Xero, and similar platforms)",
        "Cloud workflow integration",
        "App/tool syncing for real-time collaboration",
      ],
    },
    {
      icon: "briefcase",
      title: "CFO & Advisory Support",
      image: cfoServicesImg,
      position: "50% 38%",
      accent: "#6d5dfc",
      bullets: [
        "KPI tracking & financial dashboards",
        "Cash flow management",
        "Budgeting & forecasting",
        "Budget vs. actual analysis",
        "Strategic financial planning support",
      ],
    },
    {
      icon: "users",
      title: "CPA Firm Support",
      image: cpaFirmSupportImg,
      position: "50% 45%",
      accent: "#8b5cf6",
      bullets: [
        "White-labeled bookkeeping capacity",
        "Overflow & seasonal support",
        "Staff augmentation for existing engagements",
        "Workpapers aligned to your firm's review process",
      ],
    },
    {
      icon: "checklist",
      title: "Audit Support",
      image: auditSupportImg,
      position: "50% 45%",
      accent: "#4338ca",
      bullets: [
        "Audit workpaper preparation",
        "PBC (Prepared-by-Client) list compilation",
        "Supporting schedule preparation for CPA-led audit engagements",
      ],
    },
  ];
  const [activeIndex, setActiveIndex] = useState(0);
  const [openIndex, setOpenIndex] = useState(0);
  const sectionRef = useRef(null);
  const activeService = services[activeIndex];
  const serviceCount = services.length;

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let frameId = null;
    const updateActiveService = () => {
      if (frameId) return;

      frameId = requestAnimationFrame(() => {
        const rect = section.getBoundingClientRect();
        const scrollable = Math.max(section.offsetHeight - window.innerHeight, 1);
        const rawProgress = (-rect.top + window.innerHeight * 0.12) / scrollable;
        const progress = Math.min(Math.max(rawProgress, 0), 1);
        const nextIndex = Math.min(
          serviceCount - 1,
          Math.floor(progress * serviceCount),
        );

        setActiveIndex((current) => {
          if (current === nextIndex) return current;
          setOpenIndex(nextIndex);
          return nextIndex;
        });
        frameId = null;
      });
    };

    updateActiveService();
    window.addEventListener("scroll", updateActiveService, { passive: true });
    window.addEventListener("resize", updateActiveService);

    return () => {
      window.removeEventListener("scroll", updateActiveService);
      window.removeEventListener("resize", updateActiveService);
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [serviceCount]);

  return (
    <section
      className="fl-services-showcase"
      id="services"
      ref={sectionRef}
      style={{ "--service-scroll-height": `calc(100vh + ${serviceCount * 36}px)` }}
    >
      <div className="fl-container fl-services-sticky">
        <Reveal>
          <div className="fl-services-layout">
            <div
              className="fl-service-visual"
              style={{
                "--service-image": `url(${activeService.image})`,
                "--service-position": activeService.position,
                "--service-accent": activeService.accent,
              }}
            >
              <div className="fl-service-visual-tag" key={activeService.title}>
                <span>{activeService.title}</span>
              </div>
            </div>
            <div className="fl-service-accordion">
              <div className="fl-eyebrow">Our services</div>
              <h2 className="fl-h2">
                Our <span className="accent">Services</span>
              </h2>
              <div className="fl-service-list">
                {services.map((service, index) => {
                  const isCurrent = index === activeIndex;
                  const isOpen = index === openIndex;

                  return (
                    <div
                      className={`fl-service-row ${
                        isCurrent ? "is-current" : ""
                      } ${isOpen ? "is-active" : ""}`}
                      key={service.title}
                    >
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() => {
                          setActiveIndex(index);
                          setOpenIndex((current) =>
                            current === index ? null : index,
                          );
                        }}
                      >
                        <span className="fl-service-row-title">
                          {service.title}
                        </span>
                        <SolarIcon
                          name="chevronDown"
                          className="fl-service-chevron"
                        />
                      </button>
                      <div className="fl-service-dropdown" aria-hidden={!isOpen}>
                        <ul className="fl-service-bullets">
                          {service.bullets.map((bullet) => (
                            <li key={bullet}>{bullet}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- WHY US ---------------- */
function WhyUs() {
  const items = [
    {
      icon: "briefcase",
      title: "Led by Chartered Accountants",
      body: "Forth Ledger is founded and led by qualified Chartered Accountants, not operations managers running an outsourcing desk. That means every engagement is shaped by people who understand what accuracy actually requires.",
    },
    {
      icon: "users",
      title: "A Seamless Extension of Your Team",
      body: "We integrate with your workflows, software, and communication style to deliver a consistent experience for you, and for everyone you answer to.",
    },
    {
      icon: "checklist",
      title: "Qualified Professionals, Reviewed Work",
      body: "Every engagement runs through a structured review process before it reaches you, ensuring accuracy, consistency, and compliance at every step.",
    },
    {
      icon: "wallet",
      title: "One Partner, Full-Spectrum Support",
      body: "From day-to-day bookkeeping to CFO-level reporting, our support scales with you, so there's no need to bring in a different provider as your needs grow.",
    },
    {
      icon: "bolt",
      title: "Technology-Driven Efficiency",
      body: "Leading cloud accounting platforms and standardized processes streamline routine work, improve collaboration, and keep your financial information timely.",
    },
    {
      icon: "shield",
      title: "Security You Can Trust",
      body: "Your data is handled with strict confidentiality and secure workflows, backed by professional standards our founders hold as practicing Chartered Accountants, standards that exist independently of any contract.",
    },
    {
      icon: "trendUp",
      title: "Results That Matter",
      body: "Less operational burden, more capacity, and accounting support you can rely on as you grow.",
    },
  ];
  const primaryItems = items.slice(0, 3);
  const secondaryItems = items.slice(3);

  return (
    <section className="fl-why-section" id="why-us">
      <div className="fl-container">
        <Reveal>
          <div className="fl-header-row" style={{ textAlign: "center" }}>
            <div className="fl-eyebrow fl-eyebrow--center">Why us</div>
            <h2 className="fl-h2 fl-h2--center">
              More Than an Offshore Team, A{" "}
              <span className="accent">Reliable Accounting Partner</span>
            </h2>
            <p className="fl-sub fl-sub--center">
              At Forth Ledger, we don't measure great accounting by
              transactions processed. We measure it by the confidence our
              clients have in their financial information, and the trust
              they place in our team.
            </p>
          </div>
        </Reveal>
        <div className="fl-why-layout">
          <Reveal>
            <div className="fl-why-list">
              {primaryItems.map((it) => (
                <div className="fl-why-item" key={it.title}>
                  <div className="fl-why-icon">
                    <SolarIcon name={it.icon} />
                  </div>
                  <div>
                    <h3>{it.title}</h3>
                    <p>{it.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal>
            <div className="fl-why-image" aria-hidden="true" />
          </Reveal>
          <Reveal>
            <div className="fl-why-grid">
              {secondaryItems.map((it) => (
                <div className="fl-why-grid-card" key={it.title}>
                  <div className="fl-why-icon">
                    <SolarIcon name={it.icon} />
                  </div>
                  <div>
                    <h3>{it.title}</h3>
                    <p>{it.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
        <Reveal>
          <p className="fl-why-tagline">
            With Forth Ledger, you're not outsourcing your accounting.
            You're strengthening it, with a partner invested in getting it
            right.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- INDUSTRIES ---------------- */
function Industries() {
  const items = [
    {
      g: "RS",
      name: "Real State",
      sub: "Revenue recognition",
      bg: "linear-gradient(135deg,#191e52,#3f37c9)",
      photo: realEstateImg,
    },
    {
      g: "AC",
      name: "Accounting & CPA",
      sub: "Practice support",
      bg: "linear-gradient(135deg,#1b1f52,#2f2c86)",
      photo: accountingImg,
    },
    {
      g: "CN",
      name: "Construction",
      sub: "Job costing",
      bg: "linear-gradient(135deg,#232a68,#3f3a9e)",
      photo: constructionImg,
    },
    {
      g: "HH",
      name: "Hotel & Hospitality",
      sub: "Revenue recognition",
      bg: "linear-gradient(135deg,#191e52,#3f37c9)",
      photo: hospitalityImg,
    },
    {
      g: "TC",
      name: "Technology",
      sub: "SaaS metrics",
      bg: "linear-gradient(135deg,#3f37c9,#7c3aed)",
      photo: technologyImg,
    },
    {
      g: "SU",
      name: "Startups",
      sub: "Runway & reporting",
      bg: "linear-gradient(135deg,#12163a,#4f46e5)",
      photo: startupsImg,
    },
  ];
  return (
    <section className="fl-section" id="industries">
      <div className="fl-container">
        <Reveal>
          <div className="fl-header-row" style={{ textAlign: "center" }}>
            <div className="fl-eyebrow fl-eyebrow--center">Our context</div>
            <h2 className="fl-h2 fl-h2--center">
              Industry Expertise That Drives{" "}
              <span className="accent">Results</span>
            </h2>
          </div>
        </Reveal>
        <Reveal>
          <div className="fl-industries-grid">
            {items.map((it) => (
              <div
                className="fl-industry-tile"
                key={it.name}
                style={{ "--tile-bg": it.bg, "--tile-photo": `url(${it.photo})` }}
              >
                <span className="fl-industry-glyph">{it.g}</span>
                <div>
                  <h4>{it.name}</h4>
                  <span className="fl-ind-sub">{it.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- PROCESS ---------------- */
function Process() {
  const steps = [
    {
      title: "Discover",
      body: "A consultation to understand your workflows, pain points, and what you actually need.",
    },
    {
      title: "Plan",
      body: "We map the scope of work, review standards, software fit, and timelines up front.",
    },
    {
      title: "Onboard",
      body: "We assign the right professionals, set up secure access, and train on your processes.",
    },
    {
      title: "Deliver",
      body: "Your dedicated team runs ongoing work with structured internal review before it reaches you.",
    },
    {
      title: "Grow",
      body: "As trust builds, we scale with you into more complexity, entities, or service lines.",
      final: true,
    },
  ];
  return (
    <section className="fl-section fl-section--alt" id="process">
      <div className="fl-container">
        <Reveal>
          <div className="fl-header-row" style={{ textAlign: "center" }}>
            <div className="fl-eyebrow fl-eyebrow--center">The process</div>
            <h2 className="fl-h2 fl-h2--center">
              A Proven Framework For <span className="accent">Growth</span>
            </h2>
          </div>
        </Reveal>
        <Reveal>
          <div className="fl-process-row">
            {steps.map((s, i) => (
              <div
                className={`fl-process-step ${s.final ? "is-final" : ""}`}
                key={s.title}
              >
                <div className="fl-process-dot">
                  {s.final ? <SolarIcon name="rocket" /> : i + 1}
                </div>
                <h4>{s.title}</h4>
                <p>{s.body}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- TECH STACK ---------------- */
function TechStack() {
  const tools = [
    { name: "QuickBooks", logo: quickbooksLogo },
    { name: "Xero", logo: xeroLogo },
    { name: "TaxDome", logo: taxdomeLogo },
    { name: "NetSuite", logo: netsuiteLogo },
    { name: "Karbon", logo: karbonLogo },
    { name: "Canopy", logo: canopyLogo },
    { name: "FloQast", logo: floqastLogo },
    {
      name: "Power BI",
      mark: (
        <span className="fl-tool-mark fl-tool-mark--flat">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="12" width="4.5" height="9" rx="1" fill="#F2C811" />
            <rect x="9.75" y="7" width="4.5" height="14" rx="1" fill="#F2C811" />
            <rect x="16.5" y="3" width="4.5" height="18" rx="1" fill="#F2C811" />
          </svg>
        </span>
      ),
    },
  ];
  return (
    <section className="fl-section fl-tech-stack">
      <div className="fl-container">
        <Reveal>
          <div className="fl-header-row" style={{ textAlign: "center" }}>
            <div className="fl-eyebrow fl-eyebrow--center">Our tech stack</div>
            <h2 className="fl-h2 fl-h2--center">Platforms Our Team Works With</h2>
            <p className="fl-sub fl-sub--center">
              We integrate seamlessly with the tools your firm already uses.
            </p>
          </div>
        </Reveal>
        <Reveal>
          <div className="fl-tools-marquee">
            <div className="fl-tools-track">
              {[...tools, ...tools].map((t, i) => (
                <div className="fl-tool-card" key={`${t.name}-${i}`} aria-hidden={i >= tools.length}>
                  {t.logo ? (
                    <img src={t.logo} alt={`${t.name} logo`} className="fl-tool-logo" />
                  ) : (
                    t.mark
                  )}
                  <span className="fl-tool-name">{t.name}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- RESULTS + TESTIMONIALS ---------------- */
function Results() {
  const testimonials = [
    {
      quote:
        "Forth Ledger didn\u2019t just solve our immediate issues; they built a foundation for our next five years of growth. From the first month, they took the time to understand how our business actually operates instead of forcing us into a generic template, and that groundwork is still paying off today.",
      name: "Marcus Thorne",
      role: "COO, TechStream Global",
    },
    {
      quote:
        "The caliber of talent they integrated into our team was world-class. Our efficiency increased by 45% within 3 months, and just as importantly, our internal team finally had the bandwidth to focus on strategy instead of chasing reconciliations every week.",
      name: "Elena Rodriguez",
      role: "COO, BuildScale Inc.",
    },
    {
      quote:
        "Their financial visibility tools changed how we think about capital. We finally have data we can trust for big moves, with dashboards that update in real time instead of reports that were already stale by the time we saw them.",
      name: "David Chen",
      role: "CFO, EduFrontier",
    },
    {
      quote:
        "Month-end close went from two weeks to three days. The reporting alone paid for the engagement within the first quarter, and the team caught two reconciliation issues our previous bookkeeper had missed for months.",
      name: "Priya Nair",
      role: "VP of Finance, Northwind Logistics",
    },
  ];
  return (
    <section className="fl-section" id="results">
      <div className="fl-container">
        <Reveal>
          <div className="fl-results-grid">
            <div className="fl-results-lead">
              <div className="fl-eyebrow">Results</div>
              <h2 className="fl-h2">
                Proven ROI Through <span className="accent">Excellence</span>
              </h2>
              <a href="#results" className="fl-viewall">
                View All Success Stories <SolarIcon name="arrowRight" size={15} />
              </a>
            </div>
            <div className="fl-result-card indigo">
              <b>60%</b>
              <p className="label">Reduced Reporting Time</p>
              <p className="desc">
                Automated financial data pipelines for a global SaaS leader,
                saving 40 hours of manual labor per month.
              </p>
            </div>
            <div className="fl-result-card violet">
              <b>40%</b>
              <p className="label">Annual Savings</p>
              <p className="desc">
                Optimized operational workflows and supply-chain technology for
                a construction client.
              </p>
            </div>
          </div>
        </Reveal>
        <Reveal>
          <h3 className="fl-h2 fl-h2--center fl-testimonial-heading">
            Trusted By The World&rsquo;s Best
          </h3>
          <div className="fl-testimonial-grid">
            {testimonials.map((t) => (
              <div className="fl-testimonial" key={t.name}>
                <div className="fl-testimonial-person">
                  <div className="fl-avatar">
                    {t.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <b>{t.name}</b>
                    <span>{t.role}</span>
                  </div>
                </div>
                <div className="fl-testimonial-stars" aria-label="5 out of 5 stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <SolarIcon key={i} name="star" size={16} />
                  ))}
                </div>
                <p className="quote">&ldquo;{t.quote}&rdquo;</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- FAQ ---------------- */
function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);
  const questions = [
    {
      question: "What services can Forth Ledger handle for us?",
      answer:
        "We support bookkeeping, controllership, tax preparation, tax planning, financial analysis, CFO advisory, payroll accounting, and reporting workflows for growing businesses.",
    },
    {
      question: "How quickly can we start working together?",
      answer:
        "Most teams can begin with a discovery call, scope review, and onboarding plan within the first week. The exact timeline depends on your systems, current books, and reporting needs.",
    },
    {
      question: "Do you work with our existing accounting tools?",
      answer:
        "Yes. We adapt to your current stack wherever possible and can also recommend cleaner workflows, dashboards, and review processes when your tools need structure.",
    },
    {
      question: "Can you support multiple entities or countries?",
      answer:
        "Yes. Our delivery model is designed for multi-entity accounting, cross-border finance operations, and recurring close schedules across regions.",
    },
    {
      question: "Will we have a dedicated point of contact?",
      answer:
        "Yes. You get a clear delivery lead and communication rhythm, so questions, reviews, and monthly priorities do not get lost between teams.",
    },
  ];

  return (
    <section className="fl-faq-section" id="faq">
      <div className="fl-container">
        <Reveal>
          <div className="fl-faq-layout">
            <div className="fl-faq-copy">
              <div className="fl-eyebrow">FAQ</div>
              <h2 className="fl-h2">
                Frequently Asked <span className="accent">Questions</span>
              </h2>
              <p className="fl-sub">
                A quick look at how our finance support, onboarding, and team
                structure work before you book a consultation.
              </p>
            </div>
            <div className="fl-faq-list">
              {questions.map((item, index) => {
                const isOpen = index === openIndex;

                return (
                  <div
                    className={`fl-faq-item ${isOpen ? "is-open" : ""}`}
                    key={item.question}
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() =>
                        setOpenIndex((current) =>
                          current === index ? null : index,
                        )
                      }
                    >
                      <span>{item.question}</span>
                      <SolarIcon name="chevronDown" className="fl-faq-chevron" />
                    </button>
                    <div className="fl-faq-answer" aria-hidden={!isOpen}>
                      <p>{item.answer}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- FINAL CTA ---------------- */
function CtaBand() {
  const details = [
    { icon: "clock", text: "30-minute discovery call" },
    { icon: "check", text: "No obligation, no hard sell" },
    { icon: "phone", text: "Response within one business day" },
  ];
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [fieldErrors, setFieldErrors] = useState({});
  const [toast, setToast] = useState(null); // { type: "success" | "error", message } | null
  const toastTimerRef = useRef(null);
  const mountedAtRef = useRef(Date.now());

  const showToast = (type, message) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ type, message, id: Date.now() });
    toastTimerRef.current = setTimeout(() => setToast(null), TOAST_DURATION);
  };

  const dismissToast = () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(null);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const validate = (data) => {
    const errors = {};
    const name = (data.name || "").trim();
    const email = (data.email || "").trim();
    const region = (data.region || "").trim();
    const message = (data.message || "").trim();

    if (!name) {
      errors.name = "Please enter your full name.";
    } else if (name.length < 2) {
      errors.name = "That name looks too short.";
    }

    if (!email) {
      errors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      errors.email = "Please enter a valid email address.";
    }

    if (!region) {
      errors.region = "Please select a region.";
    }

    if (!message) {
      errors.message = "Please tell us what you need help with.";
    } else if (message.length > 3000) {
      errors.message = "Please keep this under 3000 characters.";
    }

    return errors;
  };

  const handleFieldChange = (event) => {
    const { name } = event.target;
    if (name && fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.target;
    const data = {
      ...Object.fromEntries(new FormData(form).entries()),
      elapsedMs: Date.now() - mountedAtRef.current,
    };

    const errors = validate(data);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    setStatus("submitting");

    try {
      const res = await fetch("/api/consult.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json().catch(() => null);
      if (!res.ok || !result?.success) {
        throw new Error(result?.error || "Something went wrong. Please try again.");
      }
      setStatus("success");
      form.reset();
      showToast(
        "success",
        "Thanks, we've got your request and will be in touch within one business day."
      );
    } catch (err) {
      const message =
        err instanceof TypeError
          ? "Couldn't reach the server. Check your connection and try again."
          : err.message || "Something went wrong. Please try again.";
      setStatus("error");
      showToast("error", message);
    }
  };

  return (
    <section className="fl-cta-band" id="contact">
      <div className="fl-container">
        <Reveal>
          <div className="fl-cta-layout">
            <div className="fl-cta-copy">
              <div className="fl-cta-kicker">Book a consultation</div>
              <h2>
                Let&apos;s build your <span>offshore finance team</span>
              </h2>
              <p>
                Tell us where your books stand today. We&rsquo;ll design a
                delivery model, team and SLA tailored to your firm and show you
                exactly what the first 90 days look like.
              </p>
              <div className="fl-cta-points">
                {details.map((item) => (
                  <div className="fl-cta-point" key={item.text}>
                    <span>
                      <SolarIcon name={item.icon} />
                    </span>
                    <p>{item.text}</p>
                  </div>
                ))}
              </div>
              <div className="fl-contact-cta">
                Or email us directly: <a href="mailto:connect@forthledger.com">connect@forthledger.com</a>
              </div>
            </div>
            <form
              className="fl-cta-form"
              onSubmit={handleSubmit}
              onChange={handleFieldChange}
              noValidate
            >
              <h3>Request your free consultation</h3>
              <div className="fl-cta-form-grid">
                <label className={fieldErrors.name ? "has-error" : ""}>
                  <span>Full name <b>*</b></span>
                  <input
                    type="text"
                    name="name"
                    placeholder="Jane Doe"
                    aria-invalid={!!fieldErrors.name}
                  />
                  {fieldErrors.name && (
                    <small className="fl-field-error">{fieldErrors.name}</small>
                  )}
                </label>
                <label className={fieldErrors.email ? "has-error" : ""}>
                  <span>Work email <b>*</b></span>
                  <input
                    type="email"
                    name="email"
                    placeholder="jane@firm.com"
                    aria-invalid={!!fieldErrors.email}
                  />
                  {fieldErrors.email && (
                    <small className="fl-field-error">{fieldErrors.email}</small>
                  )}
                </label>
                <label>
                  <span>Company</span>
                  <input type="text" name="company" placeholder="Firm name" />
                </label>
                <label className={fieldErrors.region ? "has-error" : ""}>
                  <span>Region <b>*</b></span>
                  <select
                    name="region"
                    defaultValue=""
                    aria-invalid={!!fieldErrors.region}
                  >
                    <option value="" disabled>
                      Select region
                    </option>
                    <option>United States</option>
                    <option>United Kingdom</option>
                    <option>Europe</option>
                    <option>Asia Pacific</option>
                    <option>Middle East</option>
                    <option>Others</option>
                  </select>
                  {fieldErrors.region && (
                    <small className="fl-field-error">{fieldErrors.region}</small>
                  )}
                </label>
              </div>
              <label className={`fl-cta-form-wide ${fieldErrors.message ? "has-error" : ""}`}>
                <span>What do you need help with? <b>*</b></span>
                <textarea
                  name="message"
                  placeholder="e.g. Ongoing bookkeeping + a books clean-up for 2 entities"
                  rows="4"
                  aria-invalid={!!fieldErrors.message}
                />
                {fieldErrors.message && (
                  <small className="fl-field-error">{fieldErrors.message}</small>
                )}
              </label>
              {/* Honeypot: hidden from real users, bots tend to fill every field */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="fl-cta-honeypot"
              />
              <button
                className="fl-cta-submit"
                type="submit"
                disabled={status === "submitting"}
              >
                {status === "submitting" ? "Sending…" : "Book my consultation"}{" "}
                <span aria-hidden="true">↗</span>
              </button>
              <p className="fl-cta-privacy">
                We respect your privacy. Your details are encrypted and never
                shared.
              </p>
            </form>
          </div>
        </Reveal>
        <Toast toast={toast} onDismiss={dismissToast} />
      </div>
    </section>
  );
}

/* ---------------- TEAM ---------------- */
function Team() {
  const departments = [
    {
      title: "Leadership Team",
      members: [
        {
          name: "CA Amrit Chapagain",
          role: "Co-Founder & Managing Director",
          specialization:
            "IFRS Reporting • Audit • Offshore Accounting • Financial Reporting",
          bio:
            "Leads the company's strategic direction, client relationships, quality assurance, and business growth initiatives.",
          image: amritImg,
          email: "amrit@forthledger.com",
          linkedin: "https://www.linkedin.com/in/amrit-chapagain-ca-8851a8282/",
        },
        {
          name: "Anupam Kafle",
          role: "Co-Founder & Director",
          specialization: "Client Success • Business Development • Relationship Management",
          bio:
            "Leads client onboarding, business development, strategic partnerships, and long-term client success.",
          image: anupamImg,
          email: "anupam@forthledger.com",
          linkedin: "https://www.linkedin.com/in/anupam-kafle-052605284/",
        },
      ],
    },
    {
      title: "Strategic Advisor",
      members: [
        {
          name: "CA Basanta Lama",
          role: "Strategic Advisor, Offshore Accounting",
          specialization: "Offshore Accounting • Process Excellence • Quality Assurance",
          bio:
            "Provides strategic guidance on offshore accounting operations, bookkeeping processes, quality assurance, and international best practices.",
          image: basantaImg,
        },
      ],
    },
    {
      title: "Management Team",
      members: [
        { name: "Utsab Bhandari", role: "Head of Operations", bio: "Oversees workflow management, resource planning, service delivery, and operational excellence.", image: utsabImg },
        { name: "Samir Sapkota", role: "Head of Tax & Compliance", bio: "Leads tax support, compliance services, and technical advisory to ensure regulatory accuracy.", image: samirImg },
        { name: "Anamol Sitaula", role: "Data & Automation Engineer", bio: "Develops workflow automation, reporting dashboards, and data-driven accounting solutions that improve operational efficiency.", image: anamolImg },
      ],
    },
    {
      title: "Accounting Team",
      members: [
        { name: "Prashant Joshi", role: "Senior Accountant", bio: "Supports financial reporting, reconciliations, month-end close, and accounting review processes.", image: prashantImg },
        { name: "Diwas Bhandari", role: "Senior Bookkeeping Associate", bio: "Delivers day-to-day bookkeeping, reconciliations, accounts payable/receivable support, and financial record maintenance.", image: diwasImg },
      ],
    },
    {
      title: "Bookkeeping Associates",
      hidden: true,
      members: [
        { name: "Bookkeeping Associate", role: "", bio: "Provides accurate transaction recording, bank reconciliations, account maintenance, and routine accounting support while following standardized quality control procedures." },
        { name: "Bookkeeping Associate", role: "", bio: "Provides accurate transaction recording, bank reconciliations, account maintenance, and routine accounting support while following standardized quality control procedures." },
        { name: "Bookkeeping Associate", role: "", bio: "Provides accurate transaction recording, bank reconciliations, account maintenance, and routine accounting support while following standardized quality control procedures." },
      ],
    },
  ];

  return (
    <section className="fl-team-section meet-team" id="team">
      <div className="fl-container">
        <Reveal>
          <div className="meet-team-header" style={{ textAlign: "center" }}>
            <div className="fl-eyebrow fl-eyebrow--center">Meet the Team Behind Forth Ledger</div>
            <h2 className="fl-h2 fl-h2--center">Our team brings together chartered accountants, accounting professionals, tax specialists, operations experts, and technology professionals committed to delivering reliable, accurate, and scalable offshore accounting solutions. One Team. One Standard. One Commitment to Excellence.</h2>
          </div>
        </Reveal>

        {departments.filter((dept) => !dept.hidden).map((dept) => {
          const isFeatured = dept.title === "Leadership Team" || dept.members.length === 1;
          return (
            <Reveal key={dept.title}>
              <div className="team-dept">
                <h3 className="team-dept-title">{dept.title}</h3>
                {isFeatured ? (
                  <div className="team-feature-list">
                    {dept.members.map((m) => (
                      <div className="team-feature-row" key={m.name} tabIndex={0}>
                        <div className="team-feature-photo" aria-hidden="true">
                          {m.image ? (
                            <img src={m.image} alt={m.name} />
                          ) : (
                            <span className="team-initials-big">
                              {m.name.split(" ").slice(0,2).map(n=>n[0]).join("")}
                            </span>
                          )}
                        </div>
                        <div className="team-feature-content">
                          <h4>{m.name}</h4>
                          {m.role && <small className="team-role">{m.role}</small>}
                          {m.specialization && <div className="team-special">{m.specialization}</div>}
                          <p className="team-bio">{m.bio}</p>
                          {dept.title === "Leadership Team" && (
                            <div className="team-social-links">
                              <a
                                href={m.email ? `mailto:${m.email}` : "#"}
                                className="team-social-icon"
                                aria-label={`Email ${m.name}`}
                              >
                                <SolarIcon name="mail" size={18} />
                              </a>
                              <a
                                href={m.linkedin || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="team-social-icon"
                                aria-label={`${m.name} on LinkedIn`}
                              >
                                <SolarIcon name="linkedin" size={18} />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="team-grid">
                    {dept.members.map((m, idx) => (
                      <div className="team-card" key={`${m.name}-${idx}`} tabIndex={0}>
                        <div className="team-photo" aria-hidden="true">
                          {m.image ? (
                            <img src={m.image} alt={m.name} className="team-photo-img" />
                          ) : (
                            <span className="team-initials">{m.name.split(" ").slice(0,2).map(n=>n[0]).join("")}</span>
                          )}
                        </div>
                        <div className="team-info">
                          <h4>{m.name}</h4>
                          {m.role && <small className="team-role">{m.role}</small>}
                          {m.specialization && <div className="team-special">{m.specialization}</div>}
                          <p className="team-bio">{m.bio}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Reveal>
          );
        })}

        <Reveal>
          <div className="team-commitment">
            <h3>Our Commitment</h3>
            <p>Every engagement at Forth Ledger follows a structured workflow supported by qualified professionals, standardized review procedures, secure technology, and transparent communication. We don't just provide accounting services. We become a trusted extension of your team, committed to helping your business grow with confidence.</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- FOOTER ---------------- */
function Footer() {
  return (
    <footer className="fl-footer">
      <div className="fl-container">
        <div className="fl-footer-grid">
          <div className="fl-footer-brand">
            <div className="fl-logo">
              <img
                src={logoMark}
                alt="Forth Ledger"
                className="fl-footer-logo-image"
              />
            </div>
            <p>
              Accounting outsourcing and financial management for high-growth,
              modern businesses.
            </p>
            <p>
              <a href="mailto:connect@forthledger.com">connect@forthledger.com</a>
            </p>
            <div className="fl-social">
              <a
                href="https://www.linkedin.com/company/forth-ledger/"
                aria-label="LinkedIn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <SolarIcon name="linkedin" size={15} />
              </a>
              <a
                href="https://www.facebook.com/share/1CYHgP1JMk/"
                aria-label="Facebook"
                target="_blank"
                rel="noopener noreferrer"
              >
                <SolarIcon name="facebook" size={15} />
              </a>
              <a
                href="https://www.instagram.com/forth_ledger?igsh=MTkyNWMzb3J2M3N1MQ=="
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <SolarIcon name="instagram" size={15} />
              </a>
              <a href="mailto:connect@forthledger.com" aria-label="Email">
                <SolarIcon name="mail" size={15} />
              </a>
            </div>
          </div>
          <div>
            <h5>Services</h5>
            <ul>
              <li>
                <a href="#services">Bookkeeping &amp; Accounting</a>
              </li>
              <li>
                <a href="#services">Financial Reporting</a>
              </li>
              <li>
                <a href="#services">Accounts Payable &amp; Receivable</a>
              </li>
              <li>
                <a href="#services">Payroll Support</a>
              </li>
              <li>
                <a href="#services">Cloud Accounting Solutions</a>
              </li>
              <li>
                <a href="#services">CFO &amp; Advisory Support</a>
              </li>
              <li>
                <a href="#services">CPA Firm Support</a>
              </li>
              <li>
                <a href="#services">Audit Support</a>
              </li>
            </ul>
          </div>
          <div>
            <h5>Industries</h5>
            <ul>
              <li>
                <a href="#industries">Accounting &amp; CPA</a>
              </li>
              <li>
                <a href="#industries">Construction</a>
              </li>
              <li>
                <a href="#industries">Education</a>
              </li>
              <li>
                <a href="#industries">Technology</a>
              </li>
            </ul>
          </div>
          <div>
            <h5>Company</h5>
            <ul>
              <li>
                <a href="#about-us">About Us</a>
              </li>
              <li>
                <a href="#results">Insights</a>
              </li>
              <li>
                <a href="#contact">Contact</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="fl-footer-bottom">
          <span>
            © {new Date().getFullYear()} Forth Ledger. All rights reserved.
          </span>
          <span>Registered financial services partner</span>
          <span>Contact: <a href="mailto:connect@forthledger.com">connect@forthledger.com</a></span>
        </div>
      </div>
    </footer>
  );
}

/* ---------------- APP ---------------- */
export default function App() {
  return (
    <div className="fl-root">
      <Nav />
      <Hero />
      <WhatWeSolve />
      <TrustedPerformance />
      <WhyUs />
      <Team />
      <Solutions />
      <TechStack />
      <ServicesShowcase />
      <Industries />
      <Process />
      <Results />
      <FAQ />
      <CtaBand />
      <Footer />
      <BackToTop />
    </div>
  );
}
