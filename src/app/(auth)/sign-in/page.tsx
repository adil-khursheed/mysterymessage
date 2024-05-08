"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export default function Page() {
  const { data: session } = useSession();

  if (session) {
    return (
      <>
        <p>Signed in as {session.user.name}</p>
        <button onClick={() => signOut()}>Sign Out</button>
      </>
    );
  }

  return (
    <>
      Not signed in <br />
      <button onClick={() => signIn()}>Sign In</button>
    </>
  );
}
