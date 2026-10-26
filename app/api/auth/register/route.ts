import { type NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { successResponse, errorResponse } from "@/lib/api-helpers"
import { registerSchema } from "@/lib/validations/auth"

/**
 * POST /api/auth/register
 * Body: { email, password, fullName, phone?, role? }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message, 400)
    }

    const { email, password, fullName, phone, role } = parsed.data

    const supabase = createClient()

    // Sign the user up — Supabase will send a confirmation email
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
      },
    })

    if (authError) {
      // Friendly duplicate-email message
      if (authError.message.includes("already registered")) {
        return errorResponse("An account with this email already exists.", 409)
      }
      return errorResponse(authError.message, 400)
    }

    if (!authData.user) {
      return errorResponse("Registration failed. Please try again.", 500)
    }

    // Use admin client to: 1) auto-confirm email so login works immediately,
    // 2) update profile with phone/role
    const admin = createAdminClient()

    // Auto-confirm the user's email (skips the Supabase confirmation step)
    await admin.auth.admin.updateUserById(authData.user.id, { email_confirm: true })

    if (phone) {
      await (admin.from("profiles") as any).update({ phone, role }).eq("id", authData.user.id)
    }

    return successResponse(
      {
        user: {
          id: authData.user.id,
          email: authData.user.email,
          fullName,
          role,
        },
        session: authData.session,
        message: "Account created. You can now log in.",
      },
      201,
    )
  } catch {
    return errorResponse("Internal server error", 500)
  }
}
