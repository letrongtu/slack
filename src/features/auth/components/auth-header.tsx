"use client";
import { SignInFlow } from "../types";
import Image from "next/image";

interface HeaderCardProps {
  state: SignInFlow;
  setState: (state: SignInFlow) => void;
}

const AuthHeader = ({
  state,
  setState,
}: HeaderCardProps) => {
  return (
    <div className="w-full grid grid-cols-3 items-center py-8">
      <div className="left"></div>
      <div className="center flex justify-center items-center">
        <Image
          src="/logo/slack-logo.png"
          alt="Slack logo"
          width={100}
          height={100}
          className="h-auto"
          priority
        />
      </div>
      <div className="right text-right pr-8">
        {state === "signIn" && (
          <div className="text-xs text-muted-foreground">
            <p>New to Slack? </p>
            <p
              onClick={() => setState("signUp")}
              className="text-xs font-semibold text-sky-700 hover:underline cursor-pointer"
            >
              Create an account
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthHeader;
