# Theme Migration Map: Shastik Fashions Visual Design System

This migration map documents the **absolute minimum set of files** required to reproduce the exact visual design system of `shastik_fashion` in a new repository **without** copying any business logic, API calls, state management, database schemas, authentication, or application pages.

---

## 1. Architectural Overview: The 5-Layer Minimal Footprint

To transplant the design system cleanly, you only need **15 files/assets** organized into 5 layers:

```
[Layer 1: Foundations]
 ├── src/index.css                  (CSS variables, fonts, gradients, shadows, animations)
 ├── tailwind.config.ts             (Tailwind palette extensions, font families, keyframes)
 └── postcss.config.js              (Tailwind & Autoprefixer build pipeline)

[Layer 2: Tooling & Aliases]
 ├── components.json                (Shadcn UI CLI configuration)
 ├── src/lib/utils.ts               (Class merge utility: clsx + tailwind-merge)
 └── tsconfig.app.json (or tsconfig) (Path alias resolution for `@/*`)

[Layer 3: Brand Color Mapping]
 └── src/lib/colors.ts              (Extracted pure hex-to-name swatch map)

[Layer 4: Atomic UI Primitives with Brand Variants]
 ├── src/components/ui/button.tsx   (11 brand variants: gold, maroon, hero, outline, etc.)
 ├── src/components/ui/badge.tsx    (Pills, tags, status variants)
 ├── src/components/ui/card.tsx     (Surface containers with shadow-elegant elevation)
 ├── src/components/ui/input.tsx    (Text fields with brand focus ring)
 ├── src/components/ui/skeleton.tsx (Pulsing loading placeholders)
 ├── src/components/ui/dialog.tsx   (Modal popups with backdrop blur and zoom transitions)
 ├── src/components/ui/accordion.tsx(Collapsible FAQ panels with animated chevron)
 └── src/components/ui/separator.tsx(Subtle border dividing lines)

[Layer 5: Brand Visual Assets]
 ├── src/assets/logo-new.png        (Brand header logo)
 ├── public/favicon.png             (Browser favicon)
 └── public/placeholder.svg         (Apparel ratio image fallback placeholder)
```

---

## 2. Detailed File-by-File Migration Audit

### File 1: `src/index.css`

- **File Path**: `src/index.css`
- **What Design Information It Contains**:
  - Google Fonts import (`Playfair Display` + `Inter`).
  - All HSL CSS variables for `:root` and `.dark` (`--primary`, `--secondary`, `--accent`, `--background`, `--card`, `--maroon`, `--royal-blue`, `--gold`, etc.).
  - Custom gradient definitions (`--gradient-gold`, `--gradient-maroon`, `--gradient-premium`, `--gradient-cream`).
  - Custom elevation shadows (`--shadow-soft`, `--shadow-elegant`, `--shadow-gold`).
  - Base typography rules applying `font-display` to all `h1`-`h6` tags and `font-body` to `body`.
  - Component utilities: `.text-gradient-gold`, `.bg-gradient-gold`, `.bg-gradient-maroon`, `.link-underline`, `.shimmer`.
- **Can Be Copied Directly?**: **YES (100% direct copy)**.
- **Needs Adaptation?**: No adaptation needed if using Tailwind CSS.
- **Dependencies**: Tailwind CSS directives (`@tailwind base`, `@tailwind components`, `@tailwind utilities`).

---

### File 2: `tailwind.config.ts`

- **File Path**: `tailwind.config.ts`
- **What Design Information It Contains**:
  - Font family aliases: `display: ['Playfair Display', 'serif']` and `body: ['Inter', 'sans-serif']`.
  - Responsive container config: centered, `1rem` padding, screens `sm: 640px` to `2xl: 1400px`.
  - Custom brand color mappings to HSL variables: `maroon`, `royal`, `gold`, `cream`, `silk`, `forest`, `sidebar`.
  - Border radius mappings (`lg: var(--radius)`, `md`, `sm`).
  - Keyframes & animations: `accordion-down`, `accordion-up`, `fade-in`, `fade-in-up`, `slide-in-right`, `scale-in`, `float`, `shimmer`, `pulse-gold`.
  - Indian geometric jali background pattern (`bg-pattern-indian`).
- **Can Be Copied Directly?**: **YES**.
- **Needs Adaptation?**: Only adjust `content: [...]` paths if your target repository stores source files in directories other than `./src` or `./pages`.
- **Dependencies**: `tailwindcss`, `tailwindcss-animate`, `typescript`.

---

### File 3: `postcss.config.js`

- **File Path**: `postcss.config.js`
- **What Design Information It Contains**:
  - Standard PostCSS pipeline registering `tailwindcss` and `autoprefixer`.
- **Can Be Copied Directly?**: **YES**.
- **Needs Adaptation?**: No.
- **Dependencies**: `tailwindcss`, `autoprefixer`, `postcss`.

---

### File 4: `components.json`

- **File Path**: `components.json`
- **What Design Information It Contains**:
  - Shadcn UI specification: `style: "default"`, `baseColor: "slate"`, `cssVariables: true`.
  - Directs CLI and tooling to use `tailwind.config.ts` and `src/index.css`.
  - Defines path aliases (`@/components`, `@/components/ui`, `@/lib/utils`).
- **Can Be Copied Directly?**: **YES**.
- **Needs Adaptation?**: Only if your project does not use `@/` alias for `./src`.
- **Dependencies**: Shadcn UI convention.

---

### File 5: `src/lib/utils.ts`

- **File Path**: `src/lib/utils.ts`
- **What Design Information It Contains**:
  - The universal `cn()` styling utility function. Merges Tailwind class strings safely and resolves conflicting utility classes.
- **Can Be Copied Directly?**: **YES**.
- **Needs Adaptation?**: No.
- **Dependencies**: `clsx`, `tailwind-merge`.

---

### File 6: `tsconfig.app.json` (or `tsconfig.json`)

- **File Path**: `tsconfig.app.json` / `tsconfig.json`
- **What Design Information It Contains**:
  - Path alias resolution:
    ```json
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
    ```
- **Can Be Copied Directly?**: **NO (Extract path mapping only)**.
- **Needs Adaptation?**: Do not overwrite compiler settings. Simply ensure your target `tsconfig.json` has `baseUrl: "."` and `"paths": { "@/*": ["./src/*"] }`.
- **Dependencies**: TypeScript compiler.

---

### File 7: `src/lib/colors.ts` _(Pure Extracted Utility)_

- **File Path**: `src/lib/colors.ts` (Clean extraction from `src/hooks/useProducts.tsx`)
- **What Design Information It Contains**:
  - Hex color map for swatches, filter pills, and product circles (`gold: '#D4AF37'`, `maroon: '#800000'`, `royal blue: '#4169E1'`, etc.).
  - Pure utility function `getColorHex(name: string): string`.
- **Can Be Copied Directly?**: **YES** (from snippet below; do NOT copy `useProducts.tsx` which contains React Query and API logic).
- **Needs Adaptation?**: No.
- **Dependencies**: None.

```typescript
// src/lib/colors.ts
export const COLOR_MAP: Record<string, string> = {
  gold: "#D4AF37",
  maroon: "#800000",
  "royal blue": "#4169E1",
  red: "#DC2626",
  blue: "#2563EB",
  green: "#16A34A",
  pink: "#EC4899",
  white: "#FFFFFF",
  black: "#000000",
  silver: "#C0C0C0",
  purple: "#9333EA",
  orange: "#EA580C",
  yellow: "#EAB308",
  cream: "#FFFDD0",
  beige: "#F5F5DC",
  navy: "#000080",
};

export const getColorHex = (colorName: string): string => {
  return COLOR_MAP[colorName.toLowerCase()] || colorName.toLowerCase();
};
```

---

### File 8: `src/components/ui/button.tsx`

- **File Path**: `src/components/ui/button.tsx`
- **What Design Information It Contains**:
  - The core button design variants: `default` (deep maroon), `gold` (gradient with shadow), `maroon` (gradient), `premium`, `hero`, `hero-outline`, `outline`, `secondary`, `ghost`, `link`, `destructive`.
  - Micro-animations: `hover:scale-[1.02] active:scale-[0.98]`.
  - Button sizes: `default`, `sm`, `lg`, `xl` (`h-14`), `icon`.
- **Can Be Copied Directly?**: **YES**.
- **Needs Adaptation?**: No.
- **Dependencies**: `@radix-ui/react-slot`, `class-variance-authority`, `@/lib/utils`.

---

### File 9: `src/components/ui/badge.tsx`

- **File Path**: `src/components/ui/badge.tsx`
- **What Design Information It Contains**:
  - Pill badge styling: `rounded-full`, `px-2.5 py-0.5`, `text-xs font-semibold`.
  - Color variants: `default` (maroon), `secondary` (cream), `destructive` (discount/sale), `outline`.
- **Can Be Copied Directly?**: **YES**.
- **Needs Adaptation?**: No.
- **Dependencies**: `class-variance-authority`, `@/lib/utils`.

---

### File 10: `src/components/ui/card.tsx`

- **File Path**: `src/components/ui/card.tsx`
- **What Design Information It Contains**:
  - Card primitives: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`.
  - Base styling: `rounded-lg border bg-card text-card-foreground shadow-sm`.
- **Can Be Copied Directly?**: **YES**.
- **Needs Adaptation?**: No.
- **Dependencies**: `@/lib/utils`.

---

### File 11: `src/components/ui/input.tsx`

- **File Path**: `src/components/ui/input.tsx`
- **What Design Information It Contains**:
  - Form input styling: `h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`.
- **Can Be Copied Directly?**: **YES**.
- **Needs Adaptation?**: No.
- **Dependencies**: `@/lib/utils`.

---

### File 12: `src/components/ui/skeleton.tsx`

- **File Path**: `src/components/ui/skeleton.tsx`
- **What Design Information It Contains**:
  - Skeleton loader styling: `animate-pulse rounded-md bg-muted`.
- **Can Be Copied Directly?**: **YES**.
- **Needs Adaptation?**: No.
- **Dependencies**: `@/lib/utils`.

---

### File 13: `src/components/ui/dialog.tsx`

- **File Path**: `src/components/ui/dialog.tsx`
- **What Design Information It Contains**:
  - Modal overlay (`bg-black/80`), animation keyframes (`zoom-in-95`, `fade-in-0`), card popup wrapper, close icon styling.
- **Can Be Copied Directly?**: **YES**.
- **Needs Adaptation?**: No.
- **Dependencies**: `@radix-ui/react-dialog`, `lucide-react`, `@/lib/utils`.

---

### File 14: `src/components/ui/accordion.tsx`

- **File Path**: `src/components/ui/accordion.tsx`
- **What Design Information It Contains**:
  - Accordion trigger and content layout, animated chevron rotation (`[&[data-state=open]>svg]:rotate-180`), slide transitions (`animate-accordion-down`, `animate-accordion-up`).
- **Can Be Copied Directly?**: **YES**.
- **Needs Adaptation?**: No.
- **Dependencies**: `@radix-ui/react-accordion`, `lucide-react`, `@/lib/utils`.

---

### File 15: `src/components/ui/separator.tsx`

- **File Path**: `src/components/ui/separator.tsx`
- **What Design Information It Contains**:
  - Subtle divider line styling (`bg-border`, `h-[1px]` or `w-[1px]`).
- **Can Be Copied Directly?**: **YES**.
- **Needs Adaptation?**: No.
- **Dependencies**: `@radix-ui/react-separator`, `@/lib/utils`.

---

### Assets: Logos & Brand Media

- **File Paths**:
  - `src/assets/logo-new.png` (Main brand logo)
  - `public/favicon.png` (Browser icon)
  - `public/placeholder.svg` (Generic apparel aspect placeholder)
- **What Design Information They Contain**:
  - High-resolution brand marks and visual fallback graphics.
- **Can Be Copied Directly?**: **YES**.
- **Needs Adaptation?**: Only swap if using a new company logo/name.
- **Dependencies**: None.

---

## 3. What NOT to Copy (Explicit Exclusions)

To ensure **zero business logic leak**, do **NOT** copy the following files:

| Category              | Excluded Files / Directories                                                                                              | Reason                                                                           |
| :-------------------- | :------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------- |
| **API & Services**    | `src/services/*` (`api.ts`, `productService.ts`, `orderService.ts`, `authService.ts`, `adminService.ts`)                  | Contains Axios client, backend API URLs, Razorpay verification, and server calls |
| **State Management**  | `src/store/*` (`store.ts`, `cartSlice.ts`, `productsSlice.ts`, `addressSlice.ts`, etc.)                                   | Redux store setup, async thunks, and domain state                                |
| **Context Providers** | `src/context/*` (`CartContext.tsx`, `WishlistContext.tsx`)                                                                | Cart, wishlist, and local storage state persistence                              |
| **Custom Hooks**      | `src/hooks/*` (`useBackendAuth.tsx`, `useAdmin.ts`, `useToast.ts`)                                                        | Firebase/backend authentication, permissions, and session logic                  |
| **All App Pages**     | `src/pages/*` (`Index.tsx`, `ShopPage.tsx`, `ProductDetailPage.tsx`, `CartPage.tsx`, `CheckoutPage.tsx`, `admin/*`, etc.) | Domain-specific pages and business logic                                         |
| **Data Mocks**        | `src/data/*` (`products.ts`)                                                                                              | Mock product database records                                                    |
| **Type Definitions**  | `src/types/*` (`index.ts`)                                                                                                | Order, User, Payment, Cart domain schemas                                        |

---

## 4. Step-by-Step Migration Guide for a New Repository

Follow this sequence to set up the design system in any React 18+ repository (Vite, Next.js, Remix, or Astro):

### Step 1: Install Core Dependencies

Run this in the new repository:

```bash
# Core styling and animation libraries
npm install tailwindcss-animate class-variance-authority clsx tailwind-merge lucide-react

# Radix UI primitives used by the base components
npm install @radix-ui/react-slot @radix-ui/react-dialog @radix-ui/react-accordion @radix-ui/react-separator

# PostCSS build tools (if not already installed)
npm install -D tailwindcss postcss autoprefixer
```

### Step 2: Configure TypeScript Path Aliases

Ensure your target `tsconfig.json` contains:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

_(If using Vite, verify that `vite.config.ts` has `resolve: { alias: { "@": path.resolve(__dirname, "./src") } }`)_.

### Step 3: Copy Core Foundations

1. Copy `postcss.config.js` to project root.
2. Copy `tailwind.config.ts` to project root.
3. Copy `components.json` to project root.
4. Replace `src/index.css` with the extracted version.

### Step 4: Copy Utilities & Swatch Mapping

1. Copy `src/lib/utils.ts`.
2. Create `src/lib/colors.ts` with the standalone swatch mapping.

### Step 5: Copy UI Primitives

Copy the 8 base components into `src/components/ui/`:

- `button.tsx`
- `badge.tsx`
- `card.tsx`
- `input.tsx`
- `skeleton.tsx`
- `dialog.tsx`
- `accordion.tsx`
- `separator.tsx`

### Step 6: Copy Brand Assets

- Copy `src/assets/logo-new.png` into `src/assets/`.
- Copy `public/favicon.png` into `public/`.

---

## 5. Verification Checklist

Test that the design system is functioning properly in the new repository by verifying:

- [ ] Font `'Playfair Display'` renders on `<h1>` tags with serif elegance.
- [ ] Font `'Inter'` renders on paragraphs, buttons, and inputs.
- [ ] Maroon button (`<Button variant="default">`) renders with `#7E1B34` background and `hover:bg-maroon-light`.
- [ ] Gold button (`<Button variant="gold">`) renders with the metallic gold gradient and golden glow shadow.
- [ ] Background displays warm cream linen tone (`hsl(30 25% 97%)`).
- [ ] Micro-interactions work: buttons scale slightly (`1.02`), links show the animated expanding gold underline (`.link-underline`).
- [ ] Dark mode toggle (via `.dark` on `<html>`) inverts colors correctly without breaking contrast.
