# Complete Visual Design System Extraction: Shastik Fashions

This document provides an exhaustive analysis and extraction of the complete visual design system of the `shastik_fashion` repository. It is structured to enable 1:1 replication of all themes, typography, tokens, components, and styling configurations in a new repository.

---

## 1. Theme & Color Palette

The visual identity is anchored in luxury Indian ethnic couture (traditional Kanchipuram silk, bridal lehengas, gold zari craftsmanship), built on an HSL CSS variable architecture defined in `src/index.css` and exposed through Tailwind in `tailwind.config.ts`.

### 1.1 Core Semantic Colors (Light & Dark Mode)

| Role                       | CSS Variable               | Light Mode (HSL) | Light Hex Approx | Dark Mode (HSL) | Dark Hex Approx | Defined In         |
| :------------------------- | :------------------------- | :--------------- | :--------------- | :-------------- | :-------------- | :----------------- |
| **Primary (Brand Maroon)** | `--primary`                | `345 65% 30%`    | `#7E1B34`        | `345 55% 55%`   | `#CA4D6E`       | `src/index.css:19` |
| **Primary Foreground**     | `--primary-foreground`     | `30 30% 98%`     | `#FAF7F5`        | `0 20% 8%`      | `#191010`       | `src/index.css:20` |
| **Secondary (Cream/Sand)** | `--secondary`              | `35 40% 92%`     | `#F4EFE6`        | `0 15% 18%`     | `#352727`       | `src/index.css:23` |
| **Secondary Foreground**   | `--secondary-foreground`   | `0 20% 15%`      | `#2E1F1F`        | `30 25% 95%`    | `#F6F3F0`       | `src/index.css:24` |
| **Accent (Zari Gold)**     | `--accent`                 | `38 70% 50%`     | `#D99B26`        | `38 65% 55%`    | `#DE9F3A`       | `src/index.css:27` |
| **Accent Foreground**      | `--accent-foreground`      | `0 20% 10%`      | `#1F1414`        | `0 20% 8%`      | `#191010`       | `src/index.css:28` |
| **Background**             | `--background`             | `30 25% 97%`     | `#FBF9F7`        | `0 20% 8%`      | `#191010`       | `src/index.css:9`  |
| **Foreground (Text)**      | `--foreground`             | `0 20% 15%`      | `#2E1F1F`        | `30 25% 95%`    | `#F6F3F0`       | `src/index.css:10` |
| **Card / Surface**         | `--card`                   | `30 30% 99%`     | `#FEFCFA`        | `0 18% 12%`     | `#241A1A`       | `src/index.css:12` |
| **Card Foreground**        | `--card-foreground`        | `0 20% 15%`      | `#2E1F1F`        | `30 25% 95%`    | `#F6F3F0`       | `src/index.css:13` |
| **Popover / Dropdown**     | `--popover`                | `30 30% 99%`     | `#FEFCFA`        | `0 18% 12%`     | `#241A1A`       | `src/index.css:15` |
| **Popover Foreground**     | `--popover-foreground`     | `0 20% 15%`      | `#2E1F1F`        | `30 25% 95%`    | `#F6F3F0`       | `src/index.css:16` |
| **Muted Background**       | `--muted`                  | `30 20% 90%`     | `#EAE6E1`        | `0 15% 20%`     | `#3B2E2E`       | `src/index.css:30` |
| **Muted Text**             | `--muted-foreground`       | `0 10% 45%`      | `#7E6B6B`        | `30 15% 65%`    | `#B1A8A2`       | `src/index.css:31` |
| **Border**                 | `--border`                 | `30 25% 85%`     | `#DFD7CF`        | `0 15% 22%`     | `#403434`       | `src/index.css:36` |
| **Input**                  | `--input`                  | `30 25% 85%`     | `#DFD7CF`        | `0 15% 22%`     | `#403434`       | `src/index.css:37` |
| **Ring (Focus)**           | `--ring`                   | `345 65% 30%`    | `#7E1B34`        | `345 55% 55%`   | `#CA4D6E`       | `src/index.css:38` |
| **Destructive / Error**    | `--destructive`            | `0 84% 60%`      | `#EF4444`        | `0 62% 30%`     | `#7C1D1D`       | `src/index.css:33` |
| **Destructive Text**       | `--destructive-foreground` | `0 0% 98%`       | `#FAFAFA`        | `0 0% 98%`      | `#FAFAFA`       | `src/index.css:34` |

