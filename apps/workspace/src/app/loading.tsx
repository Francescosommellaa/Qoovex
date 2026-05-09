import { LoadingState, PageSection } from "@qoovex/ui";

export default function GlobalLoading() {
  return (
    <PageSection width="content" spacing="16">
      <LoadingState rows={7} />
    </PageSection>
  );
}
