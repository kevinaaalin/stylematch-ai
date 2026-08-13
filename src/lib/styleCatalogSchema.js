import { z } from "zod";
import { STYLE_CATALOG, STYLE_CATALOG_VERSION } from "../data/styleCatalog.js";

export const StyleCatalogItemSchema = z.object({
  id: z.string().regex(/^[a-z][a-z0-9_]*$/),
  name: z.string().min(2),
  aliases: z.array(z.string().min(1)),
  summary: z.string().min(8),
  palette: z.array(z.string().min(1)).min(3),
  materials: z.array(z.string().min(1)).min(3),
  keywords: z.array(z.string().min(1)).min(3),
  prompt: z.string().min(20),
  negative_prompt: z.string().min(20),
});

export const StyleCatalogSchema = z.object({
  schema_version: z.literal(STYLE_CATALOG_VERSION),
  styles: z.array(StyleCatalogItemSchema).length(30).superRefine((styles, context) => {
    if (new Set(styles.map(({ id }) => id)).size !== styles.length) context.addIssue({ code: z.ZodIssueCode.custom, message: "風格 ID 不可重複" });
    if (new Set(styles.map(({ name }) => name)).size !== styles.length) context.addIssue({ code: z.ZodIssueCode.custom, message: "正式風格名稱不可重複" });
  }),
});

export const styleCatalogDocument = StyleCatalogSchema.parse({ schema_version: STYLE_CATALOG_VERSION, styles: STYLE_CATALOG });
