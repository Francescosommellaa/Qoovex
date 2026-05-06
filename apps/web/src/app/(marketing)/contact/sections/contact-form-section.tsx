import { contactContent } from "@/pages/contact/content/index";
import { MarketingQuietSurface } from "@/shared/components/marketing-ds";

export function ContactFormSection() {
  return (
    <MarketingQuietSurface>
      <h1 className="m-0 font-display text-(length:--text-3xl) font-semibold text-text">{contactContent.title}</h1>
      <p className="m-0 max-w-3xl text-(length:--text-sm) leading-relaxed text-text-muted">
        {contactContent.description}
      </p>
      <p className="m-0 mt-2 text-(length:--text-xs) text-text-faint">Placeholder form contatti.</p>
    </MarketingQuietSurface>
  );
}
