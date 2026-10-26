"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function TermsPage() {
  const router = useRouter()

  return (
    <div className="pb-20">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md p-4 flex items-center gap-3 border-b">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Terms of Service</h1>
      </header>

      <main className="container p-6 space-y-6 prose prose-sm dark:prose-invert max-w-2xl mx-auto">
        <p className="text-sm text-muted-foreground">Last updated: April 2025</p>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">1. Acceptance of Terms</h2>
          <p className="text-sm text-muted-foreground">
            By accessing or using Malaeb Masr, you agree to be bound by these Terms of Service. If you do not agree,
            please do not use the app.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">2. Account Registration</h2>
          <p className="text-sm text-muted-foreground">
            You must provide accurate information when creating an account. You are responsible for maintaining the
            security of your account and all activity under it.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">3. Bookings & Payments</h2>
          <p className="text-sm text-muted-foreground">
            All bookings are subject to venue availability and confirmation. Payments are processed securely via Stripe.
            Cancellation and refund policies vary by venue and are shown at booking time.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">4. User Conduct</h2>
          <p className="text-sm text-muted-foreground">
            You agree to use Malaeb Masr only for lawful purposes and in a manner that does not infringe the rights of
            others. Abuse, fraud, or misuse of the platform may result in account termination.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">5. Venue Rules</h2>
          <p className="text-sm text-muted-foreground">
            Venue-specific rules are set by venue owners and must be followed. Malaeb Masr is not responsible for
            incidents occurring at third-party venues.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">6. Limitation of Liability</h2>
          <p className="text-sm text-muted-foreground">
            Malaeb Masr is provided &quot;as is&quot;. We are not liable for any indirect, incidental, or consequential damages
            arising from the use of the platform.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">7. Changes to Terms</h2>
          <p className="text-sm text-muted-foreground">
            We reserve the right to modify these terms at any time. Continued use of the app after changes constitutes
            acceptance of the new terms.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">8. Contact</h2>
          <p className="text-sm text-muted-foreground">
            For questions, contact us at{" "}
            <a href="mailto:support@malaebmasr.com" className="text-primary">
              support@malaebmasr.com
            </a>
            .
          </p>
        </section>
      </main>
    </div>
  )
}
