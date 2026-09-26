import { SignIn } from "@clerk/nextjs"

// Clerk isn't wired up yet (no <ClerkProvider>), so render on request instead of failing the build
export const dynamic = "force-dynamic"

export default function Page() {
  return (
    <div className="flex justify-center items-center h-screen">
      <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
    </div>
  )
}
