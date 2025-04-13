/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com'],
  },
  // Add configuration for external scripts
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-eval' https://*.plaid.com https://www.gstatic.com/recaptcha/ https://www.google.com/recaptcha/ https://cdn.getpinwheel.com 'sha256-X6UVWbFFYTZgOj+DPMLYibEEfe7um9ecOrUSjySaamk=' 'sha256-Q2BuusfJf7qPwvz9U1VOF502KW7JtNFXxsDsxfPIu50=' 'unsafe-inline';
              style-src 'self' 'unsafe-inline';
              img-src 'self' data: blob: https://*;
              font-src 'self';
              frame-src 'self' https://*.plaid.com https://www.google.com/recaptcha/ https://recaptcha.google.com/recaptcha/;
              connect-src 'self' https://*.plaid.com https://*.supabase.co https://api.openai.com wss://*.supabase.co;
            `.replace(/\s+/g, ' ').trim()
          }
        ]
      }
    ]
  },
}

module.exports = nextConfig 