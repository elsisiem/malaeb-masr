import { type NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getAuthUserWithProfile, successResponse, errorResponse } from "@/lib/api-helpers"

/**
 * GET /api/owner/venues
 * List all venues owned by the authenticated owner.
 */
export async function GET() {
  try {
    const { user, error: authError } = await getAuthUserWithProfile(["owner", "admin"])
    if (authError) return errorResponse(authError, authError === "Unauthorized" ? 401 : 403)

    const supabase = createClient()
    const { data, error } = await supabase
      .from("venues")
      .select(
        `
        *,
        facilities(id, name, type, price, available),
        bookings(id, status, payment_status)
      `,
      )
      .eq("owner_id", user!.id)
      .order("created_at", { ascending: false })

    if (error) return errorResponse(error.message, 500)

    // Annotate each venue with derived stats
    const enriched = (data ?? []).map((venue) => {
      const allBookings = (venue.bookings as unknown) as Array<{ status: string; payment_status: string }>
      const totalBookings = allBookings.length
      const confirmedBookings = allBookings.filter((b) => b.status === "confirmed" || b.status === "upcoming").length
      return {
        ...(venue as Record<string, unknown>),
        totalBookings,
        confirmedBookings,
        bookings: undefined, // remove raw booking list from response
      }
    })

    return successResponse(enriched)
  } catch {
    return errorResponse("Internal server error", 500)
  }
}

/**
 * POST /api/owner/venues
 * Create a new venue owned by the authenticated owner.
 * Body: { name, description, location, address, sports, price, images?, facilities? }
 */
export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await getAuthUserWithProfile(["owner", "admin"])
    if (authError) return errorResponse(authError, authError === "Unauthorized" ? 401 : 403)

    const body = await request.json()
    const {
      name,
      description,
      location,
      address,
      sports,
      price,
      images = [],
      facilities = [],
    } = body

    if (!name?.trim()) return errorResponse("Venue name is required", 400)
    if (!location?.trim()) return errorResponse("Location is required", 400)
    if (!sports || !Array.isArray(sports) || sports.length === 0)
      return errorResponse("At least one sport is required", 400)
    if (!price || isNaN(Number(price)) || Number(price) <= 0)
      return errorResponse("A valid price per hour is required", 400)

    const supabase = createClient()

    // Insert the venue
    const { data: venue, error: venueError } = await supabase
      .from("venues")
      .insert({
        name: name.trim(),
        description: description?.trim() ?? null,
        location: location.trim(),
        district: address?.trim() ?? location.trim(), // district mirrors the address field
        address: address?.trim() ?? null,
        sports,
        price: Number(price),
        images,
        owner_id: user!.id,
        rating: 0,
        review_count: 0,
        is_active: true,
      })
      .select()
      .single()

    if (venueError) return errorResponse(venueError.message, 500)

    // Always ensure at least one facility exists so venue is immediately bookable.
    const requestedFacilities = facilities as Array<{
      name?: string
      type?: string
      description?: string
      capacity?: number
      price?: number
    }>

    const fallbackSport = String(sports[0] ?? "football")
    const facilityRows =
      requestedFacilities.length > 0
        ? requestedFacilities.map((f, index) => ({
            venue_id: venue.id,
            name: f.name?.trim() || `${fallbackSport.charAt(0).toUpperCase() + fallbackSport.slice(1)} Facility ${index + 1}`,
            type: f.type || fallbackSport,
            description: f.description?.trim() || null,
            capacity: Number(f.capacity ?? 10),
            price: Number(f.price ?? Number(price)),
            available: true,
          }))
        : [
            {
              venue_id: venue.id,
              name: `${fallbackSport.charAt(0).toUpperCase() + fallbackSport.slice(1)} Main Facility`,
              type: fallbackSport,
              description: null,
              capacity: 10,
              price: Number(price),
              available: true,
            },
          ]

    const { error: facilityInsertError } = await supabase.from("facilities").insert(facilityRows)
    if (facilityInsertError) return errorResponse(facilityInsertError.message, 500)

    return successResponse(venue, 201)
  } catch {
    return errorResponse("Internal server error", 500)
  }
}
