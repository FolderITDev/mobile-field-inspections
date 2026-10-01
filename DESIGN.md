# Field Inspections design system

A precise field notebook: calm, trustworthy and comfortable for repeated work outdoors. The memorable element is a **vertical numbered checklist that reads like an editorial index**, with small contact-sheet photos beside findings. It should never feel like a dashboard of cards.

This document is the source of truth for the interface. Tokens live in [`src/theme/tokens.ts`](src/theme/tokens.ts) and shared components in [`src/ui/`](src/ui); screens use both and never hard-code colors, fonts or spacing.

## Principles

- The checklist is the interface: numbered rows, answers in words, the next checkpoint in the accent color.
- Newsreader is used sparingly for the editorial voice; DM Sans carries everything a person reads quickly or acts on.
- Saving is visible and honest: a stable label, never a spinner that flickers on each keystroke.
- Findings stand out through an icon and the words **Needs attention**, not through color alone.

## Color

Light and dark appearances follow the system setting; every token has a value in both. Use tokens by role, not by hue.

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `canvas` | `#F3F1E9` | `#111E1C` | Screen background |
| `surface` | `#FFFDF8` | `#1B2B27` | Fields, cards and grouped content |
| `raised` | `#FFFDF8` | `#2C4039` | Control that sits on a `fill` track, such as the segmented thumb |
| `fill` | `#E8E6DC` | `#22342F` | Tracks, pressed rows and quiet containers |
| `ink` | `#163330` | `#EEF4EF` | Primary text and icons |
| `muted` | `#53645E` | `#B5C8BD` | Secondary text and metadata |
| `tertiary` | `#6F7E77` | `#86998F` | Placeholders and de-emphasized captions |
| `accent` | `#1D5B4F` | `#9CD1B0` | Primary action, current step and selection |
| `accentSubtle` | `#E1ECE4` | `#1E3A30` | Background behind accent content |
| `onAccent` | `#FFFFFF` | `#11241C` | Text and icons on `accent` |
| `attention` | `#A44730` | `#E99C80` | Needs-attention answers, always with icon and words |
| `attentionSubtle` | `#F7E4DC` | `#3A2620` | Background behind attention content |
| `rule` | `#D3D9CE` | `#3A4D45` | Dividers and list rules |
| `control` | `#7F8E87` | `#6A7F74` | Field and control borders |
| `imageOutline` | `rgba(0, 0, 0, 0.1)` | `rgba(255, 255, 255, 0.1)` | 1 px outline around photos |

Measured contrast for the core pairs. Light: ink on canvas 11.98:1, muted on canvas 5.54:1, on-accent on accent 7.89:1. Dark: ink on canvas 15.35:1, muted on canvas 9.75:1, on-accent on accent 9.41:1.

## Typography

**Newsreader** for site names, prompts and numerals. **DM Sans** for body, labels and actions. Fonts are bundled from `@expo-google-fonts`; licenses are in `docs/font-licenses/`.

| Variant | Font | Size / line | Tracking | Max scale | Use |
| --- | --- | --- | --- | --- | --- |
| `display` | Newsreader 500 | 34 / 40 | -0.6 | 1.4× | Large screen titles |
| `title` | Newsreader 500 | 26 / 32 | -0.3 | 1.6× | Section and sheet titles |
| `headline` | DMSans 600 | 17 / 23 | -0.2 | 2× | Row titles and emphasized values |
| `body` | DMSans 400 | 16 / 24 | 0 | 2× | Paragraphs and field values |
| `button` | DMSans 600 | 16 / 20 | -0.1 | 1.6× | Button labels |
| `label` | DMSans 500 | 15 / 20 | 0 | 2× | Field labels and compact actions |
| `subhead` | DMSans 400 | 14 / 20 | 0 | 2× | Supporting text under titles |
| `footnote` | DMSans 400 | 13 / 18 | 0.1 | 2× | Metadata, timestamps and hints |
| `eyebrow` | DMSans 600 | 12 / 16 | 0.8 | 1.8× | Uppercase section labels (screen readers get sentence case) |
| `ordinal` | Newsreader 500 | 22 / 26 | -0.2 | 1.4× | List numerals |

Tracking tightens as size grows and opens slightly on small text. `Max scale` caps Dynamic Type only where a display size would otherwise overflow.

## Spacing and shape

- Spacing (pt): `xxs` 2 · `xs` 4 · `sm` 8 · `md` 12 · `lg` 16 · `xl` 24 · `xxl` 32 · `xxxl` 48 · `gutter` 20. `gutter` is the screen edge inset.
- Radius (pt): `sm` 6 · `md` 12 · `lg` 16 · `pill` 999.
- Continuous corners: 6 pt for small elements, 12 pt for controls, 16 pt for content surfaces. Open 4-point rhythm with a 20 pt gutter; 1 pt rules do the structural work.
- Photos use a 4:3 crop with a 1 px `imageOutline`; checkpoint photos appear as small contact-sheet thumbnails. Documentation imagery must be original or properly licensed.

