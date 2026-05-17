import { notFound } from "next/navigation";
import {
  Badge,
  Button,
  Card,
  CardBody,
  EmptyState,
  Input,
  PageSection,
  Stack,
  Text,
} from "@qoovex/ui";
import { MenuBuilderForm } from "@features/menu-builder";
import type { WorkspacePlan } from "@shared/lib/workspace-types";
import { getRecipeOptions } from "@shared/server/recipe-service";
import { getMenuDetail, getMenusIndex } from "@shared/server/menu-service";

interface MenusViewUser {
  id: string;
  plan: WorkspacePlan;
}

function formatLimit(used: number, value: number | null) {
  return value === null ? `${used} / illimitato` : `${used} / ${value}`;
}

export async function MenusIndexView({
  user,
  query,
}: {
  user: MenusViewUser;
  query?: string;
}) {
  const { menus, limit, canUseCustomQr, hasMenuWatermark } =
    await getMenusIndex(user.id, user.plan, query);

  return (
    <PageSection
      title="Menu"
      description="Carte digitali e menu operativi composti dalle ricette del workspace."
    >
      <Stack gap="6">
        <div className="flex flex-col gap-(--spacing-3) lg:flex-row lg:items-end lg:justify-between">
          <form className="min-w-0 flex-1" action="/menus">
            <Input
              name="q"
              label="Cerca menu"
              placeholder="Cerca per titolo o descrizione"
              defaultValue={query ?? ""}
            />
          </form>
          <div className="flex flex-wrap items-center gap-(--spacing-3)">
            <Badge tone={limit.reached ? "warning" : "primary"}>
              {formatLimit(limit.used, limit.value)}
            </Badge>
            <Badge tone={hasMenuWatermark ? "warning" : "success"}>
              {hasMenuWatermark ? "watermark" : "no watermark"}
            </Badge>
            <Badge tone={canUseCustomQr ? "success" : "neutral"}>
              {canUseCustomQr ? "QR custom" : "QR standard"}
            </Badge>
            <Button
              as="a"
              href="/menus/new"
              variant="primary"
              size="md"
              disabled={limit.reached}
            >
              Nuovo menu
            </Button>
          </div>
        </div>

        {menus.length === 0 ? (
          <EmptyState
            title="Nessun menu"
            description="Crea un menu dopo aver inserito almeno una ricetta."
            action={
              <Button as="a" href="/menus/new" variant="primary" size="md">
                Crea menu
              </Button>
            }
          />
        ) : (
          <div className="grid gap-(--spacing-4) md:grid-cols-2 xl:grid-cols-3">
            {menus.map((menu) => (
              <Card key={menu.id} variant="panel" padding="md">
                <CardBody>
                  <Stack gap="4">
                    <div className="flex items-start justify-between gap-(--spacing-3)">
                      <div className="min-w-0">
                        <Text as="h2" size="lg" weight="semibold" className="truncate">
                          {menu.title}
                        </Text>
                        {menu.description ? (
                          <Text size="sm" tone="muted" leading="relaxed">
                            {menu.description}
                          </Text>
                        ) : null}
                      </div>
                      <Badge tone={menu.isPublic ? "success" : "neutral"}>
                        {menu.isPublic ? "Pubblico" : "Privato"}
                      </Badge>
                    </div>
                    <Badge size="sm" tone="primary">
                      {menu.itemsCount} ricette
                    </Badge>
                    <Button
                      as="a"
                      href={`/menus/${menu.id}`}
                      variant="secondary"
                      size="sm"
                      className="self-start"
                    >
                      Apri menu
                    </Button>
                  </Stack>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </Stack>
    </PageSection>
  );
}

export async function NewMenuView({ user }: { user: MenusViewUser }) {
  const recipes = await getRecipeOptions(user.id);

  return (
    <PageSection
      title="Nuovo menu"
      description="Componi sezioni e ordine di servizio usando le ricette esistenti."
    >
      <MenuBuilderForm mode="create" recipes={recipes} />
    </PageSection>
  );
}

export async function MenuDetailView({
  user,
  menuId,
}: {
  user: MenusViewUser;
  menuId: string;
}) {
  const menu = await getMenuDetail(user.id, menuId);
  if (!menu) notFound();

  return (
    <PageSection title={menu.title} description={menu.description ?? undefined}>
      <Stack gap="6">
        <div className="flex flex-wrap items-center gap-(--spacing-2)">
          <Badge tone={menu.isPublic ? "success" : "neutral"}>
            {menu.isPublic ? "Pubblico" : "Privato"}
          </Badge>
          <Badge tone="primary">{menu.itemsCount} ricette</Badge>
          {menu.canEdit ? (
            <Button as="a" href={`/menus/${menu.id}/edit`} variant="secondary" size="sm">
              Modifica
            </Button>
          ) : null}
        </div>

        <Card variant="panel" padding="lg">
          <CardBody>
            <Stack gap="4">
              <Text as="h2" size="lg" weight="semibold">
                Preview menu digitale
              </Text>
              <div className="grid gap-(--spacing-3)">
                {menu.items.map((item) => (
                  <div
                    key={item.id}
                    className="grid gap-(--spacing-2) rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) p-(--spacing-3)"
                  >
                    <div className="flex items-center justify-between gap-(--spacing-3)">
                      <div>
                        {item.section ? (
                          <Text size="xs" tone="primary" weight="semibold">
                            {item.section}
                          </Text>
                        ) : null}
                        <Text size="sm" weight="medium">
                          {item.title}
                        </Text>
                      </div>
                      <Badge size="sm" tone="neutral">
                        #{item.position + 1}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-(--spacing-1)">
                      {item.allergens.length === 0 ? (
                        <Badge size="sm" tone="success">
                          nessun allergene
                        </Badge>
                      ) : (
                        item.allergens.map((allergen) => (
                          <Badge key={allergen} size="sm" tone="warning">
                            {allergen}
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Stack>
          </CardBody>
        </Card>
      </Stack>
    </PageSection>
  );
}

export async function EditMenuView({
  user,
  menuId,
}: {
  user: MenusViewUser;
  menuId: string;
}) {
  const [menu, recipes] = await Promise.all([
    getMenuDetail(user.id, menuId),
    getRecipeOptions(user.id),
  ]);
  if (!menu || !menu.canEdit) notFound();

  return (
    <PageSection
      title={`Modifica ${menu.title}`}
      description="Aggiorna struttura, sezioni e visibilita del menu."
    >
      <MenuBuilderForm mode="edit" recipes={recipes} initialMenu={menu} />
    </PageSection>
  );
}