### 1.2 Custom Brand Color Palette

| Color Family         | CSS Variable         | HSL Light     | HSL Dark      | Purpose & Location                                              |
| :------------------- | :------------------- | :------------ | :------------ | :-------------------------------------------------------------- |
| **Maroon (Default)** | `--maroon`           | `345 65% 30%` | `345 55% 55%` | Primary heritage color for buttons, headings, announcements     |
| **Maroon Light**     | `--maroon-light`     | `345 55% 45%` | `345 50% 65%` | Hover state for primary buttons (`hover:bg-maroon-light`)       |
| **Maroon Dark**      | `--maroon-dark`      | `345 70% 20%` | `345 60% 40%` | End gradient for `--gradient-maroon`                            |
| **Royal Blue**       | `--royal-blue`       | `220 70% 35%` | `220 60% 55%` | Featured product badges (`bg-royal`), gradient accents          |
| **Royal Blue Light** | `--royal-blue-light` | `220 60% 50%` | `220 55% 65%` | Subtle blue highlights                                          |
| **Gold**             | `--gold`             | `38 70% 50%`  | `38 65% 55%`  | Accent icons, star ratings, primary CTA borders (`#D99B26`)     |
| **Gold Light**       | `--gold-light`       | `42 80% 65%`  | `42 70% 65%`  | Shimmer gradient, text highlights (`text-gold-light`)           |
| **Gold Dark**        | `--gold-dark`        | `35 65% 40%`  | `35 60% 45%`  | High-contrast gold text on light backgrounds (`text-gold-dark`) |
| **Cream**            | `--cream`            | `35 40% 95%`  | `30 15% 18%`  | Hero backdrop gradient start (`from-cream`)                     |
| **Cream Dark**       | `--cream-dark`       | `30 30% 88%`  | `30 12% 15%`  | Hero backdrop gradient end (`to-cream-dark`)                    |
| **Silk Pink**        | `--silk-pink`        | `350 50% 85%` | `350 50% 85%` | Soft pastel accent (`hsl(var(--silk-pink))`)                    |
| **Forest Green**     | `--forest-green`     | `150 40% 30%` | `150 40% 30%` | Deep emerald green contrast (`hsl(var(--forest-green))`)        |

### 1.3 Sidebar Specific Tokens

| Variable                       | Light Mode HSL      | Dark Mode HSL       |
| :----------------------------- | :------------------ | :------------------ |
| `--sidebar-background`         | `0 0% 98%`          | `240 5.9% 10%`      |
| `--sidebar-foreground`         | `240 5.3% 26.1%`    | `240 4.8% 95.9%`    |
| `--sidebar-primary`            | `240 5.9% 10%`      | `224.3 76.3% 48%`   |
| `--sidebar-primary-foreground` | `0 0% 98%`          | `0 0% 100%`         |
| `--sidebar-accent`             | `240 4.8% 95.9%`    | `240 3.7% 15.9%`    |
| `--sidebar-accent-foreground`  | `240 5.9% 10%`      | `240 4.8% 95.9%`    |
| `--sidebar-border`             | `220 13% 91%`       | `240 3.7% 15.9%`    |
| `--sidebar-ring`               | `217.2 91.2% 59.8%` | `217.2 91.2% 59.8%` |

### 1.4 Status & Operational Colors

- **Pending Status**: `bg-yellow-100 text-yellow-800` / `bg-gold`
- **Processing Status**: `bg-blue-100 text-blue-800` / `bg-primary`
- **Shipped Status**: `bg-purple-100 text-purple-800` / `bg-blue-500`
- **Delivered Status**: `bg-green-100 text-green-800` / `bg-green-500`
- **Cancelled / Error**: `bg-red-100 text-red-800` / `border-destructive text-destructive`
- **Free Shipping Tag**: `text-green-600 font-bold uppercase tracking-wider text-[10px]`

### 1.5 Color Swatch Hex Mapping (`getColorHex`)

Located in `src/hooks/useProducts.tsx:45-66`:

