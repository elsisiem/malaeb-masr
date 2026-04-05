import { type NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getAuthUserWithProfile, successResponse, errorResponse, getPagination } from "@/lib/api-helpers"
import { createVenueSchema, venueFilterSchema } from "@/lib/validations/venue"

/**
 * GET /api/venues
 * Query params: sport, district, minPrice, maxPrice, maxDistance, amenities, search, page, pageSize
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const params = Object.fromEntries(searchParams.entries())
    const parsed = venueFilterSchema.safeParse(params)

    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message, 400)
    }

    const { sport, district, minPrice, maxPrice, amenities, search, page, pageSize } = parsed.data
    const { from, to } = getPagination(page, pageSize)

    const supabase = createClient()
    let query = supabase
      .from("venues")
      .select(
        `
        id, name, description, location, district, lat, lng,
        rating, review_count, amenities, images, sports, is_active,
        facilities(id, name, type, price, available)
      `,
        { count: "exact" },
      )
      .eq("is_active", true)
      .range(from, to)

    if (sport) query = query.contains("sports", [sport])
    if (district) query = query.ilike("district", `%${district}%`)
    if (search) query = query.or(`name.ilike.%${search}%,location.ilike.%${search}%,district.ilike.%${search}%`)
    if (amenities) {
      const amenityList = amenities.split(",").map((a) => a.trim())
      query = query.contains("amenities", amenityList)
    }

    // Price filter against minimum facility price
    // Handled post-fetch since it requires facility join

    const { data, error, count } = await query.order("rating", { ascending: false })

    if (error) return errorResponse(error.message, 500)

    // Filter by price range on the JS side (based on cheapest facility)
    let venues = (data ?? []).map((venue) => {
      const facilityList = ((venue as unknown as { facilities?: Array<{ price: number }> }).facilities ?? [])
      const derivedPrice = facilityList.length > 0 ? Math.min(...facilityList.map((facility) => facility.price)) : 0
      return {
        ...(venue as Record<string, unknown>),
        facilities: facilityList,
        price: derivedPrice,
      }
    })
    if (minPrice !== undefined || maxPrice !== undefined) {
      venues = venues.filter((v) => {
        const prices = ((v as { facilities?: Array<{ price: number }> }).facilities ?? []).map((f) => f.price)
        if (prices.length === 0) return true
        const minFacilityPrice = Math.min(...prices)
        if (minPrice !== undefined && minFacilityPrice < minPrice) return false
        if (maxPrice !== undefined && minFacilityPrice > maxPrice) return false
        return true
      })
    }

    return successResponse({
      venues,
      pagination: {
        page,
        pageSize,
        total: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / pageSize),
      },
    })
  } catch {
    return errorResponse("Internal server error", 500)
  }
}

/**
 * POST /api/venues
 * Creates a new venue. Requires owner role.
 */
export async function POST(request: NextRequest) {
  try {
    const { user, profile, error: authError } = await getAuthUserWithProfile(["owner", "admin"])
    if (authError) return errorResponse(authError, authError === "Unauthorized" ? 401 : 403)

    const body = await request.json()
    const parsed = createVenueSchema.safeParse(body)
    if (!parsed.success) return errorResponse(parsed.error.errors[0].message, 400)

    const supabase = createClient()
    const { data, error } = await supabase
      .from("venues")
      .insert({
        owner_id: user!.id,
        name: parsed.data.name,
        description: parsed.data.description ?? null,
        location: parsed.data.location,
        district: parsed.data.district,
        lat: parsed.data.lat ?? null,
        lng: parsed.data.lng ?? null,
        amenities: parsed.data.amenities,
        sports: parsed.data.sports,
      })
      .select()
      .single()

    if (error) return errorResponse(error.message, 500)

    return successResponse(data, 201)
  } catch {
    return errorResponse("Internal server error", 500)
  }
}
