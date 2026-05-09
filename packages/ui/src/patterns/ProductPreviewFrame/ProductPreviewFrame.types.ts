import type * as React from "react";

export type ProductPreviewScreen = "recipes" | "menus" | "workplan" | "explore";

export interface ProductPreviewFrameProps extends React.HTMLAttributes<HTMLDivElement> {
  activeScreen?: ProductPreviewScreen;
}