```typescript
{
  gold: '#D4AF37',
  maroon: '#800000',
  'royal blue': '#4169E1',
  red: '#DC2626',
  blue: '#2563EB',
  green: '#16A34A',
  pink: '#EC4899',
  white: '#FFFFFF',
  black: '#000000',
  silver: '#C0C0C0',
  purple: '#9333EA',
  orange: '#EA580C',
  yellow: '#EAB308',
  cream: '#FFFDD0',
  beige: '#F5F5DC',
  navy: '#000080',
}
```

---

## 2. Typography System

### 2.1 Font Families & Source

Defined in `src/index.css:1` and `tailwind.config.ts:20-23`:

```css
@import url("https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@300;400;500;600;700&display=swap");
```

- **Display / Headings**: `'Playfair Display', serif`
- **Body / Interface**: `'Inter', sans-serif`

### 2.2 Global Typography Rules

Defined in `src/index.css:144-151`:

- `body`: `@apply bg-background text-foreground font-body antialiased;`
- `h1, h2, h3, h4, h5, h6`: `@apply font-display;`

### 2.3 Typographic Scale & Hierarchy

| Typographic Level          | Font Family      | Size Classes                       | Line Height       | Weight                | Letter Spacing & Transform | Usage Examples                       |
| :------------------------- | :--------------- | :--------------------------------- | :---------------- | :-------------------- | :------------------------- | :----------------------------------- |
| **Hero Display (H1)**      | Playfair Display | `text-4xl md:text-6xl lg:text-7xl` | `leading-[1.1]`   | `font-bold` (700)     | Normal                     | Main hero banner title               |
| **Page Header (H1)**       | Playfair Display | `text-2xl lg:text-3xl`             | `leading-tight`   | `font-bold` (700)     | Normal                     | Cart, Account, Track Order titles    |
| **Section Title (H2)**     | Playfair Display | `text-3xl lg:text-4xl`             | `leading-tight`   | `font-bold` (700)     | Normal                     | "Shop by Category", "Testimonials"   |
| **Card / Item Title (H3)** | Playfair Display | `text-lg lg:text-xl`               | `leading-snug`    | `font-semibold` (600) | `line-clamp-2`             | Product titles, category cards       |
| **Eyebrow / Pill Badge**   | Inter            | `text-xs md:text-sm`               | `leading-normal`  | `font-semibold` (600) | `uppercase tracking-wider` | "Browse by", "Exclusive Collection"  |
| **Lead / Body Large**      | Inter            | `text-lg md:text-xl`               | `leading-relaxed` | `font-normal` (400)   | Normal                     | Hero subtitle paragraphs             |
| **Body Standard**          | Inter            | `text-sm md:text-base`             | `leading-relaxed` | `font-normal` (400)   | Normal                     | Product descriptions, FAQ answers    |
| **Hero Price**             | Inter            | `text-2xl sm:text-3xl`             | `leading-none`    | `font-bold` (700)     | Tabular figures            | Product Detail price display         |
| **Card Price**             | Inter            | `text-lg`                          | `leading-none`    | `font-semibold` (600) | Tabular figures            | Product card price                   |
| **Form Labels & Inputs**   | Inter            | `text-sm`                          | `leading-none`    | `font-medium` (500)   | Normal                     | Inputs, Select triggers, Form labels |
| **Microcopy & Counters**   | Inter            | `text-[10px]` to `text-xs`         | `leading-tight`   | `font-bold`           | `uppercase tracking-wider` | Cart badge count, tax notice         |

---

## 3. Design Tokens

### 3.1 Gradients

Configured in `src/index.css:61-64, 154-175`:

- `--gradient-gold`: `linear-gradient(135deg, hsl(38, 70%, 50%) 0%, hsl(42, 80%, 65%) 50%, hsl(35, 65%, 40%) 100%)`
- `--gradient-maroon`: `linear-gradient(135deg, hsl(345, 65%, 35%) 0%, hsl(345, 70%, 25%) 100%)`
- `--gradient-premium`: `linear-gradient(135deg, hsl(345, 65%, 30%) 0%, hsl(220, 70%, 35%) 100%)`
- `--gradient-cream`: `linear-gradient(180deg, hsl(35, 40%, 95%) 0%, hsl(30, 30%, 88%) 100%)`

**Utility Classes**:

- `.text-gradient-gold`: Metallic gold text with `-webkit-background-clip: text;`
- `.bg-gradient-gold`: Metallic gold background (Gold CTA buttons)
- `.bg-gradient-maroon`: Deep maroon background (Announcement bar, Newsletter)
- `.bg-gradient-premium`: Maroon to Royal Blue gradient
- `.border-gradient-gold`: `border-image: linear-gradient(135deg, hsl(var(--gold)) 0%, hsl(var(--gold-light)) 100%) 1;`

