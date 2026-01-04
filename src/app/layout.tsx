import "./globals.css"
import { ToastProvider } from "@/components/toast-provider"

export const metadata = {
  title: "Dynamic Timetable",
  description: "College Teacher Timetable System",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        {children}
        <ToastProvider />
      </body>
    </html>
  )
}