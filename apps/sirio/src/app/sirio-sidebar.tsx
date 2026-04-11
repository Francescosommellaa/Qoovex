"use client";

const sections = [
  { id: "fondamenta", label: "Fondamenta" },
  { id: "colori", label: "Colori" },
  { id: "tipografia", label: "Tipografia" },
  { id: "spacing", label: "Spacing" },
  { id: "radius", label: "Corner Radius" },
  { id: "shadows", label: "Shadows" },
  { id: "animazioni", label: "Animazioni" },
  { id: "pulsanti", label: "Button" },
  { id: "input", label: "Input" },
  { id: "textarea", label: "Textarea" },
  { id: "searchbar", label: "SearchBar" },
  { id: "card", label: "Card" },
  { id: "badge", label: "Badge" },
  { id: "form", label: "Form" },
];

export function SiriaSidebar() {
  return (
    <aside
      style={{
        width: "220px",
        flexShrink: 0,
        borderRight: "1px solid rgba(255,255,255,0.08)",
        position: "sticky",
        top: "56px",
        height: "calc(100dvh - 56px)",
        overflowY: "auto",
        padding: "1.5rem 0",
        display: "none",
      }}
      className="sirio-sidebar"
    >
      <nav aria-label="Sezioni design system">
        <ul
          style={{
            listStyle: "none",
            display: "flex",
            flexDirection: "column",
            gap: "2px",
            padding: "0 0.75rem",
          }}
        >
          {sections.map((s) => (
            <SidebarLink key={s.id} id={s.id} label={s.label} />
          ))}
        </ul>
      </nav>
    </aside>
  );
}

function SidebarLink({ id, label }: { id: string; label: string }) {
  return (
    <li>
      <a
        href={`#${id}`}
        style={{
          display: "block",
          padding: "0.4rem 0.75rem",
          borderRadius: "6px",
          fontSize: "0.85rem",
          fontWeight: 500,
          color: "rgba(237,237,237,0.6)",
          textDecoration: "none",
          transition: "color 150ms ease, background 150ms ease",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.color = "#ededed";
          (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.color = "rgba(237,237,237,0.6)";
          (e.currentTarget as HTMLElement).style.background = "transparent";
        }}
      >
        {label}
      </a>
    </li>
  );
}