### 3.2 Shadows

Configured in `src/index.css:67-69`:

- `--shadow-soft`: `0 4px 20px -4px hsl(0 0% 0% / 0.1)`
- `--shadow-elegant`: `0 10px 40px -10px hsl(345 65% 30% / 0.2)` (Maroon tint for high luxury)
- `--shadow-gold`: `0 8px 30px -8px hsl(38 70% 50% / 0.3)` (Warm luminous gold elevation)

### 3.3 Border Radius Scale

Base defined in `src/index.css:40` and `tailwind.config.ts:90-94`:

- `--radius`: `0.75rem` (`12px`)
- `rounded-sm`: `calc(var(--radius) - 4px)` (`8px`) - Checkboxes, menu items
- `rounded-md`: `calc(var(--radius) - 2px)` (`10px`) - Inputs, selects, tabs
- `rounded-lg`: `var(--radius)` (`12px`) - Standard buttons, dialogs
- `rounded-xl`: `16px` - Product cards, cart cards, order summary
- `rounded-2xl`: `24px` - Category cards, banners, testimonials
- `rounded-full`: `9999px` - Pills, badges, swatch circles, carousel dots

### 3.4 Keyframe Animations & Transitions

Configured in `tailwind.config.ts:95-143`:

- `accordion-down`: `accordion-down 0.2s ease-out`
- `accordion-up`: `accordion-up 0.2s ease-out`
- `fade-in`: `fade-in 0.5s ease-out`
- `fade-in-up`: `fade-in-up 0.6s ease-out`
- `slide-in-right`: `slide-in-right 0.5s ease-out`
- `scale-in`: `scale-in 0.3s ease-out`
- `float`: `float 3s ease-in-out infinite` (`translateY: 0 -> -10px -> 0`)
- `shimmer`: `shimmer 2s infinite`
- `pulse-gold`: `pulse-gold 2s infinite` (expanding gold ring boxShadow)
- `.link-underline`: Right-to-left scale micro-interaction (`duration-300`)

### 3.5 Indian Pattern Motif

Configured in `tailwind.config.ts:146`:

- Class: `bg-pattern-indian`
- Vector SVG: 60x60 repeat tile in `#b8860b` (opacity 0.05) representing traditional Indian jali/kolam.

### 3.6 Container & Breakpoints

Configured in `tailwind.config.ts:8-17`:

- `sm`: `640px`
- `md`: `768px`
- `lg`: `1024px`
- `xl`: `1280px`
- `2xl`: `1400px`
- Center: `true`, Padding: `1rem` (16px)

### 3.7 Z-Index Layering Scheme

- `z-0` to `z-10`: Hero background media and blur spheres
- `z-20`: Carousel indicators and navigation overlays
- `z-40`: Mobile navigation slide-out drawer
- `z-50`: Sticky header (`h-16 lg:h-20`), Mobile bottom nav, modal dialogs, drawers
- `z-[100]`: Toast notification viewport

---

## 4. Styling Architecture

The styling setup is modular, typed, and follows the modern Tailwind v3 + Radix UI + shadcn convention:

1. **`src/index.css`**: Defines `@tailwind base`, `@tailwind components`, `@tailwind utilities`. Encapsulates `:root` and `.dark` variables, custom layer components (`.text-gradient-gold`, `.shadow-elegant`, `.link-underline`, `.shimmer`), and global typography rules.
2. **`tailwind.config.ts`**: Imports `Config` type. Binds HSL variables with `hsl(var(--token))`. Defines custom brand keys (`maroon`, `royal`, `gold`, `cream`, `silk`, `forest`). Registers `tailwindcss-animate`.
3. **`components.json`**:
   - `style`: `"default"`
   - `baseColor`: `"slate"`
   - `cssVariables`: `true`
   - Aliases: `@/components`, `@/lib/utils`, `@/components/ui`, `@/lib`, `@/hooks`
4. **`src/lib/utils.ts`**:
   - Standard `cn()` utility combining `clsx` and `tailwind-merge`.

---

## 5. UI Component Specifications

### 5.1 Buttons (`src/components/ui/button.tsx`)

