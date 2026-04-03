import { useState, useRef, useEffect, useCallback } from "react";

// ============================================
// SVG ICON SYSTEM — Premium Hand-Crafted Icons
// ============================================
const Icons = {
  // Navigation & Actions
  search: (props) => <svg width={props.size||20} height={props.size||20} viewBox="0 0 24 24" fill="none" stroke={props.color||"currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  settings: (props) => <svg width={props.size||20} height={props.size||20} viewBox="0 0 24 24" fill="none" stroke={props.color||"currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>,
  bell: (props) => <svg width={props.size||20} height={props.size||20} viewBox="0 0 24 24" fill="none" stroke={props.color||"currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>,
  logout: (props) => <svg width={props.size||20} height={props.size||20} viewBox="0 0 24 24" fill="none" stroke={props.color||"currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  menu: (props) => <svg width={props.size||20} height={props.size||20} viewBox="0 0 24 24" fill="none" stroke={props.color||"currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/></svg>,
  home: (props) => <svg width={props.size||20} height={props.size||20} viewBox="0 0 24 24" fill="none" stroke={props.color||"currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,

  // CRUD / User Actions
  edit: (props) => <svg width={props.size||20} height={props.size||20} viewBox="0 0 24 24" fill="none" stroke={props.color||"currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>,
  copy: (props) => <svg width={props.size||20} height={props.size||20} viewBox="0 0 24 24" fill="none" stroke={props.color||"currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>,
  trash: (props) => <svg width={props.size||20} height={props.size||20} viewBox="0 0 24 24" fill="none" stroke={props.color||"currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>,
  gift: (props) => <svg width={props.size||20} height={props.size||20} viewBox="0 0 24 24" fill="none" stroke={props.color||"currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/></svg>,
  plus: (props) => <svg width={props.size||20} height={props.size||20} viewBox="0 0 24 24" fill="none" stroke={props.color||"currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>,
  check: (props) => <svg width={props.size||20} height={props.size||20} viewBox="0 0 24 24" fill="none" stroke={props.color||"currentColor"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>,
  x: (props) => <svg width={props.size||20} height={props.size||20} viewBox="0 0 24 24" fill="none" stroke={props.color||"currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>,

  // Content / Features
  users: (props) => <svg width={props.size||20} height={props.size||20} viewBox="0 0 24 24" fill="none" stroke={props.color||"currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  message: (props) => <svg width={props.size||20} height={props.size||20} viewBox="0 0 24 24" fill="none" stroke={props.color||"currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>,
  chart: (props) => <svg width={props.size||20} height={props.size||20} viewBox="0 0 24 24" fill="none" stroke={props.color||"currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>,
  dollar: (props) => <svg width={props.size||20} height={props.size||20} viewBox="0 0 24 24" fill="none" stroke={props.color||"currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  wallet: (props) => <svg width={props.size||20} height={props.size||20} viewBox="0 0 24 24" fill="none" stroke={props.color||"currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>,
  link: (props) => <svg width={props.size||20} height={props.size||20} viewBox="0 0 24 24" fill="none" stroke={props.color||"currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  qrcode: (props) => <svg width={props.size||20} height={props.size||20} viewBox="0 0 24 24" fill="none" stroke={props.color||"currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/></svg>,
  download: (props) => <svg width={props.size||20} height={props.size||20} viewBox="0 0 24 24" fill="none" stroke={props.color||"currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  filter: (props) => <svg width={props.size||20} height={props.size||20} viewBox="0 0 24 24" fill="none" stroke={props.color||"currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  chevronDown: (props) => <svg width={props.size||16} height={props.size||16} viewBox="0 0 24 24" fill="none" stroke={props.color||"currentColor"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>,
  externalLink: (props) => <svg width={props.size||20} height={props.size||20} viewBox="0 0 24 24" fill="none" stroke={props.color||"currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>,

  // AI Features
  brain: (props) => <svg width={props.size||20} height={props.size||20} viewBox="0 0 24 24" fill="none" stroke={props.color||"currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/><path d="M3.477 10.896a4 4 0 0 1 .585-.396"/><path d="M19.938 10.5a4 4 0 0 1 .585.396"/><path d="M6 18a4 4 0 0 1-1.967-.516"/><path d="M19.967 17.484A4 4 0 0 1 18 18"/></svg>,
  sparkles: (props) => <svg width={props.size||20} height={props.size||20} viewBox="0 0 24 24" fill="none" stroke={props.color||"currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>,
  wand: (props) => <svg width={props.size||20} height={props.size||20} viewBox="0 0 24 24" fill="none" stroke={props.color||"currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 4V2"/><path d="M15 16v-2"/><path d="M8 9h2"/><path d="M20 9h2"/><path d="M17.8 11.8 19 13"/><path d="M15 9h0"/><path d="M17.8 6.2 19 5"/><path d="m3 21 9-9"/><path d="M12.2 6.2 11 5"/></svg>,
  messageAI: (props) => <svg width={props.size||20} height={props.size||20} viewBox="0 0 24 24" fill="none" stroke={props.color||"currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 6V2H8"/><path d="m8 18-4 4V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2Z"/><path d="M2 12h2"/><path d="M9 11v2"/><path d="M15 11v2"/><path d="M20 12h2"/></svg>,
  image: (props) => <svg width={props.size||20} height={props.size||20} viewBox="0 0 24 24" fill="none" stroke={props.color||"currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>,
  barChart: (props) => <svg width={props.size||20} height={props.size||20} viewBox="0 0 24 24" fill="none" stroke={props.color||"currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>,
  lock: (props) => <svg width={props.size||20} height={props.size||20} viewBox="0 0 24 24" fill="none" stroke={props.color||"currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,

  // Theme
  sun: (props) => <svg width={props.size||20} height={props.size||20} viewBox="0 0 24 24" fill="none" stroke={props.color||"currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>,
  moon: (props) => <svg width={props.size||20} height={props.size||20} viewBox="0 0 24 24" fill="none" stroke={props.color||"currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>,
  monitor: (props) => <svg width={props.size||20} height={props.size||20} viewBox="0 0 24 24" fill="none" stroke={props.color||"currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,

  // AI Bot — Premium Custom SVG
  aiBot: (props) => {
    const s = props.size || 24;
    const c = props.color || "currentColor";
    return (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
        <rect x="4" y="8" width="24" height="18" rx="5" stroke={c} strokeWidth="2"/>
        <circle cx="12" cy="17" r="2.5" fill={c}/>
        <circle cx="20" cy="17" r="2.5" fill={c}/>
        <path d="M12 22c0 0 2 2.5 4 2.5s4-2.5 4-2.5" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M16 8V4" stroke={c} strokeWidth="2" strokeLinecap="round"/>
        <circle cx="16" cy="3" r="1.5" fill={c}/>
        <path d="M4 15H2" stroke={c} strokeWidth="2" strokeLinecap="round"/>
        <path d="M30 15h-2" stroke={c} strokeWidth="2" strokeLinecap="round"/>
      </svg>
    );
  },
};

// ============================================
// THEME TOKENS
// ============================================
const themes = {
  light: {
    bg: "linear-gradient(135deg, #f0fdf4 0%, #f8fafc 40%, #ecfdf5 100%)",
    surface: "rgba(255,255,255,0.88)",
    surfaceSolid: "#ffffff",
    surfaceHover: "rgba(255,255,255,0.95)",
    surfaceSecondary: "#f8fafc",
    surfaceElevated: "rgba(255,255,255,0.92)",
    glass: "rgba(255,255,255,0.6)",
    border: "rgba(0,0,0,0.07)",
    borderLight: "rgba(0,0,0,0.04)",
    borderFocus: "#34d399",
    text: "#1f2937",
    textSecondary: "#4b5563",
    textMuted: "#9ca3af",
    textInverse: "#ffffff",
    primary: "#10b981",
    primaryLight: "#34d399",
    primaryLighter: "#6ee7b7",
    primaryDark: "#059669",
    primaryDarker: "#047857",
    primaryBg: "#ecfdf5",
    primaryBgHover: "#d1fae5",
    secondary: "#64748b",
    secondaryLight: "#94a3b8",
    secondaryLighter: "#cbd5e1",
    secondaryDark: "#475569",
    secondaryDarker: "#334155",
    accent: "#f59e0b",
    accentLight: "#fbbf24",
    accentDark: "#d97706",
    accentDarker: "#b45309",
    ai: "#8b5cf6",
    aiLight: "#a78bfa",
    aiDark: "#7c3aed",
    error: "#ef4444",
    errorBg: "#fef2f2",
    success: "#10b981",
    neutral50: "#fafbfc",
    neutral100: "#f4f6f8",
    neutral200: "#e8ecf0",
    neutral300: "#d1d9e0",
    cardShadow: "0 1px 2px rgba(0,0,0,0.03), 0 4px 12px rgba(0,0,0,0.05)",
    cardShadowHover: "0 4px 8px rgba(0,0,0,0.04), 0 12px 32px rgba(0,0,0,0.08)",
    btn3dPrimary: "0 4px 0 #047857, 0 6px 14px rgba(5,150,105,0.35), inset 0 1px 0 rgba(255,255,255,0.2)",
    btn3dPrimaryHover: "0 5px 0 #047857, 0 8px 20px rgba(5,150,105,0.4), inset 0 1px 0 rgba(255,255,255,0.25)",
    btn3dPrimaryActive: "0 1px 0 #047857, 0 2px 6px rgba(5,150,105,0.2), inset 0 2px 4px rgba(0,0,0,0.1)",
    btn3dSecondary: "0 4px 0 #334155, 0 6px 14px rgba(71,85,105,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
    btn3dSecondaryHover: "0 5px 0 #334155, 0 8px 20px rgba(71,85,105,0.35), inset 0 1px 0 rgba(255,255,255,0.2)",
    btn3dSecondaryActive: "0 1px 0 #334155, 0 2px 6px rgba(71,85,105,0.15), inset 0 2px 4px rgba(0,0,0,0.1)",
    selectShadow: "0 2px 0 #e8ecf0, 0 4px 8px rgba(0,0,0,0.03)",
    actionBtnBg: "#f4f6f8",
    actionBtnHoverBg: "#ecfdf5",
    backdrop: "blur(12px)",
  },
  dark: {
    bg: "linear-gradient(135deg, #0c1220 0%, #111827 40%, #0f1a2e 100%)",
    surface: "rgba(30,41,59,0.85)",
    surfaceSolid: "#1e293b",
    surfaceHover: "rgba(30,41,59,0.95)",
    surfaceSecondary: "#1a2332",
    surfaceElevated: "rgba(30,41,59,0.92)",
    glass: "rgba(30,41,59,0.5)",
    border: "rgba(255,255,255,0.08)",
    borderLight: "rgba(255,255,255,0.04)",
    borderFocus: "#34d399",
    text: "#f1f5f9",
    textSecondary: "#94a3b8",
    textMuted: "#64748b",
    textInverse: "#ffffff",
    primary: "#10b981",
    primaryLight: "#34d399",
    primaryLighter: "#6ee7b7",
    primaryDark: "#059669",
    primaryDarker: "#047857",
    primaryBg: "rgba(16,185,129,0.1)",
    primaryBgHover: "rgba(16,185,129,0.15)",
    secondary: "#64748b",
    secondaryLight: "#94a3b8",
    secondaryLighter: "#cbd5e1",
    secondaryDark: "#475569",
    secondaryDarker: "#334155",
    accent: "#f59e0b",
    accentLight: "#fbbf24",
    accentDark: "#d97706",
    accentDarker: "#b45309",
    ai: "#8b5cf6",
    aiLight: "#a78bfa",
    aiDark: "#7c3aed",
    error: "#ef4444",
    errorBg: "rgba(239,68,68,0.1)",
    success: "#10b981",
    neutral50: "rgba(255,255,255,0.03)",
    neutral100: "rgba(255,255,255,0.05)",
    neutral200: "rgba(255,255,255,0.08)",
    neutral300: "rgba(255,255,255,0.12)",
    cardShadow: "0 1px 2px rgba(0,0,0,0.2), 0 4px 12px rgba(0,0,0,0.3)",
    cardShadowHover: "0 4px 8px rgba(0,0,0,0.3), 0 12px 32px rgba(0,0,0,0.4)",
    btn3dPrimary: "0 4px 0 #047857, 0 6px 14px rgba(5,150,105,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
    btn3dPrimaryHover: "0 5px 0 #047857, 0 8px 20px rgba(5,150,105,0.5), inset 0 1px 0 rgba(255,255,255,0.2)",
    btn3dPrimaryActive: "0 1px 0 #047857, 0 2px 6px rgba(5,150,105,0.25), inset 0 2px 4px rgba(0,0,0,0.2)",
    btn3dSecondary: "0 4px 0 #1e293b, 0 6px 14px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
    btn3dSecondaryHover: "0 5px 0 #1e293b, 0 8px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.12)",
    btn3dSecondaryActive: "0 1px 0 #1e293b, 0 2px 6px rgba(0,0,0,0.3), inset 0 2px 4px rgba(0,0,0,0.2)",
    selectShadow: "0 2px 0 rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.2)",
    actionBtnBg: "rgba(255,255,255,0.05)",
    actionBtnHoverBg: "rgba(16,185,129,0.12)",
    backdrop: "blur(16px)",
  },
};

// ============================================
// COMPONENTS
// ============================================

const Btn = ({ variant = "primary", size = "md", children, t, icon, ...props }) => {
  const [state, setState] = useState("idle");
  const sizes = { sm: { p: "8px 16px", fs: 13, br: 10, ip: 6 }, md: { p: "12px 24px", fs: 14, br: 12, ip: 8 }, lg: { p: "16px 32px", fs: 16, br: 14, ip: 10 } };
  const s = sizes[size];

  const getStyles = () => {
    const isHover = state === "hover";
    const isActive = state === "active";
    const base = { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: s.ip, padding: s.p, border: "none", borderRadius: s.br, fontWeight: 600, fontSize: s.fs, lineHeight: 1, cursor: "pointer", userSelect: "none", transition: "transform 150ms cubic-bezier(0.16,1,0.3,1), box-shadow 150ms cubic-bezier(0.16,1,0.3,1)", fontFamily: "inherit" };

    if (variant === "primary") {
      return { ...base, background: `linear-gradient(180deg, ${isHover ? t.primaryLighter : t.primaryLight} 0%, ${isHover ? t.primaryLight : t.primary} 50%, ${isHover ? t.primary : t.primaryDark} 100%)`, color: "#fff", boxShadow: isActive ? t.btn3dPrimaryActive : isHover ? t.btn3dPrimaryHover : t.btn3dPrimary, textShadow: "0 1px 2px rgba(0,0,0,0.15)", transform: isActive ? "translateY(3px)" : isHover ? "translateY(-1px)" : "translateY(0)" };
    }
    if (variant === "secondary") {
      const bgLight = isHover ? t.secondaryLighter : t.secondaryLight;
      const bgMid = isHover ? t.secondaryLight : t.secondary;
      const bgDark = isHover ? t.secondary : t.secondaryDark;
      return { ...base, background: `linear-gradient(180deg, ${bgLight} 0%, ${bgMid} 50%, ${bgDark} 100%)`, color: "#fff", boxShadow: isActive ? t.btn3dSecondaryActive : isHover ? t.btn3dSecondaryHover : t.btn3dSecondary, textShadow: "0 1px 2px rgba(0,0,0,0.15)", transform: isActive ? "translateY(3px)" : isHover ? "translateY(-1px)" : "translateY(0)" };
    }
    if (variant === "warning") {
      return { ...base, background: `linear-gradient(180deg, ${isHover ? "#fcd34d" : t.accentLight} 0%, ${isHover ? t.accentLight : t.accent} 50%, ${isHover ? t.accent : t.accentDark} 100%)`, color: "#fff", boxShadow: isActive ? `0 1px 0 ${t.accentDarker}, 0 2px 6px rgba(217,119,6,0.2), inset 0 2px 4px rgba(0,0,0,0.1)` : isHover ? `0 5px 0 ${t.accentDarker}, 0 8px 20px rgba(217,119,6,0.4), inset 0 1px 0 rgba(255,255,255,0.25)` : `0 4px 0 ${t.accentDarker}, 0 6px 14px rgba(217,119,6,0.35), inset 0 1px 0 rgba(255,255,255,0.2)`, textShadow: "0 1px 2px rgba(0,0,0,0.15)", transform: isActive ? "translateY(3px)" : isHover ? "translateY(-1px)" : "translateY(0)" };
    }
    if (variant === "ghost") {
      return { ...base, background: isHover ? t.surfaceHover : t.surface, color: t.textSecondary, border: `1.5px solid ${isHover ? t.neutral300 : t.neutral200}`, boxShadow: isActive ? `0 0 0 ${t.neutral200}` : isHover ? `0 3px 0 ${t.neutral200}, 0 6px 12px rgba(0,0,0,0.06)` : `0 2px 0 ${t.neutral200}, 0 4px 8px rgba(0,0,0,0.04)`, transform: isActive ? "translateY(2px)" : isHover ? "translateY(-1px)" : "translateY(0)" };
    }
    if (variant === "danger") {
      return { ...base, background: `linear-gradient(180deg, #f87171 0%, ${t.error} 50%, #dc2626 100%)`, color: "#fff", boxShadow: isActive ? "0 1px 0 #b91c1c, 0 2px 6px rgba(239,68,68,0.2), inset 0 2px 4px rgba(0,0,0,0.1)" : isHover ? "0 5px 0 #b91c1c, 0 8px 20px rgba(239,68,68,0.4), inset 0 1px 0 rgba(255,255,255,0.25)" : "0 4px 0 #b91c1c, 0 6px 14px rgba(239,68,68,0.35), inset 0 1px 0 rgba(255,255,255,0.2)", textShadow: "0 1px 2px rgba(0,0,0,0.15)", transform: isActive ? "translateY(3px)" : isHover ? "translateY(-1px)" : "translateY(0)" };
    }
    return base;
  };

  return (
    <button onMouseEnter={() => setState("hover")} onMouseLeave={() => setState("idle")} onMouseDown={() => setState("active")} onMouseUp={() => setState("hover")} style={getStyles()} {...props}>
      {icon && icon}
      {children}
    </button>
  );
};

const Card = ({ children, t, hover = true, style = {} }) => {
  const [h, setH] = useState(false);
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{
      background: t.surface, backdropFilter: t.backdrop, border: `1px solid ${t.border}`,
      borderRadius: 16, boxShadow: h && hover ? t.cardShadowHover : t.cardShadow,
      transform: h && hover ? "translateY(-4px)" : "translateY(0)",
      transition: "transform 300ms cubic-bezier(0.16,1,0.3,1), box-shadow 300ms cubic-bezier(0.16,1,0.3,1)",
      overflow: "hidden", ...style,
    }}>{children}</div>
  );
};

const ActionBtn = ({ icon: I, t, destructive, tooltip, ...props }) => {
  const [h, setH] = useState(false);
  return (
    <button onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} title={tooltip} style={{
      width: 38, height: 38, borderRadius: 10, border: `1px solid ${h ? (destructive ? "rgba(239,68,68,0.3)" : t.borderFocus + "40") : t.border}`,
      background: h ? (destructive ? t.errorBg : t.actionBtnHoverBg) : t.actionBtnBg,
      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
      transform: h ? "scale(1.12)" : "scale(1)",
      transition: "all 180ms cubic-bezier(0.34,1.56,0.64,1)",
      color: h ? (destructive ? t.error : t.primary) : t.textMuted,
    }} {...props}><I size={16} color="currentColor" /></button>
  );
};

const Badge = ({ type, children, t }) => {
  const styles = {
    aluno: { bg: "linear-gradient(135deg, #dbeafe, #eff6ff)", color: "#2563eb", border: "1px solid rgba(37,99,235,0.15)" },
    personal: { bg: `linear-gradient(135deg, ${t.primaryBg}, ${t.primaryBgHover || t.primaryBg})`, color: t.primaryDark, border: `1px solid ${t.primary}25` },
    "super-admin": { bg: "linear-gradient(135deg, #fef3c7, #fffbeb)", color: "#d97706", border: "1px solid rgba(217,119,6,0.15)" },
    verified: { bg: `linear-gradient(135deg, ${t.primaryBg}, ${t.primaryBgHover || t.primaryBg})`, color: t.primary, border: `1px solid ${t.primary}20` },
  };
  const s = styles[type] || styles.aluno;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 8, fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", background: s.bg, color: s.color, border: s.border }}>
      {type === "super-admin" && <Icons.sparkles size={10} color={s.color} />}
      {type === "verified" && <Icons.check size={10} color={s.color} />}
      {children}
    </span>
  );
};

const CustomSelect = ({ options, value, onChange, t }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const selected = options.find((o) => o.value === value);
  return (
    <div ref={ref} style={{ position: "relative", display: "inline-flex", minWidth: 170 }}>
      <button onClick={() => setIsOpen(!isOpen)} style={{
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, width: "100%", padding: "10px 14px 10px 16px",
        background: `linear-gradient(180deg, ${t.surfaceSolid} 0%, ${t.surfaceSecondary} 100%)`,
        border: `1.5px solid ${isOpen ? t.borderFocus : t.border}`, borderRadius: 12, fontSize: 14, fontWeight: 500, color: t.text,
        cursor: "pointer", boxShadow: t.selectShadow, transform: isOpen ? "translateY(1px)" : "translateY(0)",
        transition: "all 150ms cubic-bezier(0.16,1,0.3,1)", fontFamily: "inherit",
      }}>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selected?.label}</span>
        <span style={{ transition: "transform 250ms cubic-bezier(0.16,1,0.3,1)", transform: isOpen ? "rotate(180deg)" : "rotate(0)", display: "flex", flexShrink: 0 }}>
          <Icons.chevronDown size={16} color={t.textMuted} />
        </span>
      </button>
      <div style={{
        position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, minWidth: "100%",
        background: t.surfaceElevated, backdropFilter: "blur(20px)", border: `1px solid ${t.border}`,
        borderRadius: 14, boxShadow: "0 8px 16px rgba(0,0,0,0.1), 0 20px 48px rgba(0,0,0,0.15)",
        padding: 6, zIndex: 50, opacity: isOpen ? 1 : 0, transform: isOpen ? "translateY(0) scale(1)" : "translateY(-8px) scale(0.96)",
        pointerEvents: isOpen ? "auto" : "none", transition: "opacity 200ms cubic-bezier(0.16,1,0.3,1), transform 200ms cubic-bezier(0.16,1,0.3,1)",
      }}>
        {options.map((opt) => (
          <div key={opt.value} onClick={() => { onChange(opt.value); setIsOpen(false); }} style={{
            display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10,
            fontSize: 14, fontWeight: value === opt.value ? 600 : 500, color: value === opt.value ? t.primary : t.textSecondary,
            background: value === opt.value ? t.primaryBg : "transparent", cursor: "pointer", transition: "all 150ms ease",
          }} onMouseEnter={(e) => { if (value !== opt.value) { e.currentTarget.style.background = t.primaryBg; e.currentTarget.style.transform = "translateX(4px)"; } }}
            onMouseLeave={(e) => { if (value !== opt.value) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.transform = "translateX(0)"; } }}>
            {value === opt.value && <Icons.check size={14} color={t.primary} />}
            {opt.label}
          </div>
        ))}
      </div>
    </div>
  );
};

const SlidingTabs = ({ tabs, activeTab, onTabChange, t }) => {
  const [indicator, setIndicator] = useState({});
  const tabsRef = useRef([]);
  useEffect(() => {
    const idx = tabs.findIndex((x) => x.id === activeTab);
    const el = tabsRef.current[idx];
    if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
  }, [activeTab, tabs]);
  return (
    <div style={{ display: "flex", gap: 4, background: t.neutral100, padding: 4, borderRadius: 14, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 4, bottom: 4, borderRadius: 10, background: `linear-gradient(180deg, ${t.primaryLight}, ${t.primary})`, boxShadow: `0 2px 0 ${t.primaryDark}, 0 4px 8px rgba(5,150,105,0.25)`, left: indicator.left, width: indicator.width, transition: "left 300ms cubic-bezier(0.16,1,0.3,1), width 300ms cubic-bezier(0.16,1,0.3,1)" }} />
      {tabs.map((tab, i) => (
        <button key={tab.id} ref={(el) => (tabsRef.current[i] = el)} onClick={() => onTabChange(tab.id)} style={{ position: "relative", padding: "10px 20px", fontSize: 13, fontWeight: 600, color: activeTab === tab.id ? "#fff" : t.textMuted, background: "transparent", border: "none", borderRadius: 10, cursor: "pointer", zIndex: 1, transition: "color 200ms ease", fontFamily: "inherit", whiteSpace: "nowrap" }}>
          {tab.label}
        </button>
      ))}
    </div>
  );
};

const ProgressBar = ({ value, max }) => (
  <div style={{ width: "100%", height: 8, background: "rgba(128,128,128,0.1)", borderRadius: 8, overflow: "hidden" }}>
    <div style={{ height: "100%", borderRadius: 8, width: `${(value / max) * 100}%`, background: "linear-gradient(90deg, #34d399, #10b981, #34d399)", backgroundSize: "200% 100%", animation: "shimmer 2s ease-in-out infinite" }} />
  </div>
);

const AIBotFAB = ({ t }) => {
  const [h, setH] = useState(false);
  return (
    <button onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{
      width: 56, height: 56, borderRadius: 18, border: "none", cursor: "pointer",
      background: `linear-gradient(135deg, ${t.primary} 0%, ${t.primaryDark} 100%)`,
      boxShadow: h ? `0 8px 24px rgba(16,185,129,0.5), 0 0 0 4px ${t.primary}20` : `0 4px 16px rgba(16,185,129,0.35)`,
      transform: h ? "scale(1.08) rotate(-5deg)" : "scale(1)",
      transition: "all 300ms cubic-bezier(0.34,1.56,0.64,1)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <Icons.aiBot size={28} color="#fff" />
    </button>
  );
};

// ============================================
// MAIN APP
// ============================================
export default function PersonalIADesignSystem() {
  const [mode, setMode] = useState("light");
  const [section, setSection] = useState("buttons");
  const [activeTab, setActiveTab] = useState("overview");
  const [selectVal, setSelectVal] = useState("all");
  const t = themes[mode];

  const sections = [
    { id: "buttons", label: "Botões 3D", icon: Icons.plus },
    { id: "cards", label: "Cards", icon: Icons.copy },
    { id: "selects", label: "Selects & Tabs", icon: Icons.filter },
    { id: "users", label: "Usuários", icon: Icons.users },
    { id: "icons", label: "Iconografia", icon: Icons.sparkles },
    { id: "ai", label: "IA & Bot", icon: Icons.brain },
    { id: "navbar", label: "Navbar", icon: Icons.menu },
  ];

  return (
    <div style={{ minHeight: "100vh", background: t.bg, padding: "24px 16px", fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif", color: t.text, transition: "background 400ms ease" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes gentleBounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes shimmer { 0%, 100% { background-position: 0% 0%; } 50% { background-position: 100% 0%; } }
        @keyframes pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.4); } 50% { box-shadow: 0 0 0 8px rgba(16,185,129,0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; margin: 0; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.3); border-radius: 3px; }
      `}</style>

      <div style={{ maxWidth: 1060, margin: "0 auto" }}>
        {/* ---- HEADER ---- */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32, animation: "fadeInUp 400ms cubic-bezier(0.16,1,0.3,1) both" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: `linear-gradient(135deg, ${t.primaryLight}, ${t.primaryDark})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icons.sparkles size={22} color="#fff" />
            </div>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.5 }}>PersonalIA Design System</h1>
              <p style={{ fontSize: 13, color: t.textMuted, marginTop: 2 }}>v2.0 — Light & Dark • Todos os ícones SVG</p>
            </div>
          </div>
          {/* Theme Toggle */}
          <div style={{ display: "flex", gap: 4, background: t.neutral100, padding: 4, borderRadius: 12 }}>
            {[{ id: "light", Icon: Icons.sun }, { id: "dark", Icon: Icons.moon }].map(({ id, Icon }) => (
              <button key={id} onClick={() => setMode(id)} style={{
                width: 40, height: 36, borderRadius: 8, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                background: mode === id ? `linear-gradient(180deg, ${t.primaryLight}, ${t.primary})` : "transparent",
                color: mode === id ? "#fff" : t.textMuted, transition: "all 200ms ease", boxShadow: mode === id ? `0 2px 0 ${t.primaryDark}` : "none",
              }}><Icon size={16} /></button>
            ))}
          </div>
        </div>

        {/* ---- SECTION NAV ---- */}
        <div style={{ display: "flex", gap: 6, marginBottom: 28, flexWrap: "wrap" }}>
          {sections.map((s) => (
            <Btn key={s.id} variant={section === s.id ? "primary" : "ghost"} size="sm" t={t} onClick={() => setSection(s.id)} icon={<s.icon size={14} />}>
              {s.label}
            </Btn>
          ))}
        </div>

        {/* ============ BUTTONS ============ */}
        {section === "buttons" && (
          <div style={{ animation: "fadeInUp 400ms cubic-bezier(0.16,1,0.3,1) both" }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Sistema de Botões 3D — {mode === "light" ? "Claro" : "Escuro"}</h2>

            {[
              { title: "Primary (Verde)", variant: "primary", examples: [{ s: "sm", t: "Copiar" }, { s: "md", t: "Aplicar simulação" }, { s: "lg", t: "+ Nova Cobrança", icon: <Icons.plus size={18} color="#fff" /> }] },
              { title: "Secondary (Slate)", variant: "secondary", examples: [{ s: "sm", t: "Copiar Link", icon: <Icons.copy size={14} color="#fff" /> }, { s: "md", t: "Voltar para Super Admin" }, { s: "lg", t: "Saques PIX", icon: <Icons.download size={18} color="#fff" /> }] },
              { title: "Warning (Amber — Financeiro)", variant: "warning", examples: [{ s: "sm", t: "Cobrar" }, { s: "md", t: "+ Nova Cobrança", icon: <Icons.plus size={16} color="#fff" /> }] },
              { title: "Danger (Vermelho)", variant: "danger", examples: [{ s: "sm", t: "Excluir", icon: <Icons.trash size={14} color="#fff" /> }, { s: "md", t: "Remover Aluno" }] },
              { title: "Ghost (Outline)", variant: "ghost", examples: [{ s: "sm", t: "QR Code", icon: <Icons.qrcode size={14} /> }, { s: "md", t: "Copiar Link", icon: <Icons.link size={16} /> }, { s: "md", t: "Desativar" }] },
            ].map((group) => (
              <Card key={group.variant} t={t} style={{ padding: "24px 28px", marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>{group.title}</div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                  {group.examples.map((ex, i) => (
                    <Btn key={i} variant={group.variant} size={ex.s} t={t} icon={ex.icon}>{ex.t}</Btn>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* ============ CARDS ============ */}
        {section === "cards" && (
          <div style={{ animation: "fadeInUp 400ms cubic-bezier(0.16,1,0.3,1) both" }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Cards — {mode === "light" ? "Claro" : "Escuro"}</h2>

            <div style={{ fontSize: 12, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Stats Cards</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 28 }}>
              {[
                { Icon: Icons.users, label: "Indicados", value: "12", accent: "#3b82f6" },
                { Icon: Icons.dollar, label: "Ganhos Totais", value: "R$ 1.240,00", accent: "#f59e0b" },
                { Icon: Icons.wallet, label: "Saldo", value: "R$ 580,00", accent: "#10b981" },
                { Icon: Icons.chart, label: "Este Mês", value: "R$ 320,00", accent: "#8b5cf6" },
              ].map((stat, i) => (
                <Card key={i} t={t} style={{ padding: "20px 22px", animation: "fadeInUp 400ms cubic-bezier(0.16,1,0.3,1) both", animationDelay: `${i * 60}ms` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `${stat.accent}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <stat.Icon size={18} color={stat.accent} />
                    </div>
                    <span style={{ fontSize: 12, color: t.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{stat.label}</span>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{stat.value}</div>
                </Card>
              ))}
            </div>

            <div style={{ fontSize: 12, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Tool Cards (IA)</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 14, marginBottom: 28 }}>
              {[
                { Icon: Icons.wand, title: "Gerar Treino com IA", desc: "Crie treinos personalizados baseado no perfil do aluno", accent: "#10b981" },
                { Icon: Icons.messageAI, title: "Assistente IA", desc: "Tire dúvidas e obtenha insights sobre seus alunos", accent: "#3b82f6" },
                { Icon: Icons.image, title: "Gerador de Conteúdo", desc: "Crie posts para Instagram, stories, e-mails", accent: "#f59e0b" },
              ].map((tool, i) => (
                <Card key={i} t={t} style={{ padding: "26px 24px", cursor: "pointer", animation: "fadeInUp 400ms cubic-bezier(0.16,1,0.3,1) both", animationDelay: `${i * 80}ms` }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: `${tool.accent}12`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                    <tool.Icon size={24} color={tool.accent} />
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{tool.title}</div>
                  <div style={{ fontSize: 14, color: t.textMuted, lineHeight: 1.5 }}>{tool.desc}</div>
                </Card>
              ))}
            </div>

            <div style={{ fontSize: 12, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Em Breve (Disabled)</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 14, marginBottom: 28 }}>
              {[
                { Icon: Icons.image, title: "Comparação de Fotos", desc: "Análise antes/depois com IA" },
                { Icon: Icons.dollar, title: "Cobranças Inteligentes", desc: "Sugestões de cobrança por IA" },
                { Icon: Icons.barChart, title: "Análise de Sentimento", desc: "Entenda o humor dos alunos" },
              ].map((tool, i) => (
                <Card key={i} t={t} hover={false} style={{ padding: "26px 24px", opacity: 0.45, position: "relative" }}>
                  <div style={{ position: "absolute", top: 12, right: 12 }}><Icons.lock size={16} color={t.textMuted} /></div>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: t.neutral100, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                    <tool.Icon size={24} color={t.textMuted} />
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{tool.title}</div>
                  <div style={{ fontSize: 14, color: t.textMuted, lineHeight: 1.5 }}>{tool.desc}</div>
                </Card>
              ))}
            </div>

            <div style={{ fontSize: 12, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Notification Card</div>
            <Card t={t} style={{ padding: "16px 20px", borderLeft: `3px solid ${t.primary}`, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: t.primaryBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icons.dollar size={18} color={t.primary} />
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>Pagamento Recebido!</div>
                    <div style={{ fontSize: 13, color: t.textMuted, marginTop: 2 }}>Victor Agostinho Melo Duarte pagou R$ 5,00.</div>
                    <div style={{ fontSize: 12, color: t.textMuted, marginTop: 2 }}>09/03/2026, 13:08:18</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <ActionBtn icon={Icons.check} t={t} tooltip="Marcar como lida" />
                  <ActionBtn icon={Icons.trash} t={t} destructive tooltip="Excluir" />
                </div>
              </div>
            </Card>

            <div style={{ fontSize: 12, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Empty State</div>
            <Card t={t} style={{ padding: "48px 32px", textAlign: "center" }}>
              <div style={{ width: 64, height: 64, margin: "0 auto 20px", borderRadius: 20, background: t.primaryBg, display: "flex", alignItems: "center", justifyContent: "center", animation: "gentleBounce 3s ease-in-out infinite" }}>
                <Icons.message size={28} color={t.primary} />
              </div>
              <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Nenhuma conversa ainda</div>
              <div style={{ fontSize: 14, color: t.textMuted, marginBottom: 24, maxWidth: 300, margin: "0 auto 24px", lineHeight: 1.5 }}>Suas conversas com alunos e personal trainers aparecerão aqui.</div>
              <Btn variant="primary" t={t} icon={<Icons.message size={16} color="#fff" />}>Iniciar conversa</Btn>
            </Card>
          </div>
        )}

        {/* ============ SELECTS & TABS ============ */}
        {section === "selects" && (
          <div style={{ animation: "fadeInUp 400ms cubic-bezier(0.16,1,0.3,1) both" }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Selects, Tabs & Filtros — {mode === "light" ? "Claro" : "Escuro"}</h2>

            <Card t={t} style={{ padding: 28, marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Custom Select 3D</div>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
                <CustomSelect t={t} options={[{ value: "all", label: "Todos os tipos" }, { value: "personal", label: "Personal" }, { value: "aluno", label: "Aluno" }]} value={selectVal} onChange={setSelectVal} />
                <CustomSelect t={t} options={[{ value: "best", label: "Mais vendidos" }, { value: "recent", label: "Mais recentes" }, { value: "price", label: "Menor preço" }]} value="best" onChange={() => {}} />
              </div>
            </Card>

            <Card t={t} style={{ padding: 28, marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Sliding Tabs</div>
              <SlidingTabs t={t} tabs={[{ id: "overview", label: "Visão Geral" }, { id: "referrals", label: "Indicados" }, { id: "commissions", label: "Comissões" }, { id: "withdraw", label: "Saque" }]} activeTab={activeTab} onTabChange={setActiveTab} />
            </Card>

            <Card t={t} style={{ padding: 28, marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Progress Bar Animada</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>Próximo nível: Prata</span>
                <span style={{ fontSize: 13, color: t.textMuted }}>1 / 4 indicações</span>
              </div>
              <ProgressBar value={1} max={4} />
            </Card>

            <Card t={t} style={{ padding: 28 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Filter Pills</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["Todas", "Hipertrofia", "Emagrecimento", "Funcional", "Cardio"].map((pill, i) => (
                  <span key={pill} style={{
                    display: "inline-flex", padding: "8px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer",
                    userSelect: "none",
                    color: i === 0 ? "#fff" : t.textSecondary,
                    background: i === 0 ? `linear-gradient(180deg, ${t.primaryLight}, ${t.primary})` : t.surface,
                    border: i === 0 ? `1.5px solid ${t.primaryDark}` : `1.5px solid ${t.neutral200}`,
                    boxShadow: i === 0 ? `0 2px 0 ${t.primaryDarker}, 0 4px 8px rgba(5,150,105,0.25)` : `0 2px 0 ${t.neutral200}, 0 4px 8px rgba(0,0,0,0.04)`,
                    textShadow: i === 0 ? "0 1px 2px rgba(0,0,0,0.15)" : "none",
                    transition: "transform 150ms cubic-bezier(0.16,1,0.3,1), box-shadow 150ms cubic-bezier(0.16,1,0.3,1)",
                  }}>{pill}</span>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* ============ USERS ============ */}
        {section === "users" && (
          <div style={{ animation: "fadeInUp 400ms cubic-bezier(0.16,1,0.3,1) both" }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Lista de Usuários — {mode === "light" ? "Claro" : "Escuro"}</h2>

            <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 200, position: "relative", display: "flex", alignItems: "center" }}>
                <span style={{ position: "absolute", left: 14, display: "flex", zIndex: 1 }}><Icons.search size={16} color={t.textMuted} /></span>
                <input placeholder="Buscar por nome ou email..." style={{
                  width: "100%", padding: "12px 16px 12px 42px", background: t.surface, backdropFilter: t.backdrop,
                  border: `1.5px solid ${t.border}`, borderRadius: 14, fontSize: 14, color: t.text,
                  boxShadow: "0 2px 6px rgba(0,0,0,0.03)", outline: "none", fontFamily: "inherit",
                }} />
              </div>
              <Btn variant="primary" size="sm" t={t} icon={<Icons.search size={14} color="#fff" />}>Buscar</Btn>
              <CustomSelect t={t} options={[{ value: "all", label: "Todos os tipos" }, { value: "personal", label: "Personal" }, { value: "aluno", label: "Aluno" }]} value={selectVal} onChange={setSelectVal} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { name: "Google Reviewer", email: "google-review@personalia.app.br", date: "05/03/2026", badges: ["aluno"], verified: true, color: "#10b981", letter: "G", canDelete: true },
                { name: "Isabela Bellusci Duarte", email: "bebelbellusci@hotmail.com", date: "01/03/2026", badges: ["aluno", "super-admin"], color: "#f59e0b", letter: "I", canDelete: false },
                { name: "Victor Agostinho Melo Duarte", email: "victor.duarte@personalia.app.br", date: "09/02/2026", badges: ["personal", "super-admin"], verified: true, color: "#f59e0b", letter: "V", canDelete: false },
              ].map((user, i) => (
                <Card key={i} t={t} style={{ padding: "14px 20px", animation: "fadeInUp 400ms cubic-bezier(0.16,1,0.3,1) both", animationDelay: `${i * 70}ms` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, color: "white", background: `linear-gradient(135deg, ${user.color}, ${user.color}bb)` }}>{user.letter}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 600, fontSize: 15 }}>{user.name}</span>
                        {user.badges.map((b) => <Badge key={b} type={b} t={t}>{b.replace("-", " ")}</Badge>)}
                        {user.verified && <Badge type="verified" t={t}>Verificado</Badge>}
                      </div>
                      <div style={{ fontSize: 13, color: t.textMuted, marginTop: 3 }}>{user.email} · {user.date}</div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <ActionBtn icon={Icons.edit} t={t} tooltip="Editar" />
                      <ActionBtn icon={Icons.copy} t={t} tooltip="Duplicar" />
                      <ActionBtn icon={Icons.gift} t={t} tooltip="Bônus" />
                      {user.canDelete && <ActionBtn icon={Icons.trash} t={t} destructive tooltip="Excluir" />}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ============ ICONS ============ */}
        {section === "icons" && (
          <div style={{ animation: "fadeInUp 400ms cubic-bezier(0.16,1,0.3,1) both" }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Iconografia SVG Completa</h2>
            <Card t={t} style={{ padding: 28 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 8 }}>
                {Object.entries(Icons).map(([name, Icon]) => (
                  <div key={name} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: 16, borderRadius: 12, background: t.neutral50, border: `1px solid ${t.borderLight}`, transition: "all 200ms ease" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = t.primaryBg; e.currentTarget.style.borderColor = t.primary + "30"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = t.neutral50; e.currentTarget.style.borderColor = t.borderLight; }}>
                    <Icon size={22} color={t.textSecondary} />
                    <span style={{ fontSize: 10, fontWeight: 600, color: t.textMuted, textAlign: "center" }}>{name}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* ============ AI & BOT ============ */}
        {section === "ai" && (
          <div style={{ animation: "fadeInUp 400ms cubic-bezier(0.16,1,0.3,1) both" }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>IA & AI Bot — {mode === "light" ? "Claro" : "Escuro"}</h2>

            <Card t={t} style={{ padding: 28, marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 20 }}>AI Bot FAB (Floating Action Button)</div>
              <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
                <AIBotFAB t={t} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Hover para ver a animação</div>
                  <div style={{ fontSize: 13, color: t.textMuted }}>Gradient verde + ícone SVG custom do bot • Scale + rotate no hover</div>
                </div>
              </div>
            </Card>

            <Card t={t} style={{ padding: 28, marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 20 }}>AI Bot Icon Variants</div>
              <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                {[24, 32, 40, 48].map((s) => (
                  <div key={s} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <div style={{ width: s * 1.5, height: s * 1.5, borderRadius: s * 0.35, background: `linear-gradient(135deg, ${t.primary}, ${t.primaryDark})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icons.aiBot size={s} color="#fff" />
                    </div>
                    <span style={{ fontSize: 11, color: t.textMuted }}>{s}px</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card t={t} style={{ padding: 28 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 20 }}>IA Stats Dashboard</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
                {[
                  { Icon: Icons.sparkles, label: "Chamadas IA (mês)", value: "247" },
                  { Icon: Icons.wand, label: "Tokens usados", value: "14.2k" },
                  { Icon: Icons.brain, label: "Ferramentas usadas", value: "3" },
                ].map((stat, i) => (
                  <div key={i} style={{ padding: "16px 18px", borderRadius: 14, background: t.neutral50, border: `1px solid ${t.borderLight}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <stat.Icon size={16} color={t.ai} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, textTransform: "uppercase", letterSpacing: 0.3 }}>{stat.label}</span>
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{stat.value}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* ============ NAVBAR ============ */}
        {section === "navbar" && (
          <div style={{ animation: "fadeInUp 400ms cubic-bezier(0.16,1,0.3,1) both" }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Navbar & Header — {mode === "light" ? "Claro" : "Escuro"}</h2>

            <Card t={t} style={{ padding: 0, marginBottom: 16, overflow: "hidden" }}>
              <div style={{ padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${t.borderLight}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: `linear-gradient(135deg, ${t.primaryLight}, ${t.primaryDark})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icons.sparkles size={16} color="#fff" />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 16 }}>PersonalIA</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative" }}>
                    <Icons.search size={16} color={t.textMuted} />
                    <span style={{ fontSize: 13, color: t.textMuted }}>Buscar...</span>
                    <div style={{ display: "flex", gap: 4, marginLeft: 8 }}>
                      <kbd style={{ padding: "2px 6px", borderRadius: 5, background: t.neutral100, border: `1px solid ${t.border}`, fontSize: 11, fontFamily: "inherit", color: t.textMuted }}>⌘</kbd>
                      <kbd style={{ padding: "2px 6px", borderRadius: 5, background: t.neutral100, border: `1px solid ${t.border}`, fontSize: 11, fontFamily: "inherit", color: t.textMuted }}>K</kbd>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {[Icons.sun, Icons.moon, Icons.message].map((Icon, i) => (
                    <button key={i} style={{
                      width: 36, height: 36, borderRadius: 10, border: `1px solid ${t.border}`,
                      background: i === 0 ? t.primaryBg : t.neutral50, color: i === 0 ? t.primary : t.textMuted,
                      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    }}><Icon size={16} /></button>
                  ))}
                  <div style={{ position: "relative" }}>
                    <button style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${t.border}`, background: t.neutral50, color: t.textMuted, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icons.bell size={16} />
                    </button>
                    <div style={{ position: "absolute", top: -2, right: -2, width: 16, height: 16, borderRadius: "50%", background: t.primary, color: "#fff", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${t.surfaceSolid}`, animation: "pulse 2s ease-in-out infinite" }}>1</div>
                  </div>
                  <div style={{ width: 1, height: 24, background: t.border, margin: "0 4px" }} />
                  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 8px 4px 4px", borderRadius: 12, background: t.neutral50, border: `1px solid ${t.borderLight}` }}>
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: `linear-gradient(135deg, ${t.accent}, ${t.accentDark})`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: "#fff" }}>V</div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>Victor A. M...</div>
                      <div style={{ fontSize: 10, color: t.primary, fontWeight: 600 }}>Administrador</div>
                    </div>
                  </div>
                  <button style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${t.border}`, background: t.neutral50, color: t.textMuted, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icons.settings size={16} />
                  </button>
                  <button style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${t.border}`, background: t.neutral50, color: t.textMuted, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icons.logout size={16} />
                  </button>
                </div>
              </div>
              <div style={{ padding: "10px 24px", fontSize: 13, color: t.textMuted }}>Preview da navbar com todos os ícones SVG premium</div>
            </Card>

            <Card t={t} style={{ padding: 28 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 20 }}>Action Buttons (User List)</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <ActionBtn icon={Icons.edit} t={t} tooltip="Editar" />
                <ActionBtn icon={Icons.copy} t={t} tooltip="Duplicar" />
                <ActionBtn icon={Icons.gift} t={t} tooltip="Bônus" />
                <ActionBtn icon={Icons.trash} t={t} destructive tooltip="Excluir" />
                <ActionBtn icon={Icons.externalLink} t={t} tooltip="Abrir" />
                <ActionBtn icon={Icons.settings} t={t} tooltip="Config" />
                <ActionBtn icon={Icons.download} t={t} tooltip="Download" />
              </div>
              <div style={{ fontSize: 13, color: t.textMuted, marginTop: 12 }}>Hover para ver as cores: verde para ações, vermelho para destrutivas</div>
            </Card>
          </div>
        )}

        {/* ---- FAB PREVIEW ---- */}
        <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 100 }}>
          <AIBotFAB t={t} />
        </div>
      </div>
    </div>
  );
}