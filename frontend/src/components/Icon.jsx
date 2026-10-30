// Inline SVG icon set carried over from the original design.
const P = {
  building: (<><path d="M4 21V6a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v15" /><path d="M14 21v-9a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v9" /><path d="M4 21h16M7 9h1M7 13h1M7 17h1M10 9h1M10 13h1M10 17h1M17 13h1M17 17h1" /></>),
  grid: (<><rect x="3" y="3" width="7" height="7" rx="1.6" /><rect x="14" y="3" width="7" height="7" rx="1.6" /><rect x="3" y="14" width="7" height="7" rx="1.6" /><rect x="14" y="14" width="7" height="7" rx="1.6" /></>),
  wrench: <path d="M14.7 6.3a4 4 0 0 0-5.6 5.2L3 17.6V21h3.4l6.1-6.1a4 4 0 0 0 5.2-5.6l-2.6 2.6-2-2 2.6-2.6z" />,
  list: (<><path d="M9 6h11M9 12h11M9 18h11" /><path d="m3 6 1.4 1.4L7 4.6M3 12l1.4 1.4L7 10.6M3 18l1.4 1.4L7 16.6" /></>),
  plus_circle: (<><circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" /></>),
  key: (<><circle cx="8" cy="15" r="4" /><path d="M10.8 12.2 20 3M17 6l2 2M14 9l2 2" /></>),
  logout: <path d="M10 17l5-5-5-5M15 12H3M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  globe: (<><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.5 3.8 5.7 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.7-3.8-9s1.3-6.5 3.8-9z" /></>),
  droplet: <path d="M12 3s6 7.2 6 11a6 6 0 0 1-12 0c0-3.8 6-11 6-11z" />,
  bolt: <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" />,
  sparkle: <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.5 6.5l2 2M15.5 15.5l2 2M17.5 6.5l-2 2M8.5 15.5l-2 2" />,
  shield: <path d="M12 3 19 6v6c0 4.4-3 8-7 9-4-1-7-4.6-7-9V6l7-3z" />,
  circle_x: (<><circle cx="12" cy="12" r="9" /><path d="m9 9 6 6M15 9l-6 6" /></>),
  inbox: (<><path d="M4 12h4l2 3h4l2-3h4" /><path d="M5.5 5h13L21 12v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6L5.5 5z" /></>),
  plus: <path d="M12 5v14M5 12h14" />,
  check: <path d="m5 12 4 4L19 6" />,
  phone: <path d="M5 4h4l2 5-2.4 1.4a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />,
  clock: (<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></>),
  leaf: (<><path d="M20 4c0 9-6 15-15 15C5 10 11 4 20 4z" /><path d="M13 11 5 19" /></>),
  arrow_right: <path d="M5 12h14M13 6l6 6-6 6" />,
  send: <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" />,
};

export default function Icon({ name, strokeWidth = 1.8 }) {
  return (
    <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {P[name] || null}
    </svg>
  );
}
