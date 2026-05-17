# Shivanshu Singla — Personal Portfolio

A modern, responsive portfolio website built with [Hugo](https://gohugo.io/) and auto-deployed to GitHub Pages.

**Live:** [shivanshu27.github.io/my-personal-website](https://shivanshu27.github.io/my-personal-website/)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Static Site Generator | Hugo |
| Theme | Custom `portfolio` theme (hand-built) |
| Styling | CSS custom properties, Inter + JetBrains Mono |
| Icons | Font Awesome 6 |
| Deployment | GitHub Pages via GitHub Actions |
| CI/CD | `.github/workflows/hugo.yml` — builds on push to `master`, deploys to `gh-pages` |

## Project Structure

```
my-personal-website/
├── config.toml                  # Site config (title, params, menus)
├── netlify.toml                 # Netlify config (optional fallback)
├── content/                     # All page content (Markdown)
│   ├── _index.md                # Homepage content
│   ├── about/index.md           # About page
│   ├── blog/                    # Blog posts
│   │   ├── _index.md
│   │   └── getting-started-with-hugo.md
│   ├── contact/index.md         # Contact page
│   └── projects/index.md        # Projects showcase
├── layouts/                     # Layout overrides
│   └── partials/
│       ├── head.html
│       └── header.html
├── static/                      # Static assets (served as-is)
│   ├── css/
│   │   ├── main.css             # Core stylesheet
│   │   └── custom.css           # Custom overrides
│   ├── images/
│   └── js/
│       └── main.js              # Client-side JS (menu, animations, form validation)
├── themes/portfolio/            # Custom Hugo theme
│   └── layouts/
│       ├── index.html           # Homepage template
│       ├── _default/
│       │   ├── baseof.html      # Base layout (header, footer, meta)
│       │   ├── list.html        # List pages (blog index, etc.)
│       │   └── single.html      # Single content pages
│       └── shortcodes/
│           ├── contact-form.html
│           └── project-card.html
└── .github/workflows/
    └── hugo.yml                 # CI/CD pipeline
```

## Local Development

### Prerequisites

- [Hugo](https://gohugo.io/installation/) v0.110.0 or later

### Run Locally

```bash
# Clone (uses SSH alias for personal GitHub account)
git clone git@github-shivanshu:Shivanshu27/my-personal-website.git
cd my-personal-website

# Start dev server with drafts enabled
hugo server -D

# Open http://localhost:1313/my-personal-website/
```

### Build for Production

```bash
hugo --minify
# Output in ./public/
```

## Deployment

Fully automated — every push to `master` triggers:

1. **GitHub Actions** (`.github/workflows/hugo.yml`) builds the site with `hugo --minify`
2. Built output is pushed to the `gh-pages` branch
3. **GitHub Pages** serves `gh-pages` at the live URL

No manual steps needed.

## Customization

### Site Config

Edit `config.toml` to change site title, description, social links, and navigation menu.

### Content

All pages live in `content/` as Markdown. Add new blog posts under `content/blog/`.

### Styling

- `static/css/main.css` — Design system (colors, layout, components)
- `static/css/custom.css` — Quick overrides

### Shortcodes

- `{{< project-card title="..." description="..." tags="..." >}}` — Project showcase card
- `{{< contact-form >}}` — Contact form (Netlify Forms compatible)

## License

MIT
