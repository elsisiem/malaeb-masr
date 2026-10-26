import { type NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getAuthUser, successResponse, errorResponse } from "@/lib/api-helpers"
import { stripe, toStripeAmount, STRIPE_CURRENCY } from "@/lib/stripe"

/**
 * POST /api/payments/initiate
 * Body: { bookingId }
 *
 * Stripe flow:
 *  1. Validate booking belongs to user and is pending payment
 *  2. Create a Stripe PaymentIntent
 *  3. Store payment_id (pi_xxx) on the booking
 *  4. Return { clientSecret } → frontend uses this with Stripe Elements to collect card
 *
 * Frontend then calls stripe.confirmPayment({ elements, confirmParams: {
 *   return_url: process.env.NEXT_PUBLIC_APP_URL + "/api/payments/verify"
 * }})
 * Stripe redirects to /api/payments/verify and also POSTs to /api/payments/webhook
 */
export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await getAuthUser()
    if (authError || !user) return errorResponse("Unauthorized", 401)

    const body = await request.json()
    const { bookingId } = body

    if (!bookingId) return errorResponse("bookingId is required", 400)

    const supabase = createClient()

    // Fetch booking + venue name + user profile for receipt
    const [bookingRes, profileRes] = await Promise.all([
      supabase
        .from("bookings")
        .select("*, venues(name)")
        .eq("id", bookingId)
        .eq("user_id", user.id)
        .single(),
      supabase.from("profiles").select("full_name, phone").eq("id", user.id).single(),
    ])

    if (!bookingRes.data) return errorResponse("Booking not found", 404)

    const booking = bookingRes.data as Record<string, unknown> & {
      price: number
      payment_status: string
      status: string
    }

    if (booking.payment_status === "paid") return errorResponse("Booking is already paid", 400)
    if (booking.status === "canceled") return errorResponse("Cannot pay for a canceled booking", 400)

    const profile = profileRes.data as { full_name: string | null; phone: string | null } | null
    const venueName = (booking.venues as Record<string, unknown> | null)?.name ?? "Sports Venue"

    // Create Stripe PaymentIntent — amount in smallest currency unit (piastres for EGP)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: toStripeAmount(booking.price),
      currency: STRIPE_CURRENCY,
      automatic_payment_methods: { enabled: true },
      metadata: {
        bookingId,
        userId: user.id,
        venueName: String(venueName),
        userEmail: user.email ?? "",
        userName: profile?.full_name ?? "",
      },
      description: `Malaeb Masr booking at ${venueName}`,
      receipt_email: user.email ?? undefined,
    })

    // Store Stripe PaymentIntent ID on the booking row so we can look it up later
    await (supabase.from("bookings") as any)
      .update({
        payment_id: paymentIntent.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId)

    return successResponse({
      bookingId,
      paymentIntentId: paymentIntent.id,
      // clientSecret is used by the frontend Stripe Elements SDK
      clientSecret: paymentIntent.client_secret,
      amount: booking.price,
      currency: STRIPE_CURRENCY.toUpperCase(),
    })
  } catch (err) {
    console.error("[payments/initiate]", err)
    return errorResponse("Payment initiation failed. Please try again.", 500)
  }
}

