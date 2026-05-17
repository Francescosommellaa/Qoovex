export type WorkspacePlan = "FREE" | "START" | "PRO" | "ENTERPRISE";

export interface LimitStatus {
  mode: "limited" | "unlimited";
  value: number | null;
  used: number;
  remaining: number | null;
  reached: boolean;
}

export interface ActionResult<T = undefined> {
  ok: boolean;
  message: string;
  data?: T;
}

export interface IngredientInput {
  name: string;
  quantity: number;
  unit: string;
  allergens?: string;
  calories?: number | null;
  proteins?: number | null;
  carbs?: number | null;
  fats?: number | null;
}

export interface RecipeEditorInput {
  title: string;
  description?: string;
  instructions?: string;
  servings: number;
  prepTime?: number | null;
  cookTime?: number | null;
  isPublic: boolean;
  ingredients: IngredientInput[];
}

export interface RecipeIngredientDto {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  allergens: string[];
  calories: number | null;
  proteins: number | null;
  carbs: number | null;
  fats: number | null;
}

export interface RecipeSummaryDto {
  id: string;
  title: string;
  description: string | null;
  servings: number;
  prepTime: number | null;
  cookTime: number | null;
  isPublic: boolean;
  likesCount: number;
  ingredientsCount: number;
  allergens: string[];
  updatedAt: string;
  authorName?: string;
  forkedFromId?: string | null;
}

export interface RecipeDetailDto extends RecipeSummaryDto {
  instructions: string | null;
  ingredients: RecipeIngredientDto[];
  canEdit: boolean;
}

export interface MenuBuilderItemInput {
  recipeId: string;
  section?: string;
}

export interface MenuBuilderInput {
  title: string;
  description?: string;
  isPublic: boolean;
  items: MenuBuilderItemInput[];
}

export interface MenuSummaryDto {
  id: string;
  title: string;
  description: string | null;
  isPublic: boolean;
  qrCodeUrl: string | null;
  itemsCount: number;
  updatedAt: string;
  authorName?: string;
}

export interface MenuRecipeItemDto {
  id: string;
  recipeId: string;
  title: string;
  section: string | null;
  position: number;
  allergens: string[];
}

export interface MenuDetailDto extends MenuSummaryDto {
  items: MenuRecipeItemDto[];
  canEdit: boolean;
}

export interface ShoppingListItemInput {
  name: string;
  quantity: number;
  unit: string;
}

export interface ShoppingListInput {
  title: string;
  items: ShoppingListItemInput[];
}

export interface ShoppingListItemDto {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  checked: boolean;
}

export interface ShoppingListSummaryDto {
  id: string;
  title: string;
  itemsCount: number;
  checkedCount: number;
  updatedAt: string;
}

export interface ShoppingListDetailDto extends ShoppingListSummaryDto {
  items: ShoppingListItemDto[];
  canExport: boolean;
}

export type ShoppingListSourceKind = "recipe" | "menu";

export interface WorkPlanInput {
  title: string;
  description?: string;
}

export interface WorkTaskInput {
  title: string;
  description?: string;
  recipeId?: string | null;
}

export interface WorkPlanSummaryDto {
  id: string;
  title: string;
  description: string | null;
  creatorId: string;
  creatorName: string;
  taskCount: number;
  completedTaskCount: number;
  memberCount: number;
  createdAt: string;
  role: "creator" | "member";
}

export interface WorkTaskDto {
  id: string;
  title: string;
  description: string | null;
  recipeId: string | null;
  recipeSnapshot: unknown;
  completedAt: string | null;
  completedBy: string | null;
  position: number;
}

export interface WorkPlanMemberDto {
  id: string;
  userId: string;
  name: string;
  username: string;
}

export interface WorkPlanDetailDto extends WorkPlanSummaryDto {
  tasks: WorkTaskDto[];
  members: WorkPlanMemberDto[];
  canCreateTask: boolean;
  canAddMember: boolean;
  membersLimit: LimitStatus;
}

export interface NotificationDto {
  id: string;
  type: string;
  title: string;
  body: string | null;
  read: boolean;
  data: unknown;
  createdAt: string;
}

export interface NotificationFeedDto {
  unreadCount: number;
  notifications: NotificationDto[];
}

export interface DashboardSummaryDto {
  stats: {
    recipes: number;
    menus: number;
    shoppingLists: number;
    createdWorkPlans: number;
    joinedWorkPlans: number;
    unreadNotifications: number;
  };
  limits: {
    recipes: LimitStatus;
    menus: LimitStatus;
    workPlans: LimitStatus;
  };
  recentRecipes: RecipeSummaryDto[];
  recentMenus: MenuSummaryDto[];
  recentShoppingLists: ShoppingListSummaryDto[];
  recentWorkPlans: WorkPlanSummaryDto[];
}
