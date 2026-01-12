import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

export async function getChurchId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return (session?.user?.churchId as string) || null;
}

export async function getUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return (session?.user?.id as string) || null;
}

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session.user;
}

export async function requireChurchAccess() {
  const user = await requireAuth();
  if (!user.churchId) {
    throw new Error("No church access");
  }
  return { user, churchId: user.churchId as string };
}
