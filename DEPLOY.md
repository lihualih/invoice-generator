# Deployment Guide

This guide covers how to deploy the Invoice Generator to various hosting platforms.

## Quick Start

The Invoice Generator is a static website with no build process required. Simply upload the files to any web server or hosting platform.

## Deployment Options

### 1. GitHub Pages (Free)

**Steps:**
1. Create a new GitHub repository
2. Upload all project files
3. Go to repository Settings > Pages
4. Select source branch (usually `main` or `master`)
5. Set folder to `/ (root)`
6. Click Save

**URL Format:** `https://username.github.io/repository-name`

**Custom Domain:**
1. Add a `CNAME` file with your domain
2. Configure DNS A records:
   ```
   185.199.108.153
   185.199.109.153
   185.199.110.153
   185.199.111.153
   ```
3. Enable HTTPS in GitHub Pages settings

### 2. Netlify (Free Tier)

**Steps:**
1. Sign up at [netlify.com](https://netlify.com)
2. Click "New site from Git" or drag-and-drop the project folder
3. If using Git:
   - Connect your GitHub/GitLab/Bitbucket account
   - Select the repository
   - Build command: (leave empty)
   - Publish directory: `.` or `/`
4. Click Deploy

**Features:**
- Automatic HTTPS
- Custom domain support
- Continuous deployment from Git
- Form handling (if needed later)

**URL Format:** `https://random-name.netlify.app`

### 3. Vercel (Free Tier)

**Steps:**
1. Sign up at [vercel.com](https://vercel.com)
2. Install Vercel CLI: `npm i -g vercel`
3. Run `vercel` in the project directory
4. Follow the prompts

**Or via Dashboard:**
1. Click "New Project"
2. Import from Git or upload
3. Framework Preset: Other
4. Click Deploy

**Features:**
- Automatic HTTPS
- Edge network (fast globally)
- Custom domains
- Analytics

### 4. Cloudflare Pages (Free Tier)

**Steps:**
1. Sign up at [pages.cloudflare.com](https://pages.cloudflare.com)
2. Create a new project
3. Connect your Git repository
4. Build settings:
   - Build command: (leave empty)
   - Build output directory: `/`
5. Click Save and Deploy

**Features:**
- Unlimited bandwidth
- Global CDN
- Automatic HTTPS
- Custom domains
- Analytics

### 5. AWS S3 + CloudFront

**Steps:**
1. Create an S3 bucket
2. Enable static website hosting
3. Upload all files
4. Set bucket policy for public read access:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::your-bucket-name/*"
       }
     ]
   }
   ```
5. Create CloudFront distribution pointing to S3
6. Configure custom domain with Route 53 (optional)

### 6. Traditional Web Hosting

**Steps:**
1. Compress the project folder into a ZIP file
2. Upload via FTP/SFTP to your web hosting
3. Extract files in the public HTML directory
4. Access via your domain

**Requirements:**
- Any web server (Apache, Nginx, etc.)
- No server-side processing needed
- No database required

## Pre-Deployment Checklist

### Performance Optimization
- [ ] Minify CSS (optional, already small)
- [ ] Minify JavaScript (optional, already small)
- [ ] Optimize favicon.svg
- [ ] Enable gzip compression on server
- [ ] Set cache headers for static assets

### SEO Setup
- [ ] Update `robots.txt` with correct sitemap URL
- [ ] Update Open Graph URLs in `index.html`
- [ ] Update structured data URLs
- [ ] Submit sitemap to Google Search Console
- [ ] Verify site in Google Search Console

### Analytics (Optional)
- [ ] Add Google Analytics tracking code
- [ ] Set up Google Search Console
- [ ] Configure event tracking for PDF exports

### Monetization Setup
- [ ] Apply for Google AdSense
- [ ] Set up payment processing for Pro version
- [ ] Configure Stripe/PayPal for subscriptions

## Environment Variables

No environment variables required. All configuration is in the source code.

## Custom Domain Setup

### DNS Configuration

**For Apex Domain (example.com):**
```
Type: A
Name: @
Value: [IP addresses from your hosting provider]
```

**For Subdomain (invoice.example.com):**
```
Type: CNAME
Name: invoice
Value: your-hosting-url.com
```

### SSL/HTTPS

Most modern hosting platforms provide automatic SSL certificates:
- GitHub Pages: Automatic with custom domains
- Netlify: Automatic (Let's Encrypt)
- Vercel: Automatic
- Cloudflare: Automatic
- AWS: Use AWS Certificate Manager

## Post-Deployment

### Testing
1. Test all features on the live site
2. Test PDF export functionality
3. Test on multiple browsers
4. Test on mobile devices
5. Test dark mode
6. Test save/load functionality
7. Verify print layout

### Monitoring
1. Set up uptime monitoring (e.g., UptimeRobot)
2. Monitor Core Web Vitals
3. Check for JavaScript errors in production
4. Monitor analytics

### SEO
1. Submit URL to Google
2. Submit sitemap
3. Request indexing for main pages
4. Monitor Search Console for issues

## Troubleshooting

### PDF Export Not Working
- Ensure `html2pdf.js` CDN is accessible
- Check browser console for errors
- Try a different browser

### Styles Not Loading
- Verify file paths are correct
- Check for case sensitivity in file names
- Clear browser cache

### Dark Mode Not Persisting
- Check if LocalStorage is enabled
- Verify no browser extensions blocking storage

### Fonts Not Loading
- Check Google Fonts CDN availability
- Verify font link in HTML head

## Performance Benchmarks

Target metrics:
- **Lighthouse Performance**: 95+
- **First Contentful Paint**: < 1s
- **Largest Contentful Paint**: < 2s
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 2s

## Security Considerations

- All processing is client-side
- No user data is transmitted to servers
- LocalStorage can be cleared by user
- No cookies are used
- No external API calls (except CDN for fonts/PDF library)

## Backup & Recovery

- **Local Data**: Users can export/import via browser
- **Source Code**: Use version control (Git)
- **No Server Data**: Nothing to backup server-side

---

For additional help, refer to the hosting platform's documentation or create an issue in the project repository.
