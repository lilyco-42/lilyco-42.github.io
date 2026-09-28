# Lain42 site design system

This design system applies to **every HTML page in this repository**. The user requested one ChatGPT and Apple-inspired visual language across the site. Individual projects keep their own layouts and tool behavior while sharing the same palette, typography, common controls, focus states, and mobile sizing.

## Visual direction

- Light, quiet workspace: soft neutral page background, white surfaces, dark text, subtle borders, and one restrained green accent.
- System font stack only. Keep all CSS and assets self-hosted.
- No decorative gradients, glass blur, or heavy shadows.
- Preserve purpose-built code editors, terminals, image canvases, WASM demos, and the pet scene.

## Shared tokens

Defined in [`assets/site-theme.css`](./assets/site-theme.css):

| Token | Value | Role |
|---|---|---|
| `--site-canvas` | `#f7f7f8` | Page background |
| `--site-surface` | `#ffffff` | Panels and cards |
| `--site-surface-soft` | `#f1f3f4` | Hover and secondary surfaces |
| `--site-text` | `#202123` | Headings and body text |
| `--site-muted` | `#62656a` | Secondary text |
| `--site-border` | `#e3e5e8` | Dividers and control borders |
| `--site-accent` | `#0b6e4f` | Links, primary actions, and focus |
| `--site-danger` | `#b42318` | Error states |

Compatibility aliases are supplied for the existing independent pages. New UI should use the `--site-*` tokens directly.

## Components and behavior

- Body text uses a system UI stack with Chinese system-font fallbacks and a 1.6 line height.
- Cards and sections use white surfaces and a 1px neutral border. Keep the radius at or below 14px.
- Secondary controls use a white surface; primary actions use the green accent with white text.
- Buttons, text fields, selects, and linked actions have at least 44px height.
- Keyboard focus remains visible. Text contrast should meet WCAG AA for normal text.
- Respect `prefers-reduced-motion` and fit a 375px-wide phone without horizontal page scrolling.

## Scope and preservation rules

The shared stylesheet is linked by every checked-in `.html` page. Keep existing routes, labels, form names, event handlers, storage behavior, WASM loading, and app-specific canvas/editor content intact. Do not convert the static projects to a new framework as part of visual unification.

The API gateway, compute market, and proxy panel are separate services hosted outside this repository. Their pages need their own source checkout before this stylesheet can be applied there; this repository cannot claim to unify them.

## Verification

The `Site design checks` GitHub Actions workflow verifies that each HTML page uses the shared theme and that accessibility tokens remain present. Existing WASM-focused tests remain part of their own workflows. Per the user's instruction, use GitHub Actions for build and test verification rather than running local builds or tests.
