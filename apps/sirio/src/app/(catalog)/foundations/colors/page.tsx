import { PageHeader } from "@/components/page-header";
import { ColorGrid, ColorSwatch } from "@/components/token-explorer";

export default function ColorsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Colori"
        description="I token semantici per il colore in Qoovex. Utilizzano OKLCH per una transizione fluida e percettivamente uniforme tra i temi."
        importPath="import '@qoovex/ui/styles/tokens.css'"
      />

      <div className="flex flex-col gap-12">
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Superfici principali</h2>
          <ColorGrid>
            <ColorSwatch name="Background" variable="--background" />
            <ColorSwatch name="Foreground" variable="--foreground" />
            <ColorSwatch name="Card" variable="--card" />
            <ColorSwatch name="Card Foreground" variable="--card-foreground" />
            <ColorSwatch name="Popover" variable="--popover" />
            <ColorSwatch name="Popover Foreground" variable="--popover-foreground" />
          </ColorGrid>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Brand & Semantica</h2>
          <ColorGrid>
            <ColorSwatch name="Primary" variable="--primary" />
            <ColorSwatch name="Primary Foreground" variable="--primary-foreground" />
            <ColorSwatch name="Secondary" variable="--secondary" />
            <ColorSwatch name="Secondary Foreground" variable="--secondary-foreground" />
            <ColorSwatch name="Muted" variable="--muted" />
            <ColorSwatch name="Muted Foreground" variable="--muted-foreground" />
            <ColorSwatch name="Accent" variable="--accent" />
            <ColorSwatch name="Accent Foreground" variable="--accent-foreground" />
          </ColorGrid>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Feedback</h2>
          <ColorGrid>
            <ColorSwatch name="Destructive" variable="--destructive" />
            <ColorSwatch name="Destructive Foreground" variable="--destructive-foreground" />
            <ColorSwatch name="Info" variable="--info" />
            <ColorSwatch name="Info Foreground" variable="--info-foreground" />
            <ColorSwatch name="Success" variable="--success" />
            <ColorSwatch name="Success Foreground" variable="--success-foreground" />
            <ColorSwatch name="Warning" variable="--warning" />
            <ColorSwatch name="Warning Foreground" variable="--warning-foreground" />
          </ColorGrid>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Form & UI</h2>
          <ColorGrid>
            <ColorSwatch name="Border" variable="--border" />
            <ColorSwatch name="Input" variable="--input" />
            <ColorSwatch name="Ring" variable="--ring" />
          </ColorGrid>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Sidebar</h2>
          <ColorGrid>
            <ColorSwatch name="Sidebar" variable="--sidebar" />
            <ColorSwatch name="Sidebar Foreground" variable="--sidebar-foreground" />
            <ColorSwatch name="Sidebar Primary" variable="--sidebar-primary" />
            <ColorSwatch name="Sidebar Primary Foreground" variable="--sidebar-primary-foreground" />
            <ColorSwatch name="Sidebar Accent" variable="--sidebar-accent" />
            <ColorSwatch name="Sidebar Accent Foreground" variable="--sidebar-accent-foreground" />
            <ColorSwatch name="Sidebar Border" variable="--sidebar-border" />
            <ColorSwatch name="Sidebar Ring" variable="--sidebar-ring" />
          </ColorGrid>
        </section>

      </div>
    </div>
  );
}
