import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
// import { CopilotKit } from "@copilotkit/react-core";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { Toaster } from "@/components/ui/sonner";
import { ReactQueryProvider } from "@/lib/react-query-provider";
import { ErrorBoundary } from "@/components/error-boundary";
import "./globals.css";
// import "@copilotkit/react-ui/styles.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "magiCV - AI-Powered CV Generator",
  description: "Generate tailored CVs in under 10 seconds with AI. Perfect for digital nomads and remote professionals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ErrorBoundary
          featureName="Application"
          errorMessage="An unexpected error occurred. We're working to fix this issue."
        >
          <ReactQueryProvider>
            <ScrollProgress />
            {/* Temporarily disabled CopilotKit to avoid Mastra integration issues */}
            {/* <CopilotKit
              runtimeUrl="/api/copilotkit"
              agent="weatherAgent"
              publicApiKey="ck_pub_ddccb58c6c87ae6d3bf709669ab0fb97"
            > */}
              {children}
            {/* </CopilotKit> */}
            <Toaster position="top-right" expand={false} richColors closeButton />
          </ReactQueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
