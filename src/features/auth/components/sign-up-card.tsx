import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { TriangleAlert } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { SignInFlow } from "../types";

import { useAuthActions } from "@convex-dev/auth/react";

interface SignUpCardProps {
  setState: (state: SignInFlow) => void;
}

const SignUpCard = ({
  setState,
}: SignUpCardProps) => {
  const { signIn } = useAuthActions();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const onPasswordSignUp = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setPending(true);
    signIn("password", {
      email,
      password,
      flow: "signUp",
    })
      .catch(() => {
        setError("Something went wrong");
      })
      .finally(() => {
        setPending(false);
      });
  };

  const handlerProviderSignUp = (
    value: "github" | "google"
  ) => {
    setPending(true);
    signIn(value).finally(() => {
      setPending(true);
    });
  };
  return (
    <Card className="w-full h-full p-1 border-none shadow-none">
      <CardHeader className="px-0 pt-0 text-center">
        <CardTitle className="text-5xl font-semibold">
          First of all, enter your email address
        </CardTitle>
        <CardDescription className="p-4 text-lg text-muted-foreground">
          <p>
            We suggest using the{" "}
            <span className="font-semibold">
              email address that you use at work.
            </span>
          </p>
        </CardDescription>
      </CardHeader>
      {!!error && (
        <div className="h-[50px] bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive mb-6 mx-36">
          <TriangleAlert className="size-4" />
          <p>{error}</p>
        </div>
      )}
      <CardContent className="space-y-5 px-24 pb-0">
        <form
          onSubmit={onPasswordSignUp}
          className="space-y-5 mx-12"
        >
          <Input
            className="w-full h-[50px] rounded-md"
            disabled={pending}
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            placeholder="name@work-email.com"
            type="email"
            required
          />

          <Input
            className="w-full h-[50px] rounded-md"
            disabled={pending}
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            placeholder="Password"
            type="password"
            required
          />

          <Input
            className="w-full h-[50px] rounded-md"
            disabled={pending}
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(e.target.value)
            }
            placeholder="Confirm Password"
            type="password"
            required
          />

          <Button
            type="submit"
            className="w-full h-[50px] bg-[#4a154b] hover:bg-[#4a154baf]"
            size="lg"
            disabled={pending}
          >
            Continue
          </Button>
        </form>

        <div className="separator flex justify-center items-center gap-x-3">
          <Separator className="w-[34%]" />
          <p className="font-semibold">OR</p>
          <Separator className="w-[34%]" />
        </div>

        <div className="flex flex-col gap-y-2.5 items-center mx-12">
          <Button
            disabled={pending}
            onClick={() =>
              handlerProviderSignUp("google")
            }
            variant="outline"
            size="slack"
            className="w-full h-[50px] relative"
          >
            <FcGoogle />
            Sign in with Google
          </Button>

          <Button
            disabled={pending}
            onClick={() =>
              handlerProviderSignUp("github")
            }
            variant="outline"
            size="slack"
            className="w-full h-[50px] relative"
          >
            <FaGithub />
            Sign in with GitHub
          </Button>

          <div className="flex flex-col items-center gap-y-1 my-3 text-[0.9rem] text-muted-foreground">
            <p>Already using Slack?</p>
            <p
              onClick={() => setState("signIn")}
              className="text-sky-700 hover:underline cursor-pointer"
            >
              Sign in to an existing workspace
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SignUpCard;
