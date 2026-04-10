import { auth0 } from "@/lib/auth0";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth0.getSession();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { sub } = session.user;

    if (!sub) {
      return NextResponse.json(
        { error: "Auth0 user id missing" },
        { status: 400 }
      );
    }

    // Fetch user + deployments
    const user = await prisma.user.findUnique({
      where: { id: sub },
      include: {
        deployments: {
          orderBy: {
            createdAt: "desc"
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found in DB" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        deployments: user.deployments
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Fetch Deployments Error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
