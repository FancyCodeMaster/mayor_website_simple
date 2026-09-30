# Design System

## 1. Color tokens

**Blue** primary, a **darker blue** for buttons and "Read more" links.
Defined once in `src/styles/global.css` under Tailwind 4's `@theme` (and
overridden under `[data-theme=dark]`). Never a hardcoded hex in a
component.

| Token | Light | Dark |
|---|---|---|
| `--color-primary` | `#2563EB` | `#3B82F6` |
| `--color-primary-dark` (buttons, "Read more") | `#1E3A8A` | `#1D4ED8` |
| `--color-bg` | `#FFFFFF` | `#0F172A` |
| `--color-surface` (cards) | `#F8FAFC` | `#1E293B` |
| `--color-text` | `#0F172A` | `#F1F5F9` |
| `--color-text-muted` | `#475569` | `#94A3B8` |
| `--color-border` | `#E2E8F0` | `#334155` |

Hex values are a starting point; changing any is a one-file edit.

**Status badges** (distinguishable by more than color):

| Status | Color | Label |
|---|---|---|
| `planned` | Gray | "Planned" |
| `in_progress` | Amber | "In Progress" |
| `completed` | Green | "Completed" |
| `stalled` | Red | "Stalled" |

## 2. Dark / light mode

`data-theme="light"` / `"dark"` on `<html>` (`architecture.md` §7). Every
token has both values; components reference tokens, so no component needs
dark-specific styling beyond Tailwind's `dark:` variant where unavoidable.

## 3. Nav toggles

Both live together, top-right of the sticky nav, on every page:

- **Theme toggle**: sun/moon icon button, flips `data-theme` instantly.
- **Language toggle**: "EN" / "नेपाली", a link to the equivalent page in
  the other locale (`i18n.md` §2), styled and positioned like the theme
  toggle so it reads as another quick switch.

Theme persists in `localStorage`; language persists via the URL.

## 4. Status badge component

`StatusBadge`: a small pill using §1 colors, always paired with its text
label. Used on `WorkCard` and the work detail page.

## 5. Issue form field treatment

The "description" field is a large multi-line `<textarea>` (at least 5
rows, growing with content), a visual "comment box" that signals a real
explanation is expected. "Tole" stays a single-line input.

## 6. Layout & responsiveness

Mobile-first, Tailwind's default breakpoints, full-width homepage
sections, a responsive 1/2/3-column card grid on `/work` and `/updates`.

## 7. Accessibility baseline

WCAG 2.1 AA floor.
- Toggles have accessible labels that update with state ("Switch to dark
  mode" / "अंग्रेजीमा हेर्नुहोस्").
- Status badges always carry a text label.
- `prefers-reduced-motion` respected (instant theme swap, no fade).
- Visible focus styles; sufficient contrast in both themes.