## Motion

- Durations (ms): press: 120, quick: 160, base: 220, enter: 260, progress: 300. UI motion stays under 300 ms; navigation transitions belong to the platform.
- Curves: strong ease-out `cubic-bezier(0.23, 1, 0.32, 1)` for entering and state changes, ease-in-out `cubic-bezier(0.77, 0, 0.175, 1)` for movement between two positions. Never ease-in on UI.
- Press feedback starts on press-in and scales to 0.97; it commits on release.
- One haptic per user action, on the same frame as the visual change. Haptics are never the only feedback.
- Animate only meaningful state changes. No decorative loops, confetti or counters that hide the real value.
- The progress track animates over 300 ms when an answer is saved.

## Components

| Component | Use it for |
| --- | --- |
| `Text` | Every string. Pick a `variant` from the type scale and a `tone` from the palette; never set font family or size inline. |
| `Button` | `primary`, `secondary`, `plain` and `destructive` actions. `busy` keeps the label in place and swaps the icon for a spinner. |
| `HeaderButton` | Native-header actions. Icon-only buttons always carry an accessible name. |
| `ScrollScreen`, `Block`, `Footer` | Screen body. `Block` aligns free-standing content to the gutter; `Footer` is the pinned action bar that clears the home indicator and the keyboard. |
| `Section`, `Row`, `ActionRow`, `Separator` | Ruled lists with `Row`, `ActionRow` and `Separator`. Rows are full-bleed with a background highlight on press, not cards. |
| `TextField` | Labelled inputs. `requirement` writes Required or Optional next to the label; `error` replaces the hint under the field. |
| `ProgressBar` | Thin progress track paired with progress in words. |
| `EmptyState`, `Notice` | Empty lists (`EmptyState`) and inline errors next to the action that failed (`Notice`). |
| `Icon` | Semantic icon names mapped to SF Symbols on iOS and Material Symbols on Android and web. Screens never reference raw glyphs. |
| `PressableScale` | Custom pressable surfaces that need press feedback. |

Add a component to `src/ui/` only when a second screen needs it; otherwise keep it beside its feature in `src/features/<feature>/components/`.

## Screens

1. **Inspections.** Large title, a **Continue** card for the latest draft with progress in words (`4 of 8 recorded`), a thin track and the number of findings, then the history list.
2. **New inspection (modal).** Site name and an outline of the eight checkpoints grouped by Access, Safety and Condition. **Start** sits in the header.
3. **Inspection.** Site, state and progress, then numbered rows grouped by section. Each row shows the answer in words and the photo count; the first unanswered checkpoint is marked **Up next**. The footer offers **Continue: <checkpoint>** or **Review and complete**.
4. **Checkpoint.** `n of 8` in the header, the prompt, three answer options (Pass, Needs attention, Not applicable) with radio semantics, a note and up to two photos. A **Saving…** or **Not saved** label stays visible; the footer moves to the next checkpoint.
5. **Review (modal).** Tallies of passed, needs attention and not applicable, every finding with its note and photos, a sentence explaining that completing makes the inspection read-only, and **Complete inspection**.
6. **About.** What the app does, a destructive **Delete all inspections** row and the version and license line.

Navigation uses native Expo Router stacks: large titles on root screens, modals for creation and review, and platform back gestures everywhere.

## States

Every screen designs four states explicitly:

- **Loading:** the splash stays up until stored records are readable, so lists never flash empty.
- **Empty:** an `EmptyState` with an icon, one sentence on what to do and the primary action.
- **Error:** a `Notice` next to the action that failed. Forms keep their values and any selected photo so the person can retry.
- **Content:** the normal layout. Destructive actions ask for confirmation with the platform dialog.

## Accessibility

- Touch targets are at least 48 pt (`hitTarget`), including icon buttons and steppers.
- Every status is conveyed with an icon **and** words; color is never the only signal.
- Text scales with the system setting up to each variant's max scale; layouts wrap instead of truncating meaningful content.
- Every interactive element has an accessible role and name; custom controls expose their state (selected, checked, disabled, busy).
- Screen-reader labels read as sentences, without doubled punctuation, and announce errors when they appear.
- Reduce Motion replaces scale and slide effects with short opacity changes.
- Contrast targets: body text ≥ 4.5:1, large text and control borders ≥ 3:1, in both appearances.

## Copy

- English, sentence case, short and specific. Buttons say what happens (**Confirm delivery**, not **OK**).
- Errors say what went wrong and what to do next.
- Never claim more than the app does: no verified identity, certified time, compliance or authenticity statements.
