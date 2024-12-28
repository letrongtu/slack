"use client";

import { useState } from "react";
import { SignInFlow } from "../types";
import SignInCard from "./sign-in-card";
import SignUpCard from "./sign-up-card";
import AuthHeader from "./auth-header";

const AuthScreen = () => {
  const [state, setState] =
    useState<SignInFlow>("signIn");

  return (
    <div className="h-full flex flex-col items-center bg-[#fff]">
      <AuthHeader
        state={state}
        setState={setState}
      />
      <div className="md:h-auto md:w-[650px]">
        {state === "signIn" ? (
          <SignInCard />
        ) : (
          <SignUpCard setState={setState} />
        )}
      </div>
    </div>
  );
};

export default AuthScreen;
