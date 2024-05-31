"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { signInSchema } from "@/schemas/signInSchema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { signIn } from "next-auth/react";

const SignInForm = () => {
  const [isSigningIn, setIsSigningIn] = useState(false);

  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    setIsSigningIn(true);

    const result = await signIn("credentials", {
      redirect: false,
      identifier: data.identifier,
      password: data.password,
    });

    console.log(result);

    if (result?.error) {
      if (result.error === "CredentialsSignin") {
        toast({
          title: "Login Failed",
          description: "Incorrect credentials",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    }

    if (result?.url) {
      router.replace("/dashboard");
    }

    setIsSigningIn(false);
  };
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-800">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Welcome Back To True Feedback
          </h1>
          <p className="mb-4">Sign in to continue your secret conversations</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="identifier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email/Username</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSigningIn}>
              {isSigningIn ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing In
                </>
              ) : (
                <>Sign In</>
              )}
            </Button>
          </form>
        </Form>

        <div className="text-center mt-4">
          <p>
            Not a member yet?{" "}
            <Link href="/sign-up" className="text-blue-600 hover:text-blue-800">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignInForm;