- **Base Style**: `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0`
- **Variants**:
  - `default`: `"bg-primary text-primary-foreground hover:bg-maroon-light shadow-md hover:shadow-lg"`
  - `gold`: `"bg-gradient-gold text-foreground font-semibold shadow-gold hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"`
  - `maroon`: `"bg-gradient-maroon text-primary-foreground font-semibold shadow-elegant hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"`
  - `premium`: `"bg-gradient-premium text-primary-foreground font-semibold shadow-elegant hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"`
  - `outline`: `"border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground"`
  - `hero`: `"bg-primary text-primary-foreground font-semibold text-base px-8 py-6 shadow-elegant hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] border border-gold/30"`
  - `hero-outline`: `"bg-transparent border-2 border-primary-foreground/80 text-primary-foreground font-semibold text-base px-8 py-6 hover:bg-primary-foreground/10 hover:border-primary-foreground"`
  - `ghost`: `"hover:bg-accent/20 hover:text-accent-foreground"`
  - `link`: `"text-primary underline-offset-4 hover:underline"`
  - `destructive`: `"bg-destructive text-destructive-foreground hover:bg-destructive/90"`
- **Sizes**:
  - `default`: `h-10 px-4 py-2`
  - `sm`: `h-9 rounded-md px-3`
  - `lg`: `h-11 rounded-lg px-8`
  - `xl`: `h-14 rounded-lg px-10 text-base`
  - `icon`: `h-10 w-10`

### 5.2 Product Card (`src/components/ProductCard.tsx`)

- **Shell**: `group relative bg-card rounded-xl overflow-hidden shadow-md hover:shadow-elegant transition-all duration-500`
- **Image Frame**: `relative aspect-[3/4] overflow-hidden`
- **Image Zoom**: `w-full h-full object-cover transition-transform duration-700 group-hover:scale-110`
- **Gradient Overlay**: `absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`
- **Badge Positions**: Top-left vertical flex (`absolute top-3 left-3 flex flex-col gap-2`)
  - Featured: `px-3 py-1 bg-royal text-primary-foreground text-xs font-semibold rounded-full`
  - Discount: `px-3 py-1 bg-destructive text-destructive-foreground text-xs font-semibold rounded-full`
- **Floating Actions**: Top-right (`absolute top-3 right-3 flex flex-col gap-2 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300`)
- **Product Details**:
  - Category: `text-xs text-muted-foreground uppercase tracking-wide mb-1`
  - Title: `font-display font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors`
  - Price: `font-semibold text-primary text-lg`
  - Original Price: `text-muted-foreground text-sm line-through`
  - Swatches: `flex items-center gap-1.5 mt-3` with `w-4 h-4 rounded-full border border-border`

### 5.3 Header / Navbar (`src/components/layout/Header.tsx`)

- **Top Announcement Bar**: `bg-gradient-maroon text-primary-foreground py-2 text-center text-sm`
- **Header Bar**: `sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border`
- **Desktop Navigation**: `hidden lg:flex items-center gap-8`
- **Links**: `link-underline text-sm font-medium transition-colors hover:text-primary` with active state `text-primary` vs inactive `text-muted-foreground`
- **Search Bar**: Dropdown input `w-full pl-12 pr-4 py-3 bg-muted rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary`
- **Mobile Menu Drawer**: Slide-in from left `fixed inset-0 top-[104px] bg-background z-40 lg:hidden` with staggered motion links

### 5.4 Mobile Bottom Nav (`src/components/layout/MobileBottomNav.tsx`)

- **Container**: `fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border md:hidden h-16`
- **Active Tab Pill**: `absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full`
- **Badge Counter**: `absolute -top-2 -right-2 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center`

### 5.5 Footer (`src/components/layout/Footer.tsx`)

- **Newsletter Card**: `bg-gradient-maroon py-12 text-primary-foreground text-center`
- **Newsletter Input**: `px-4 py-3 rounded-lg bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60 focus:outline-none focus:border-gold`
- **Newsletter Button**: `px-6 py-3 bg-gradient-gold text-foreground font-semibold rounded-lg hover:shadow-gold transition-shadow`
- **Main Section**: `bg-primary text-primary-foreground pb-20 lg:pb-0`, 4-column responsive grid
- **Sub-footer**: `border-t border-primary-foreground/10 py-4 text-primary-foreground/60`

