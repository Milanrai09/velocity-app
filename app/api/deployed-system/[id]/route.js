import { auth0 } from "@/lib/auth0";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const session = await auth0.getSession();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { sub } = session.user;
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Deployment ID missing" },
        { status: 400 }
      );
    }

    const deployment = await prisma.deployment.findFirst({
      where: {
        id,
        userId: sub // 🔐 critical security check
      }
    });

    if (!deployment) {
      return NextResponse.json(
        { error: "Deployment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { ok: true, deployment },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Fetch Deployment Error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
