
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Fútbol Stats Zone',
  description: 'Your daily hub for football match statistics and schedules.',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap" rel="stylesheet"></link>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#121212" />
        <Script
          id="adsense-consent"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function() {
              var src = "https://fundingchoicesmessages.google.com/i/pub-5144766807318748?ers=1";
              var script = document.createElement("script");
              script.src = src;
              script.async = true;
              document.head.appendChild(script);
            })();`,
          }}
        />
        <Script
          id="adsense-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function() {
              var src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5144766807318748";
              var script = document.createElement("script");
              script.src = src;
              script.async = true;
              script.crossOrigin = "anonymous";
              document.head.appendChild(script);
            })();`,
          }}
        />
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
