import { Auth0Client } from '@auth0/nextjs-auth0/server';
import { NextResponse } from "next/server";

export const auth0 = new Auth0Client({
  appBaseUrl: process.env.APP_BASE_URL || process.env.AUTH_BASE_URL,
  onCallback: async (error, ctx, session) => {
    if (error) {
      return new NextResponse(error.message, { status: 500 });
    }

    if (session?.user) {
      try {
        const { syncAuth0User } = await import("@/lib/user-sync");
        await syncAuth0User(session.user);
      } catch (syncError) {
        console.error("Failed to sync user on auth callback:", syncError);
        return new NextResponse("Failed to provision user", { status: 500 });
      }
    }

    const returnTo = ctx?.returnTo || "/";
    return NextResponse.redirect(new URL(returnTo, process.env.APP_BASE_URL || process.env.AUTH_BASE_URL));
  },
});