### 5.6 Inputs, Selects & Labels

- **Input** (`src/components/ui/input.tsx`):
  `flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm`
- **Select Trigger** (`src/components/ui/select.tsx`):
  `flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`
- **Label** (`src/components/ui/label.tsx`):
  `text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70`

### 5.7 Cards & Content Containers (`src/components/ui/card.tsx`)

- **Card**: `rounded-lg border bg-card text-card-foreground shadow-sm`
- **CardHeader**: `flex flex-col space-y-1.5 p-6`
- **CardTitle**: `text-2xl font-semibold leading-none tracking-tight`
- **CardDescription**: `text-sm text-muted-foreground`
- **CardContent**: `p-6 pt-0`

### 5.8 Modals & Dialogs (`src/components/ui/dialog.tsx`)

- **Backdrop**: `fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0`
- **Content Box**: `fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg`

### 5.9 Tables (`src/components/ui/table.tsx`)

- **Wrapper**: `relative w-full overflow-auto`
- **Header**: `[&_tr]:border-b`
- **Head Cell**: `h-12 px-4 text-left align-middle font-medium text-muted-foreground`
- **Row**: `border-b transition-colors data-[state=selected]:bg-muted hover:bg-muted/50`
- **Cell**: `p-4 align-middle`

### 5.10 Badges (`src/components/ui/badge.tsx`)

- **Base**: `inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors`
- **Variants**:
  - `default`: `border-transparent bg-primary text-primary-foreground hover:bg-primary/80`
  - `secondary`: `border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80`
  - `destructive`: `border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80`
  - `outline`: `text-foreground`

### 5.11 Skeletons & Empty States

- **Skeleton** (`src/components/ui/skeleton.tsx`): `animate-pulse rounded-md bg-muted`
- **Empty State Container**:
  - Icon wrapper: `w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center`
  - Icon: `w-12 h-12 text-muted-foreground`
  - Title: `font-display text-2xl font-bold text-foreground mb-3`
  - Action Button: `variant="gold"` or `variant="outline"`

---

## 6. Responsive Design Specs

1. **Breakpoints**:
   - `sm`: `640px`
   - `md`: `768px`
   - `lg`: `1024px`
   - `xl`: `1280px`
   - `2xl`: `1400px`

2. **Grid Layouts**:
   - Product catalogs: `grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6`
   - Categories showcase: `grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6`
   - USP badges: `grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8`
   - Testimonials: `grid md:grid-cols-3 gap-6 lg:gap-8`
   - Product detail page: `grid lg:grid-cols-2 gap-6 lg:gap-12`

3. **Navigation Switch**:
   - Mobile (`< 1024px`): Top centered logo, hamburger icon, full-screen slide drawer, fixed bottom navigation bar (`MobileBottomNav`).
   - Desktop (`>= 1024px`): Left aligned logo, inline horizontal links with hover underline animation, right action icons with badge counters, bottom nav hidden (`md:hidden`).

---

## 7. Visual Signatures & Patterns

1. **Editorial Serif + Crisp Sans Pairing**: `Playfair Display` provides high-end bridal couture elegance, while `Inter` ensures high legibility on shopping grids, filters, and checkout tables.
2. **Gold & Maroon Accent Duo**: The deep maroon (`#7E1B34`) acts as the anchor of trust and tradition, while radiant gold (`#D99B26`) highlights CTAs, star reviews, and offers.
3. **Card Micro-interactions**:
   - Soft scale on hover: `hover:scale-[1.02] active:scale-[0.98]`
   - Image expansion: `group-hover:scale-110 duration-700`
   - Subtle vertical rise: `hover:shadow-elegant`
4. **Apparel Aspect Ratios**: Strict `aspect-[3/4]` for saree drape photos ensures uniform grid rhythm.
5. **Traditional Heritage Motif**: Background SVG pattern `pattern-indian` adds cultural depth without cluttering modern typography.

---

## 8. Assets & Media Manifest

- **Brand Logos**:
  - Primary Logo: `src/assets/logo-new.png`
  - Secondary/Favicon: `public/favicon.png`
  - Inverted Logo (for dark footers): `<img src={logo} className="h-20 lg:h-32 w-auto brightness-0 invert" />`
