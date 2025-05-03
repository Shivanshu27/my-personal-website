---
title: "Getting Started with Hugo: Building a Static Site"
date: 2023-01-08T12:00:00-00:00
draft: false
tags: ["hugo", "static site", "web development"]
categories: ["tutorials"]
---

# Getting Started with Hugo: Building a Static Site

Hugo is a powerful static site generator written in Go. It's known for its exceptional speed and flexibility. In this post, I'll walk through the process of setting up a Hugo site from scratch, just like I did with this personal website.

## Why Hugo?

There are many static site generators available today (Jekyll, Gatsby, Eleventy, etc.), but Hugo has some distinct advantages:

- **Speed**: Hugo is incredibly fast, generating thousands of pages in seconds
- **Easy Installation**: Single binary with no dependencies
- **Flexible Content**: Supports Markdown, HTML, and other formats
- **Powerful Templating**: Rich templating language for complex layouts

## Setting Up Hugo

### Installation

First, you'll need to install Hugo. There are several ways to do this depending on your operating system:

```bash
# On macOS using Homebrew
brew install hugo

# On Windows using Chocolatey
choco install hugo -confirm

# On Linux using Snap
snap install hugo
```

### Creating a New Site

Once Hugo is installed, creating a new site is simple:

```bash
hugo new site my-website
cd my-website
```

This creates a new Hugo site in a folder called `my-website`.

### Adding a Theme

Hugo has a rich ecosystem of themes. You can add a theme as a git submodule:

```bash
git init
git submodule add https://github.com/theNewDynamic/gohugo-theme-ananke themes/ananke
```

Then, update your `hugo.toml` (or `config.toml`) file to use the theme:

```toml
theme = "ananke"
```

### Creating Content

Content in Hugo is organized in the `content` directory. To create a new post:

```bash
hugo new blog/my-first-post.md
```

This creates a new Markdown file with front matter:

```markdown
---
title: "My First Post"
date: 2023-01-08T12:00:00-00:00
draft: true
---

# My First Post

Content goes here...
```

### Previewing Your Site

To see your site in action, run the Hugo development server:

```bash
hugo server -D
```

The `-D` flag includes draft content. Navigate to `http://localhost:1313` to see your site.

### Building for Production

When you're ready to deploy, run:

```bash
hugo
```

This generates your static site in the `public` directory.

## Next Steps

In future posts, I'll dive deeper into:

- Creating custom shortcodes
- Customizing themes
- Deploying to Netlify/Vercel
- Adding a CMS with Netlify CMS

Stay tuned!

Have you used Hugo or other static site generators? Let me know your experiences in the comments.
