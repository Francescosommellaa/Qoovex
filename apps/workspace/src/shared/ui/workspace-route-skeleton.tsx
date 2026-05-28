import { Card, CardBody, Skeleton, Stack } from "@qoovex/ui";

interface WorkspaceRouteSkeletonProps {
  variant?: "dashboard" | "collection" | "form" | "detail";
}

function HeaderSkeleton() {
  return (
    <div className="flex flex-col gap-(--spacing-3) border-b border-(--color-divider) pb-(--spacing-4) md:flex-row md:items-end md:justify-between">
      <div className="grid w-full max-w-(--measure-copy) gap-(--spacing-2)">
        <Skeleton variant="title" size="md" width="34%" />
        <Skeleton variant="text" size="sm" width="72%" />
      </div>
      <Skeleton variant="block" size="md" radius="full" width="9rem" />
    </div>
  );
}

function ToolbarSkeleton() {
  return (
    <div className="flex flex-col gap-(--spacing-3) lg:flex-row lg:items-end lg:justify-between">
      <Skeleton variant="block" size="lg" radius="lg" width="100%" />
      <div className="flex items-center gap-(--spacing-2)">
        <Skeleton variant="block" size="sm" radius="full" width="5rem" />
        <Skeleton variant="block" size="md" radius="full" width="9rem" />
      </div>
    </div>
  );
}

function CardGridSkeleton({ count }: { count: number }) {
  return (
    <div className="grid gap-(--spacing-4) md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} variant="panel" padding="md">
          <CardBody>
            <Stack gap="4">
              <Skeleton variant="thumbnail" size="md" radius="lg" width="100%" />
              <Skeleton variant="title" size="sm" width="70%" />
              <Stack gap="2">
                <Skeleton variant="text" size="sm" width="100%" />
                <Skeleton variant="text" size="sm" width="76%" />
              </Stack>
              <div className="flex gap-(--spacing-2)">
                <Skeleton variant="block" size="xs" radius="full" width="5rem" />
                <Skeleton variant="block" size="xs" radius="full" width="6rem" />
              </div>
            </Stack>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

export function WorkspaceRouteSkeleton({
  variant = "collection",
}: WorkspaceRouteSkeletonProps) {
  const isDashboard = variant === "dashboard";
  const isDetail = variant === "detail";
  const isForm = variant === "form";

  return (
    <section className="py-(--spacing-3) md:py-(--spacing-5)">
      <Stack gap="5" className="mx-auto w-full max-w-(--container-wide)">
        <HeaderSkeleton />
        {isDashboard ? (
          <>
            <div className="grid gap-(--spacing-4) md:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} variant="panel" padding="md">
                  <CardBody>
                    <Stack gap="3">
                      <Skeleton variant="text" size="xs" width="46%" />
                      <Skeleton variant="title" size="lg" width="24%" />
                      <Skeleton variant="block" size="xs" radius="full" width="4rem" />
                    </Stack>
                  </CardBody>
                </Card>
              ))}
            </div>
            <div className="grid gap-(--spacing-4) lg:grid-cols-3">
              <Card variant="panel" padding="lg">
                <CardBody>
                  <Stack gap="3">
                    <Skeleton variant="title" size="sm" width="44%" />
                    <Skeleton variant="text" size="sm" width="92%" />
                    <Skeleton variant="text" size="sm" width="84%" />
                    <Skeleton variant="text" size="sm" width="88%" />
                  </Stack>
                </CardBody>
              </Card>
              <Card variant="panel" padding="lg" className="lg:col-span-2">
                <CardBody>
                  <Stack gap="4">
                    <Skeleton variant="title" size="sm" width="32%" />
                    <div className="grid gap-(--spacing-3) md:grid-cols-3">
                      <Skeleton variant="block" size="md" radius="full" width="100%" />
                      <Skeleton variant="block" size="md" radius="full" width="100%" />
                      <Skeleton variant="block" size="md" radius="full" width="100%" />
                    </div>
                  </Stack>
                </CardBody>
              </Card>
            </div>
          </>
        ) : isForm ? (
          <Card variant="panel" padding="lg">
            <CardBody>
              <Stack gap="4">
                <Skeleton variant="block" size="lg" radius="lg" width="100%" />
                <Skeleton variant="block" size="lg" radius="lg" width="100%" />
                <Skeleton variant="block" size="xl" radius="lg" width="100%" />
                <Skeleton variant="block" size="md" radius="full" width="10rem" />
              </Stack>
            </CardBody>
          </Card>
        ) : isDetail ? (
          <div className="grid gap-(--spacing-4) xl:grid-cols-[minmax(0,1fr)_24rem]">
            <Card variant="panel" padding="lg">
              <CardBody>
                <Stack gap="4">
                  <Skeleton variant="title" size="sm" width="36%" />
                  <Skeleton variant="text" size="sm" width="94%" />
                  <Skeleton variant="text" size="sm" width="86%" />
                  <Skeleton variant="text" size="sm" width="74%" />
                </Stack>
              </CardBody>
            </Card>
            <Card variant="panel" padding="lg">
              <CardBody>
                <Stack gap="3">
                  <Skeleton variant="title" size="sm" width="48%" />
                  <Skeleton variant="block" size="md" radius="lg" width="100%" />
                  <Skeleton variant="block" size="md" radius="lg" width="100%" />
                </Stack>
              </CardBody>
            </Card>
          </div>
        ) : (
          <>
            <ToolbarSkeleton />
            <CardGridSkeleton count={6} />
          </>
        )}
      </Stack>
    </section>
  );
}