- **Hero Banners**:
  - Bridal Banner: `src/assets/banners/bridal_saree_banner.png`
  - Festive Banner: `src/assets/banners/festive_collection_banner.png`
  - Casual / Linen: `src/assets/banners/casual_chic_banner.png`
  - Static Banner: `src/assets/banner.jpeg`
- **Icons**: `lucide-react` (v0.462.0)
- **SVGs**: Fallback vector `public/placeholder.svg`

---

## 9. Design System Summary (Transfer Manifest)

Transfer these exact configuration blocks to your new project:

### 1. Font Import (`index.css`)

```css
@import url("https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@300;400;500;600;700&display=swap");
```

### 2. CSS Variables (`src/index.css`)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 30 25% 97%;
    --foreground: 0 20% 15%;

    --card: 30 30% 99%;
    --card-foreground: 0 20% 15%;

    --popover: 30 30% 99%;
    --popover-foreground: 0 20% 15%;

    --primary: 345 65% 30%;
    --primary-foreground: 30 30% 98%;

    --secondary: 35 40% 92%;
    --secondary-foreground: 0 20% 15%;

    --accent: 38 70% 50%;
    --accent-foreground: 0 20% 10%;

    --muted: 30 20% 90%;
    --muted-foreground: 0 10% 45%;

    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 98%;

    --border: 30 25% 85%;
    --input: 30 25% 85%;
    --ring: 345 65% 30%;

    --radius: 0.75rem;

    --maroon: 345 65% 30%;
    --maroon-light: 345 55% 45%;
    --maroon-dark: 345 70% 20%;

    --royal-blue: 220 70% 35%;
    --royal-blue-light: 220 60% 50%;

    --gold: 38 70% 50%;
    --gold-light: 42 80% 65%;
    --gold-dark: 35 65% 40%;

    --cream: 35 40% 95%;
    --cream-dark: 30 30% 88%;

    --silk-pink: 350 50% 85%;
    --forest-green: 150 40% 30%;

    --gradient-gold: linear-gradient(
      135deg,
      hsl(38, 70%, 50%) 0%,
      hsl(42, 80%, 65%) 50%,
      hsl(35, 65%, 40%) 100%
    );
    --gradient-maroon: linear-gradient(135deg, hsl(345, 65%, 35%) 0%, hsl(345, 70%, 25%) 100%);
    --gradient-premium: linear-gradient(135deg, hsl(345, 65%, 30%) 0%, hsl(220, 70%, 35%) 100%);
    --gradient-cream: linear-gradient(180deg, hsl(35, 40%, 95%) 0%, hsl(30, 30%, 88%) 100%);

    --shadow-soft: 0 4px 20px -4px hsl(0 0% 0% / 0.1);
    --shadow-elegant: 0 10px 40px -10px hsl(345 65% 30% / 0.2);
    --shadow-gold: 0 8px 30px -8px hsl(38 70% 50% / 0.3);

    --font-display: "Playfair Display", serif;
    --font-body: "Inter", sans-serif;

    --sidebar-background: 0 0% 98%;
    --sidebar-foreground: 240 5.3% 26.1%;
    --sidebar-primary: 240 5.9% 10%;
    --sidebar-primary-foreground: 0 0% 98%;
    --sidebar-accent: 240 4.8% 95.9%;
    --sidebar-accent-foreground: 240 5.9% 10%;
    --sidebar-border: 220 13% 91%;
    --sidebar-ring: 217.2 91.2% 59.8%;
  }

  .dark {
    --background: 0 20% 8%;
    --foreground: 30 25% 95%;

    --card: 0 18% 12%;
    --card-foreground: 30 25% 95%;

    --popover: 0 18% 12%;
    --popover-foreground: 30 25% 95%;

    --primary: 345 55% 55%;
    --primary-foreground: 0 20% 8%;

    --secondary: 0 15% 18%;
    --secondary-foreground: 30 25% 95%;

    --accent: 38 65% 55%;
    --accent-foreground: 0 20% 8%;

    --muted: 0 15% 20%;
    --muted-foreground: 30 15% 65%;

    --destructive: 0 62% 30%;
    --destructive-foreground: 0 0% 98%;

    --border: 0 15% 22%;
    --input: 0 15% 22%;
    --ring: 345 55% 55%;

    --maroon: 345 55% 55%;
    --maroon-light: 345 50% 65%;
    --maroon-dark: 345 60% 40%;

    --royal-blue: 220 60% 55%;
    --royal-blue-light: 220 55% 65%;

    --gold: 38 65% 55%;
    --gold-light: 42 70% 65%;
    --gold-dark: 35 60% 45%;

    --cream: 30 15% 18%;
    --cream-dark: 30 12% 15%;

    --sidebar-background: 240 5.9% 10%;
    --sidebar-foreground: 240 4.8% 95.9%;
    --sidebar-primary: 224.3 76.3% 48%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 240 3.7% 15.9%;
    --sidebar-accent-foreground: 240 4.8% 95.9%;
    --sidebar-border: 240 3.7% 15.9%;
    --sidebar-ring: 217.2 91.2% 59.8%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground font-body antialiased;
  }
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    @apply font-display;
  }
}

