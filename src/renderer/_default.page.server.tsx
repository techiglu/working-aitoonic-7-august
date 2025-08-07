import ReactDOMServer from 'react-dom/server';
import { PageShell } from './PageShell';
import { escapeInject, dangerouslySkipEscape } from 'vite-plugin-ssr/server';
import type { PageContextServer } from './types';

export { render };
export const passToClient = ['pageProps', 'urlPathname', 'documentProps'];

async function render(pageContext: PageContextServer) {
  const { Page, pageProps } = pageContext;
  
  // Render the page to string
  const pageHtml = ReactDOMServer.renderToString(
    <PageShell pageContext={pageContext}>
      <Page {...pageProps} />
    </PageShell>
  );

  // Extract document properties
  const { documentProps } = pageContext.exports;
  const title = (documentProps && documentProps.title) || 'Aitoonic - Discover the Best AI Tools and Agents';
  const description = (documentProps && documentProps.description) || 'Find and compare the best AI tools and agents. Comprehensive reviews, ratings, and insights to help you make informed decisions about AI technology.';

  const documentHtml = escapeInject`<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="/sparkles.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <!-- Google Tag Manager -->
        <script>
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-NCFRQ9B4');
        </script>
        <!-- End Google Tag Manager -->

        <!-- Google Search Console Verification -->
        <meta name="google-site-verification" content="wLiR00gCYssjeeNseGXWIO5SqlzqXwb7ua-nMNC-YJU" />

        <!-- Primary Meta Tags -->
        <title>${title}</title>
        <meta name="title" content="${title}">
        <meta name="description" content="${description}">
        <meta name="keywords" content="AI tools, artificial intelligence, machine learning, AI agents, AI software, AI reviews">
        
        <!-- Open Graph / Facebook -->
        <meta property="og:type" content="website">
        <meta property="og:url" content="https://aitoonic.com${pageContext.urlPathname}">
        <meta property="og:title" content="${title}">
        <meta property="og:description" content="${description}">
        <meta property="og:image" content="https://aitoonic.com/og-image.jpg">

        <!-- Twitter -->
        <meta property="twitter:card" content="summary_large_image">
        <meta property="twitter:url" content="https://aitoonic.com${pageContext.urlPathname}">
        <meta property="twitter:title" content="${title}">
        <meta property="twitter:description" content="${description}">
        <meta property="twitter:image" content="https://aitoonic.com/og-image.jpg">

        <!-- Canonical URL -->
        <link rel="canonical" href="https://aitoonic.com${pageContext.urlPathname}" />

        <!-- Favicon -->
        <link rel="apple-touch-icon" sizes="180x180" href="/sparkles.svg">
        <link rel="icon" type="image/svg+xml" sizes="32x32" href="/sparkles.svg">
        <link rel="icon" type="image/svg+xml" sizes="16x16" href="/sparkles.svg">
        <link rel="manifest" href="/site.webmanifest">

        <!-- Preload critical resources -->
        <link rel="preload" href="/src/index.css" as="style">
        <link rel="preload" href="https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?auto=format&fit=crop&q=80&w=1200" as="image">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        
        <!-- Performance optimizations -->
        <link rel="dns-prefetch" href="//images.unsplash.com">
        <link rel="dns-prefetch" href="//i.imgur.com">
      </head>
      <body>
        <!-- Google Tag Manager (noscript) -->
        <noscript>
          <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-NCFRQ9B4"
          height="0" width="0" style="display:none;visibility:hidden"></iframe>
        </noscript>
        <!-- End Google Tag Manager (noscript) -->

        <div id="react-root">${dangerouslySkipEscape(pageHtml)}</div>
      </body>
    </html>`;

  return {
    documentHtml,
    pageContext: {
      // We can add some `pageContext` here, which will be serialized and passed to the browser
    }
  };
}