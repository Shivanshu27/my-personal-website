# Shivanshu Singla — Personal Portfolio

A modern, responsive portfolio website built with [Hugo](https://gohugo.io/) and auto-deployed to GitHub Pages.

**Live:** [shivanshu27.github.io/my-personal-website](https://shivanshu27.github.io/my-personal-website/)

---

## How Hugo Works (Concepts)

Hugo is a **static site generator** — it takes your Markdown content + HTML templates and compiles them into plain HTML/CSS/JS files that any web server can host. No database, no backend runtime.

```mermaid
flowchart LR
    subgraph Input["📝 Source Files"]
        MD["Markdown\n(content/)"]
        TPL["HTML Templates\n(layouts/)"]
        CSS["CSS / JS / Images\n(static/)"]
        CFG["config.toml"]
    end

    HUGO["⚙️ Hugo\nBuild Engine"]

    subgraph Output["📦 Output (public/)"]
        HTML["Static HTML"]
        ASSETS["CSS, JS, Images"]
    end

    MD --> HUGO
    TPL --> HUGO
    CSS --> HUGO
    CFG --> HUGO
    HUGO --> HTML
    HUGO --> ASSETS
```

### Key Concepts

| Concept | What it means |
|---------|--------------|
| **Content** | Markdown files in `content/` — each file becomes a page |
| **Front Matter** | YAML/TOML metadata at the top of each `.md` file (`title`, `date`, `tags`) |
| **Templates** | Go HTML templates in `layouts/` — define how content is rendered |
| **Shortcodes** | Reusable HTML snippets you embed in Markdown (`{{</* project-card */>}}`) |
| **Theme** | A bundled set of templates + assets (ours lives in `themes/portfolio/`) |
| **baseURL** | The root URL of the site — Hugo prepends this to all links |
| **Static** | Files in `static/` are copied as-is to the output (images, CSS, JS) |

---

## How This Project is Structured

```mermaid
flowchart TB
    subgraph Config["⚙️ Configuration"]
        CT["config.toml\n• Site title, author\n• Menu items\n• Social links\n• Theme selection"]
    end

    subgraph Content["📄 Content (Markdown)"]
        HOME["_index.md\nHomepage"]
        ABOUT["about/index.md\nProfessional background"]
        PROJ["projects/index.md\nProject showcase"]
        BLOG["blog/*.md\nTechnical posts"]
        CONTACT["contact/index.md\nContact info & form"]
    end

    subgraph Theme["🎨 Theme: portfolio"]
        BASE["baseof.html\n(Header + Footer shell)"]
        IDX["index.html\n(Homepage layout)"]
        LIST["list.html\n(Blog index)"]
        SINGLE["single.html\n(Blog post)"]
        SC["shortcodes/\nproject-card, contact-form"]
    end

    subgraph Static["🖼️ Static Assets"]
        MCSS["css/main.css\nDesign system"]
        CCSS["css/custom.css\nOverrides"]
        JS["js/main.js\nInteractions"]
        IMG["images/\nPhotos"]
    end

    Config --> HUGO["⚙️ Hugo Build"]
    Content --> HUGO
    Theme --> HUGO
    Static --> HUGO

    HUGO --> PUB["📦 public/\nReady to deploy"]

    style Config fill:#1e293b,color:#e2e8f0,stroke:#6366f1
    style Content fill:#1e293b,color:#e2e8f0,stroke:#6366f1
    style Theme fill:#1e293b,color:#e2e8f0,stroke:#6366f1
    style Static fill:#1e293b,color:#e2e8f0,stroke:#6366f1
```

---

## Template Rendering Flow

When Hugo builds a page, it uses a **template inheritance** model:

```mermaid
flowchart TB
    BASE["baseof.html\n─────────────\n&lt;html&gt;\n  &lt;head&gt; meta, CSS, fonts &lt;/head&gt;\n  &lt;body&gt;\n    HEADER (nav)\n    {{ block 'main' }}\n    FOOTER\n  &lt;/body&gt;\n&lt;/html&gt;"]

    IDX["index.html\n{{ define 'main' }}\n  Hero section\n  Skills grid\n  Recent blog posts"]

    LIST["list.html\n{{ define 'main' }}\n  Page header\n  Blog post list"]

    SINGLE["single.html\n{{ define 'main' }}\n  Page header\n  Article content\n  Post navigation"]

    BASE -->|"Homepage /"| IDX
    BASE -->|"List pages /blog/"| LIST
    BASE -->|"Single pages /blog/post/"| SINGLE

    SC_PC["{{< project-card >}}\nRendered inside\nMarkdown content"]
    SC_CF["{{< contact-form >}}\nRendered inside\nMarkdown content"]

    SINGLE -.->|"shortcodes"| SC_PC
    SINGLE -.->|"shortcodes"| SC_CF
    LIST -.->|"shortcodes"| SC_PC

    style BASE fill:#4f46e5,color:#fff,stroke:#818cf8
    style IDX fill:#0f172a,color:#e2e8f0,stroke:#6366f1
    style LIST fill:#0f172a,color:#e2e8f0,stroke:#6366f1
    style SINGLE fill:#0f172a,color:#e2e8f0,stroke:#6366f1
```

---

## CI/CD & Deployment Pipeline

```mermaid
flowchart LR
    DEV["🧑‍💻 Developer\ngit push to master"]
    GHA["⚡ GitHub Actions\nhttps://github.com/\nShivanshu27/my-personal-website\n/actions"]
    BUILD["🔨 Hugo Build\nhugo --minify"]
    GHP["🌐 GitHub Pages\nServes gh-pages branch"]
    USER["👀 Visitor\nhttps://shivanshu27.github.io\n/my-personal-website/"]

    DEV -->|"push"| GHA
    GHA -->|"checkout + setup"| BUILD
    BUILD -->|"deploy to\ngh-pages branch"| GHP
    GHP -->|"serves static files"| USER

    style DEV fill:#1e293b,color:#e2e8f0,stroke:#6366f1
    style GHA fill:#1e293b,color:#e2e8f0,stroke:#f59e0b
    style BUILD fill:#4f46e5,color:#fff,stroke:#818cf8
    style GHP fill:#1e293b,color:#e2e8f0,stroke:#10b981
    style USER fill:#1e293b,color:#e2e8f0,stroke:#06b6d4
```

**Pipeline steps (`.github/workflows/hugo.yml`):**

1. **Trigger** — Push to `master` branch
2. **Checkout** — Clone repo with full history
3. **Setup Hugo** — Install latest Hugo extended edition
4. **Build** — Run `hugo --minify` → outputs to `./public/`
5. **Deploy** — Push `./public/` contents to `gh-pages` branch via `peaceiris/actions-gh-pages`
6. **Serve** — GitHub Pages automatically serves the `gh-pages` branch

---

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