@layer components {
  .text-gradient-gold {
    background: linear-gradient(
      135deg,
      hsl(var(--gold)) 0%,
      hsl(var(--gold-light)) 50%,
      hsl(var(--gold-dark)) 100%
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .bg-gradient-gold {
    background: linear-gradient(
      135deg,
      hsl(var(--gold)) 0%,
      hsl(var(--gold-light)) 50%,
      hsl(var(--gold-dark)) 100%
    );
  }
  .bg-gradient-maroon {
    background: linear-gradient(135deg, hsl(var(--maroon)) 0%, hsl(var(--maroon-dark)) 100%);
  }
  .bg-gradient-premium {
    background: linear-gradient(135deg, hsl(var(--maroon)) 0%, hsl(var(--royal-blue)) 100%);
  }
  .border-gradient-gold {
    border-image: linear-gradient(135deg, hsl(var(--gold)) 0%, hsl(var(--gold-light)) 100%) 1;
  }
  .shadow-elegant {
    box-shadow: var(--shadow-elegant);
  }
  .shadow-gold {
    box-shadow: var(--shadow-gold);
  }

  .link-underline {
    @apply relative;
  }
  .link-underline::after {
    content: "";
    @apply bg-accent absolute bottom-0 left-0 h-0.5 w-full origin-right scale-x-0 transition-transform duration-300;
  }
  .link-underline:hover::after {
    @apply origin-left scale-x-100;
  }
  .shimmer {
    background: linear-gradient(
      90deg,
      hsl(var(--cream)) 0%,
      hsl(var(--gold-light) / 0.3) 50%,
      hsl(var(--cream)) 100%
    );
    background-size: 200% 100%;
    animation: shimmer 2s infinite;
  }
}

@layer utilities {
  .font-display {
    font-family: var(--font-display);
  }
  .font-body {
    font-family: var(--font-body);
  }
}
```

### 3. Tailwind Configuration (`tailwind.config.ts`)

```typescript
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        display: ["Playfair Display", "serif"],
        body: ["Inter", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        maroon: {
          DEFAULT: "hsl(var(--maroon))",
          light: "hsl(var(--maroon-light))",
          dark: "hsl(var(--maroon-dark))",
        },
        royal: {
          DEFAULT: "hsl(var(--royal-blue))",
          light: "hsl(var(--royal-blue-light))",
        },
        gold: {
          DEFAULT: "hsl(var(--gold))",
          light: "hsl(var(--gold-light))",
          dark: "hsl(var(--gold-dark))",
        },
        cream: {
          DEFAULT: "hsl(var(--cream))",
          dark: "hsl(var(--cream-dark))",
        },
        silk: "hsl(var(--silk-pink))",
        forest: "hsl(var(--forest-green))",
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        "pulse-gold": {
          "0%, 100%": { boxShadow: "0 0 0 0 hsl(var(--gold) / 0.4)" },
          "50%": { boxShadow: "0 0 0 10px hsl(var(--gold) / 0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "fade-in-up": "fade-in-up 0.6s ease-out",
        "slide-in-right": "slide-in-right 0.5s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
        float: "float 3s ease-in-out infinite",
        shimmer: "shimmer 2s infinite",
        "pulse-gold": "pulse-gold 2s infinite",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "pattern-indian": `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23b8860b' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
```

### 4. Components Config (`components.json`)

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

### 5. Essential npm Dependencies

```bash
npm install tailwindcss-animate lucide-react framer-motion clsx tailwind-merge embla-carousel-react embla-carousel-autoplay
```
