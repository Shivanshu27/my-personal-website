# Personal Website

A personal portfolio website built with Hugo showcasing projects, skills, and blogs.

## Features

- Responsive design
- Blog functionality
- Project showcase
- Contact form
- Custom theme

## Prerequisites

- [Hugo](https://gohugo.io/getting-started/installing/) (v0.80.0 or newer)
- Basic knowledge of Markdown and HTML/CSS

## Getting Started

### Local Development

1. Clone this repository
```bash
git clone https://github.com/yourusername/personal-website.git
cd personal-website
```

2. Start the Hugo development server
```bash
hugo server -D
```

3. Open your browser and visit http://localhost:1313/

### Development vs Production URLs

- For local development, the site will be available at http://localhost:1313/
- For GitHub Pages deployment, you may need to update the baseURL in config.toml to match your repository structure (e.g., "/personal-website/" for GitHub Pages project sites)
- For custom domains or Netlify deployment, the baseURL should be set to "/" or your domain name

### Building for Production

To build the site for production:

```bash
hugo
```

This will generate the static site in the `public` directory.

## Customization

### Content

- Edit files in the `content` directory to update the website content.
- Blog posts can be added in the `content/blog` directory.
- Projects can be updated in `content/projects/index.md`.

### Configuration

- Site configuration is in `hugo.toml`.
- Update your personal information, social links, etc. in this file.

### Theme

The custom theme is in the `themes/portfolio` directory:

- `layouts`: HTML templates
- `static`: CSS, JavaScript, and other static assets

## Deployment

### Netlify

1. Connect your GitHub repository to Netlify
2. Set the build command as `hugo`
3. Set the publish directory as `public`

### GitHub Pages

1. Generate your site with `hugo`
2. Push the contents of the `public` directory to the `gh-pages` branch

### GitHub Pages Automated Deployment

This site is set up to deploy automatically to GitHub Pages when you push to the main branch:

1. Create a GitHub repository for your website
2. Push your code to the main branch:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/personal-website.git
git push -u origin main
```

3. Go to your repository on GitHub > Settings > Pages
4. In the "Build and deployment" section:
   - Under "Source", select "Deploy from a branch" 
   - Under "Branch", select "gh-pages" and "/(root)" folder, then save
   
5. Your site will be available at `https://yourusername.github.io/personal-website/`

### Using a Custom Domain (Optional)

1. Add your domain to GitHub Pages:
   - Go to repository Settings > Pages
   - Under "Custom domain", add your domain name and save
   - Check "Enforce HTTPS" if desired
   
2. Update DNS settings at your domain registrar:
   - For an apex domain (example.com), create an A record pointing to GitHub's IP addresses:
     ```
     185.199.108.153
     185.199.109.153
     185.199.110.153
     185.199.111.153
     ```
   - For a subdomain (www.example.com), create a CNAME record pointing to yourusername.github.io

3. Create a CNAME file in your static directory:
```bash
echo "example.com" > static/CNAME
```

4. Update the baseURL in config.toml to match your domain

## License

MIT License
