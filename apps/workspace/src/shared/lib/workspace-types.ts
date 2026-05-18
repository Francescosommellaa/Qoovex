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

export type RecipeCategory =
  | "ANTIPASTO"
  | "PRIMO"
  | "SECONDO"
  | "CONTORNO"
  | "DOLCE"
  | "PANE_LIEVITATI"
  | "SALSA_BASE"
  | "BEVANDA"
  | "ALTRO";

export type RecipeStatus =
  | "DRAFT"
  | "READY"
  | "PENDING_REVIEW"
  | "PUBLISHED"
  | "ARCHIVED";

export type IngredientVerificationStatus =
  | "VERIFIED"
  | "SUGGESTED"
  | "PENDING_REVIEW"
  | "REJECTED";

export type IngredientSource =
  | "USER"
  | "QOOVEX"
  | "OPEN_FOOD_FACTS"
  | "USDA"
  | "OLLAMA";

export type RecipeSort = "updated-desc" | "updated-asc" | "kcal-desc" | "kcal-asc" | "title-asc";
export type RecipeViewMode = "cards" | "list";
export type RecipeVisibilityFilter = "all" | "public" | "private";
export type RecipeValidityFilter = "all" | "ready" | "pending" | "archived";

export interface RecipeFiltersDto {
  query?: string;
  category?: RecipeCategory | "all";
  sort?: RecipeSort;
  visibility?: RecipeVisibilityFilter;
  validity?: RecipeValidityFilter;
  allergen?: string;
  kcalMin?: number | null;
  kcalMax?: number | null;
  view?: RecipeViewMode;
}

export interface NutritionRangeDto {
  min: number | null;
  max: number | null;
  unit: "kcal" | "g";
}

export interface NutritionRangesDto {
  calories: NutritionRangeDto;
  proteins: NutritionRangeDto;
  carbs: NutritionRangeDto;
  sugars: NutritionRangeDto;
  fats: NutritionRangeDto;
  fiber: NutritionRangeDto;
  salt: NutritionRangeDto;
}

export interface IngredientInput {
  name: string;
  quantity: number;
  unit: string;
  slug?: string;
  sourceName?: string | null;
  allergens?: string;
  calories?: number | null;
  proteins?: number | null;
  carbs?: number | null;
  fats?: number | null;
  nutrition?: NutritionRangesDto;
  verificationStatus?: IngredientVerificationStatus;
  source?: IngredientSource;
  confidence?: number | null;
}

export interface RecipeEditorInput {
  title: string;
  description?: string;
  instructions?: string;
  category: RecipeCategory;
  servings: number;
  prepTime?: number | null;
  cookTime?: number | null;
  isPublic: boolean;
  imageUrl?: string | null;
  ingredients: IngredientInput[];
}

export interface RecipeIngredientDto {
  id: string;
  name: string;
  slug: string;
  quantity: number;
  unit: string;
  allergens: string[];
  calories: number | null;
  proteins: number | null;
  carbs: number | null;
  fats: number | null;
  nutrition: NutritionRangesDto;
  verificationStatus: IngredientVerificationStatus;
  source: IngredientSource;
  confidence: number | null;
}

export interface RecipeSummaryDto {
  id: string;
  title: string;
  description: string | null;
  category: RecipeCategory;
  status: RecipeStatus;
  servings: number;
  prepTime: number | null;
  cookTime: number | null;
  isPublic: boolean;
  imageUrl: string | null;
  totalCalories: number | null;
  totalProteins: number | null;
  totalCarbs: number | null;
  totalFats: number | null;
  nutrition: NutritionRangesDto;
  likesCount: number;
  ingredientsCount: number;
  allergens: string[];
  updatedAt: string;
  deletedAt?: string | null;
  authorName?: string;
  forkedFromId?: string | null;
}

export interface RecipeDetailDto extends RecipeSummaryDto {
  instructions: string | null;
  ingredients: RecipeIngredientDto[];
  canEdit: boolean;
  canPublish: boolean;
}

export interface IngredientSuggestionDto {
  id: string;
  name: string;
  slug: string;
  allergens: string[];
  calories: number | null;
  proteins: number | null;
  carbs: number | null;
  fats: number | null;
  nutrition: NutritionRangesDto;
  verificationStatus: IngredientVerificationStatus;
  source: IngredientSource;
  confidence: number | null;
}

export interface IngredientEnrichmentDto {
  ingredient: IngredientSuggestionDto;
  status: "matched" | "suggested" | "pending_review";
  message: string;
  reviewId?: string;
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

export type NotificationReadFilter = "all" | "read" | "unread";

export interface NotificationQueryFilters {
  read?: NotificationReadFilter;
  type?: string;
  from?: string;
  to?: string;
  cursor?: string;
  take?: number;
}

export interface NotificationInboxDto extends NotificationFeedDto {
  nextCursor: string | null;
  types: string[];
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
