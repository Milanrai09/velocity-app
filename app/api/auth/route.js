import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { syncAuth0User } from "@/lib/user-sync";

export async function GET() {
  try {
    const session = await auth0.getSession();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await syncAuth0User(session.user);

    return NextResponse.json(
      {
        ok: true,
        user,
        message: "User synced successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ User Sync Error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
