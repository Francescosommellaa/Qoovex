import { LoadingState, PageSection } from "@qoovex/ui";

export default function WorkspaceLoading() {
  return (
    <PageSection width="content" spacing="16">
      <LoadingState rows={7} />
    </PageSection>
  );
}
