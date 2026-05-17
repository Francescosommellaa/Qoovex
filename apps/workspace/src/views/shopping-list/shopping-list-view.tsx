import { notFound } from "next/navigation";
import {
  Badge,
  Button,
  Card,
  CardBody,
  EmptyState,
  Stack,
  Text,
} from "@qoovex/ui";
import {
  CreateShoppingListForm,
  ShoppingListItemToggle,
  SourceShoppingListForm,
} from "@features/shopping-list";
import type { WorkspacePlan } from "@shared/lib/workspace-types";
import { WorkspacePage } from "@shared/ui";
import { getMenuOptionsForShoppingList } from "@shared/server/workspace-option-service";
import { getRecipeOptions } from "@shared/server/recipe-service";
import {
  getShoppingListDetail,
  getShoppingListsIndex,
} from "@shared/server/shopping-list-service";

interface ShoppingListViewUser {
  id: string;
  plan: WorkspacePlan;
}

export async function ShoppingListsIndexView({
  user,
}: {
  user: ShoppingListViewUser;
}) {
  const [lists, recipes, menus] = await Promise.all([
    getShoppingListsIndex(user.id),
    getRecipeOptions(user.id),
    getMenuOptionsForShoppingList(user.id),
  ]);

  return (
    <WorkspacePage
      title="Lista spesa"
      description="Liste operative da ricette, menu o inserimento manuale. Nessuna gestione prezzi nello scope corrente."
    >
      <Stack gap="6">
        <div className="grid gap-(--spacing-4) xl:grid-cols-[minmax(0,1fr)_24rem]">
          <Card variant="panel" padding="lg">
            <CardBody>
              <Stack gap="4">
                <Text as="h2" size="lg" weight="semibold">
                  Liste recenti
                </Text>
                {lists.length === 0 ? (
                  <EmptyState
                    title="Nessuna lista"
                    description="Crea una lista manuale o generala da una ricetta o un menu."
                  />
                ) : (
                  <div className="grid gap-(--spacing-3)">
                    {lists.map((list) => (
                      <div
                        key={list.id}
                        className="flex items-center justify-between gap-(--spacing-3) rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) p-(--spacing-3)"
                      >
                        <div className="min-w-0">
                          <Text size="sm" weight="medium" className="truncate">
                            {list.title}
                          </Text>
                          <Text size="xs" tone="muted">
                            {list.checkedCount}/{list.itemsCount} completate
                          </Text>
                        </div>
                        <Button
                          as="a"
                          href={`/shopping-list/${list.id}`}
                          variant="secondary"
                          size="sm"
                        >
                          Apri
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </Stack>
            </CardBody>
          </Card>

          <Stack gap="4">
            <Card variant="panel" padding="lg">
              <CardBody>
                <Stack gap="4">
                  <Text as="h2" size="lg" weight="semibold">
                    Genera da origine
                  </Text>
                  <SourceShoppingListForm recipes={recipes} menus={menus} />
                </Stack>
              </CardBody>
            </Card>
            <Card variant="panel" padding="lg">
              <CardBody>
                <Stack gap="4">
                  <Text as="h2" size="lg" weight="semibold">
                    Nuova lista manuale
                  </Text>
                  <CreateShoppingListForm />
                </Stack>
              </CardBody>
            </Card>
          </Stack>
        </div>
      </Stack>
    </WorkspacePage>
  );
}

export async function ShoppingListDetailView({
  user,
  listId,
}: {
  user: ShoppingListViewUser;
  listId: string;
}) {
  const list = await getShoppingListDetail(user.id, user.plan, listId);
  if (!list) notFound();

  return (
    <WorkspacePage title={list.title} description="Checklist operativa della spesa.">
      <Stack gap="5">
        <div className="flex flex-wrap items-center gap-(--spacing-2)">
          <Badge tone="primary">
            {list.checkedCount}/{list.itemsCount} completate
          </Badge>
          <Badge tone={list.canExport ? "success" : "neutral"}>
            {list.canExport ? "Export abilitato" : "Export Pro"}
          </Badge>
        </div>

        {list.items.length === 0 ? (
          <EmptyState title="Lista vuota" description="Aggiungi o rigenera le voci." />
        ) : (
          <div className="grid gap-(--spacing-3)">
            {list.items.map((item) => (
              <ShoppingListItemToggle key={item.id} item={item} />
            ))}
          </div>
        )}
      </Stack>
    </WorkspacePage>
  );
}
