import { type NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getAuthUserWithProfile, successResponse, errorResponse } from "@/lib/api-helpers"
import { updateVenueSchema } from "@/lib/validations/venue"

/**
 * GET /api/venues/[id]
 * Returns full venue details including facilities and recent reviews.
 */
export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("venues")
      .select(
        `
        *,
        facilities(*),
        reviews(
          id, rating, comment, created_at,
          profiles(id, full_name, avatar_url)
        ),
        profiles!venues_owner_id_fkey(id, full_name, avatar_url)
      `,
      )
      .eq("id", params.id)
      .eq("is_active", true)
      .single()

    if (error || !data) return errorResponse("Venue not found", 404)

    // Check if the current user has favorited this venue
    const {
      data: { user },
    } = await supabase.auth.getUser()
    let isFavorited = false
    if (user) {
      const { data: fav } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("venue_id", params.id)
        .single()
      isFavorited = !!fav
    }

    const venueData = data as unknown as Record<string, unknown> & {
      facilities?: Array<Record<string, unknown>>
      price?: number
    }

    const normalizedFacilities = (venueData.facilities ?? []).map((facility) => ({
      ...facility,
      is_available: (facility as { available?: boolean }).available ?? true,
      image: (facility as { image?: string | null }).image ?? "",
    }))

    return successResponse({
      ...venueData,
      price_per_hour: venueData.price ?? 0,
      facilities: normalizedFacilities,
      isFavorited,
    })
  } catch {
    return errorResponse("Internal server error", 500)
  }
}

/**
 * PUT /api/venues/[id]
 * Update a venue. Owner only.
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, error: authError } = await getAuthUserWithProfile(["owner", "admin"])
    if (authError) return errorResponse(authError, authError === "Unauthorized" ? 401 : 403)

    const body = await request.json()
    const parsed = updateVenueSchema.safeParse(body)
    if (!parsed.success) return errorResponse(parsed.error.errors[0].message, 400)

    const supabase = createClient()

    // Verify ownership
    const { data: venue } = await supabase.from("venues").select("owner_id").eq("id", params.id).single()
    if (!venue || venue.owner_id !== user!.id) return errorResponse("Forbidden", 403)

    const { data, error } = await supabase
      .from("venues")
      .update({ ...parsed.data, updated_at: new Date().toISOString() })
      .eq("id", params.id)
      .select()
      .single()

    if (error) return errorResponse(error.message, 500)

    return successResponse(data)
  } catch {
    return errorResponse("Internal server error", 500)
  }
}

/**
 * DELETE /api/venues/[id]
 * Soft-delete a venue (set is_active = false). Owner only.
 */
export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, error: authError } = await getAuthUserWithProfile(["owner", "admin"])
    if (authError) return errorResponse(authError, authError === "Unauthorized" ? 401 : 403)

    const supabase = createClient()

    const { data: venue } = await supabase.from("venues").select("owner_id").eq("id", params.id).single()
    if (!venue || venue.owner_id !== user!.id) return errorResponse("Forbidden", 403)

    const { error } = await supabase
      .from("venues")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", params.id)

    if (error) return errorResponse(error.message, 500)

    return successResponse({ message: "Venue deactivated successfully." })
  } catch {
    return errorResponse("Internal server error", 500)
  }
}
