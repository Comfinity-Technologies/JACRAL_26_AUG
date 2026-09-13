# JACRAL Font Setup

## Custom Font Installation

Place your purchased font files in the `/public/fonts/` directory:

```
public/
  fonts/
    Paradiso.woff2       (or Paradiso.otf – convert to woff2 for web)
    Paradiso.woff
    Bropella.woff2
    Bropella.woff
    SilverGarden.woff2
    SilverGarden.woff
```

## Usage in Code

The three fonts are defined as CSS custom properties and utility classes:

| Font         | CSS Variable           | Class            | Use Case                                 |
|--------------|------------------------|------------------|------------------------------------------|
| Paradiso     | `var(--font-display)`  | `font-display`   | Hero titles, large page headings (H1)    |
| Bropella     | `var(--font-heading)`  | `font-heading`   | Section headings (H2, H3), card titles   |
| Silver Garden| `var(--font-script)`   | `font-script`    | Decorative taglines, accent text         |
| Inter        | `var(--font-body)`     | `font-body`      | Body text, labels, buttons (default)     |

### In TSX Components

```tsx
// Paradiso – page title
<h1 style={{ fontFamily: "var(--font-display)" }}>
  Pure Jackfruit Goodness
</h1>

// Bropella – section heading
<h2 style={{ fontFamily: "var(--font-heading)" }}>
  Featured Products
</h2>

// Silver Garden – decorative script
<span style={{ fontFamily: "var(--font-script)" }}>
  From nature, to your table
</span>
```

## Google Font Fallbacks

Until your font files are placed in `/public/fonts/`, the browser will
automatically use:
- **Playfair Display** in place of Paradiso
- **DM Serif Display** in place of Bropella
- **System cursive** in place of Silver Garden

These fallbacks are loaded via Google Fonts in `index.html`.

## Converting Font Files

If you have `.otf` or `.ttf` files, convert them to `.woff2` using:
- https://transfonter.org/
- https://cloudconvert.com/otf-to-woff2
