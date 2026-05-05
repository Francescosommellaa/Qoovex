import { homeContent } from "@/pages/home/content/index";

export function HomeHeroSection() {
  return (
    <section className="py-10">
      <h1 className="m-0 font-display text-(length:--text-4xl) font-semibold text-text">{homeContent.title}</h1>
      <p className="mt-4 font-display text-(length:--text-xl) font-medium text-text">
        {homeContent.subtitle}
      </p>
      <p className="mt-3 max-w-3xl text-(length:--text-base) leading-relaxed text-text-muted">
        {homeContent.description}
      </p>
    </section>
  );
}
