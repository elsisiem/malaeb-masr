import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getAuthUser, errorResponse } from "@/lib/api-helpers"

/**
 * GET /api/bookings/[id]/qr
 * Returns a QR code image (PNG) for the booking ticket.
 * Uses the free api.qrserver.com service — no package needed.
 */
export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, error: authError } = await getAuthUser()
    if (authError || !user) return errorResponse("Unauthorized", 401)

    const supabase = createClient()
    const { data: booking, error } = await supabase
      .from("bookings")
      .select(
        `
        id, date, start_time, duration, price, status, payment_status,
        venues(name, location),
        facilities(name, type)
      `,
      )
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single()

    if (error || !booking) return errorResponse("Booking not found", 404)
    if (booking.payment_status !== "paid") return errorResponse("Ticket not available until payment is confirmed", 402)

    // Build the ticket payload that will be encoded in the QR
    const ticketPayload = JSON.stringify({
      bookingId: booking.id,
      venue: (booking.venues as unknown as { name: string })?.name,
      facility: (booking.facilities as unknown as { name: string })?.name,
      date: booking.date,
      time: booking.start_time,
      duration: booking.duration,
      price: booking.price,
      verifyUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/bookings/${booking.id}/verify`,
    })

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(ticketPayload)}&format=png`

    // Proxy the QR image so we don't expose the external service URL
    const qrResponse = await fetch(qrUrl)
    if (!qrResponse.ok) return errorResponse("Failed to generate QR code", 500)

    const imageBuffer = await qrResponse.arrayBuffer()

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "private, max-age=3600",
      },
    })
  } catch {
    return errorResponse("Internal server error", 500)
  }
}
