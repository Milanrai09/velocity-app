import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { prisma } from "@/lib/prisma";

function formatProfile(dbUser, sessionUser) {
  return {
    fullName: sessionUser?.name || dbUser?.displayName || "",
    email: dbUser?.email || sessionUser?.email || "",
    displayName: dbUser?.displayName || "",
    bio: dbUser?.bio || "",
    website: dbUser?.website || "",
  };
}

async function getAuthorizedUser() {
  const session = await auth0.getSession();

  if (!session?.user?.sub) {
    return { error: "Unauthorized", status: 401 };
  }

  if (!session.user.email) {
    return { error: "Authenticated user email missing", status: 400 };
  }

  return { sessionUser: session.user };
}

export async function GET() {
  try {
    const auth = await getAuthorizedUser();

    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { sessionUser } = auth;

    const dbUser = await prisma.user.upsert({
      where: { id: sessionUser.sub },
      update: {
        email: sessionUser.email,
        avatarUrl: sessionUser.picture || null,
      },
      create: {
        id: sessionUser.sub,
        email: sessionUser.email,
        displayName: sessionUser.nickname || sessionUser.name || null,
        avatarUrl: sessionUser.picture || null,
      },
    });

    return NextResponse.json(
      {
        ok: true,
        profile: formatProfile(dbUser, sessionUser),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Settings GET Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile settings" },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const auth = await getAuthorizedUser();

    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { sessionUser } = auth;
    const body = await request.json();
    const updates = {};

    if (Object.prototype.hasOwnProperty.call(body, "displayName")) {
      updates.displayName = String(body.displayName || "").trim() || null;
    }

    if (Object.prototype.hasOwnProperty.call(body, "bio")) {
      updates.bio = String(body.bio || "").trim() || null;
    }

    if (Object.prototype.hasOwnProperty.call(body, "website")) {
      updates.website = String(body.website || "").trim() || null;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No editable fields provided" },
        { status: 400 }
      );
    }

    const dbUser = await prisma.user.upsert({
      where: { id: sessionUser.sub },
      update: {
        ...updates,
        email: sessionUser.email,
        avatarUrl: sessionUser.picture || null,
      },
      create: {
        id: sessionUser.sub,
        email: sessionUser.email,
        displayName:
          updates.displayName ??
          sessionUser.nickname ??
          sessionUser.name ??
          null,
        bio: updates.bio ?? null,
        website: updates.website ?? null,
        avatarUrl: sessionUser.picture || null,
      },
    });

    return NextResponse.json(
      {
        ok: true,
        profile: formatProfile(dbUser, sessionUser),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Settings PATCH Error:", error);
    return NextResponse.json(
      { error: "Failed to update profile settings" },
      { status: 500 }
    );
  }
}
