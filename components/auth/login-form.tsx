"use client";
import { CardWrapper } from "@/components/auth/card-wrapper";

import { Suspense } from "react";

import { Eye, EyeOff } from "lucide-react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";

import { useState, useTransition } from "react";
import Link from "next/link";

import { useRouter, useSearchParams } from "next/navigation";
import { LoginSchema } from "@/schemas";
import { login } from "@/actions/login";

export const LoginForm = () => {
  const searchParams = useSearchParams();

  const urlError =
    searchParams.get("error") === "OAuthAccountNotLinked"
      ? "Email already in use"
      : "";

  const router = useRouter();
  const [transition, startTransition] = useTransition();

  const [error, setError] = useState<string | undefined>(urlError || "");
  const [success, setSuccess] = useState<string | undefined>("");
  const [showPassword, setShowPassword] = useState<boolean | undefined>();

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: z.infer<typeof LoginSchema>) => {
    setSuccess("");
    setError("");

    console.log("login Clicked");
    startTransition(async () => {
      const result = await login(data);

      // If we get here, it means there was no redirect
      // which indicates an authentication error
      if (result?.error) {
        setError(result.error);
      }

      if (result?.success) {
        setSuccess(result.success);
      }
    });
  };

  return (
    <Suspense>
      <CardWrapper
        headerLabel="Welcome to Expense Tracker"
        // backButtonHref="/auth/register"
        // backButtonLabel="Don't have an account?"
        showSocial={true}
      >
        {/* <CompanyLoginForm /> */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-6">
              <FormField
                name="email"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        className="h-11"
                        {...field}
                        placeholder="test@mail.com"
                        type="email"
                        disabled={transition}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              ></FormField>

              <FormField
                name="password"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          placeholder="******"
                          disabled={transition}
                          type={showPassword ? "text" : "password"}
                          className="pr-[30px] h-11"
                        />
                        <Eye
                          onClick={() => {
                            setShowPassword(true);
                          }}
                          className="cursor-pointer absolute top-[14px] right-[13px] w-4 h-4"
                        />

                        {showPassword && (
                          <EyeOff
                            onClick={() => {
                              setShowPassword(false);
                            }}
                            className="cursor-pointer absolute top-[14px] right-[13px] w-4 h-4"
                          />
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              ></FormField>
            </div>

            {success && <FormSuccess message={success} />}

            {error && <FormError message={error || urlError} />}

            <div className=" w-full gap-y-4 flex-wrap">
              <Button
                disabled={transition}
                className="w-full"
                size="default"
                type="submit"
              >
                Login
              </Button>
            </div>
          </form>
        </Form>
      </CardWrapper>
    </Suspense>
  );
};
