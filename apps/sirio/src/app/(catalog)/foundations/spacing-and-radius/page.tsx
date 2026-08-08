import { PageHeader } from "@/components/page-header";
import { SpacingSpecimen, RadiusSpecimen } from "@/components/token-explorer";

export default function SpacingAndRadiusPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Spaziatura e Raggio"
        description="Le scale di spaziatura, layout e border-radius che garantiscono il ritmo verticale e la consistenza visiva."
      />

      <div className="flex flex-col gap-12">
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Spaziatura Semantica</h2>
          <div className="flex flex-col gap-6 rounded-lg border p-6">
            <SpacingSpecimen name="Space 1" variable="--space-1" size="0.25rem (4px)" />
            <SpacingSpecimen name="Space 2" variable="--space-2" size="0.5rem (8px)" />
            <SpacingSpecimen name="Space 3" variable="--space-3" size="0.75rem (12px)" />
            <SpacingSpecimen name="Space 4" variable="--space-4" size="1rem (16px)" />
            <SpacingSpecimen name="Space 5" variable="--space-5" size="1.25rem (20px)" />
            <SpacingSpecimen name="Space 6" variable="--space-6" size="1.5rem (24px)" />
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Raggio (Border Radius)</h2>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 rounded-lg border p-6">
            <RadiusSpecimen name="Small" variable="--radius-sm" />
            <RadiusSpecimen name="Medium" variable="--radius-md" />
            <RadiusSpecimen name="Large (Base)" variable="--radius-lg" />
            <RadiusSpecimen name="Extra Large" variable="--radius-xl" />
          </div>
        </section>
      </div>
    </div>
  );
}
