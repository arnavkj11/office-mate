import { fetchAuthSession } from "aws-amplify/auth";

export async function isSignedIn() {
  try {
    const { tokens } = await fetchAuthSession();
    return !!tokens?.accessToken;
  } catch {
    return false;
  }
}
