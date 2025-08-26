import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { auth } from "@lib/auth";
import prisma from "@lib/prisma";
import { Toaster } from "react-hot-toast";
import "./globals.css";

async function getSettings() {
  try {
    const settings = await prisma.settings.findMany({
      select: {
        key: true,
        value: true,
      },
    });
    
    return settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);
  } catch (error) {
    console.error('Error fetching settings for metadata:', error);
    return {};
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  
  return {
    title: settings.site_name || "E-Veikals",
    description: settings.site_description || "Jūsu uzticamais tiešsaistes veikals",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body
        className="antialiased"
        suppressHydrationWarning
      >
        <SessionProvider session={session}>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                style: {
                  background: '#10b981',
                },
              },
              error: {
                duration: 5000,
                style: {
                  background: '#ef4444',
                },
              },
            }}
          />
        </SessionProvider>
      </body>
    </html>
  );
}
