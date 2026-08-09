"use client";

import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { useRouter } from "next/navigation";

import { getApiErrorMessage } from "@/lib/apiError";
import { env } from "@/lib/env";
import { toast } from "@/lib/toast";
import { useGoogleLoginMutation } from "@/store/api/authApi";

export function GoogleSignInButton({ redirectTo = "/" }: { redirectTo?: string }) {
  const [googleLogin] = useGoogleLoginMutation();
  const router = useRouter();

  if (!env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
    // Flagged in NOTES.md — no Google OAuth client id has been provisioned yet, so the button
    // is intentionally hidden rather than rendered broken.
    return null;
  }

  return (
    <GoogleOAuthProvider clientId={env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
      <GoogleLogin
        onSuccess={async (credentialResponse) => {
          if (!credentialResponse.credential) return;
          try {
            await googleLogin({ idToken: credentialResponse.credential }).unwrap();
            router.push(redirectTo);
          } catch (error) {
            toast.error(getApiErrorMessage(error as FetchBaseQueryError | SerializedError));
          }
        }}
        onError={() => toast.error("Google sign-in failed. Please try again.")}
        text="continue_with"
        width="100%"
      />
    </GoogleOAuthProvider>
  );
}
