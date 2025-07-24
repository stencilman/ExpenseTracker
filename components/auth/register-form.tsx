"use client";

// Import necessary libraries and components
import { CardWrapper } from "@/components/auth/card-wrapper"; // Wrapper component for card layout
import { Eye, EyeOff } from "lucide-react"; // Icons for showing/hiding password
import { zodResolver } from "@hookform/resolvers/zod"; // Resolver to integrate Zod with React Hook Form
import { useForm } from "react-hook-form"; // Hook for form state management
import { z } from "zod"; // Schema validation library
import { Button } from "@/components/ui/button"; // Custom Button component
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"; // Custom form components
import { Input } from "@/components/ui/input"; // Custom Input component

import { useState, useTransition } from "react"; // React hooks for state and transitions
import Link from "next/link"; // Next.js Link component for client-side navigation
import { useRouter } from "next/navigation"; // Hook to access Next.js router

import { Suspense } from "react"; // React Suspense for asynchronous rendering
import { FormError } from "@/components/form-error"; // Component to display form errors
import { FormSuccess } from "@/components/form-success"; // Component to display success messages
import { toast } from "sonner"; // Toast notification library

import { register } from "@/actions/register";
import { RegisterSchema } from "@/schemas";




// Registration Form Component
export const RegisterForm = () => {
  const router = useRouter(); // Initialize Next.js router
  const [isPending, startTransition] = useTransition(); // Manage transition state
  const [error, setError] = useState<string | undefined>(""); // State for error messages
  const [success, setSuccess] = useState<string | undefined>(""); // State for success messages
  const [showPassword, setShowPassword] = useState<boolean>(false); // Toggle for password visibility
  const [showReEnterPassword, setShowReEnterPassword] =
    useState<boolean>(false); // Toggle for re-enter password visibility

  // Initialize the form with React Hook Form and Zod resolver
  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      email: "",
      password: "",
      reEnterPassword: "",
      firstName: "",
      lastName: "",
    },
  });

  // Handle form submission
  const onSubmit = (data: z.infer<typeof RegisterSchema>) => {
    setSuccess(""); // Reset success message
    setError(""); // Reset error message

    startTransition(async () => {
    
      register(data).then((result: any) => {
        setError(result.error);
        setSuccess(result.success);
        console.log(result);
      });

      // try {
      //   // Validate form data using Zod
      //   const validateFields = RegisterSchema.safeParse(data);

      //   if (!validateFields.success) {
      //     throw new Error("Invalid fields"); // Throw error if validation fails
      //   }

      //   const { email, password, reEnterPassword, firstName, lastName } =
      //     validateFields.data;

      //   // Send data to the API
      //   const response = await fetch(
      //     `${process.env.NEXT_PUBLIC_API_URL}/api/users/`,
      //     {
      //       method: "POST",
      //       headers: {
      //         "Content-Type": "application/json",
      //       },
      //       body: JSON.stringify({
      //         first_name: firstName,
      //         last_name: lastName,
      //         email: email,
      //         password: password,
      //         re_password: reEnterPassword,
      //       }),
      //     }
      //   );

      //   if (!response.ok) {
      //     const errorData = await response.json();
      //     setError(errorData); // Set error state with response data

      //     throw new Error(
      //       errorData?.error ||
      //         (Array.isArray(errorData?.email)
      //           ? errorData?.email[0]
      //           : errorData?.email) ||
      //         (Array.isArray(errorData?.password)
      //           ? errorData?.password[0]
      //           : errorData?.password) ||
      //         (Array.isArray(errorData?.re_password)
      //           ? errorData?.re_password[0]
      //           : errorData?.re_password) ||
      //         "Failed to create an account"
      //     );
      //   }

      //   const resp = await response.json();

      //   if (resp) {
      //     router.push(`/`); // Redirect to home page upon successful registration
      //     toast.success("Account created successfully!"); // Show success toast
      //   }
      // } catch (err) {
      //   // Handle unexpected errors
      //   setError(
      //     err instanceof Error ? err.message : "An unexpected error occurred"
      //   );
      // }
    });
  };

  return (
    <Suspense>
      <CardWrapper
        headerLabel="Create an account" // Header label for the card
        backButtonHref="/auth/login" // Link for the back button
        backButtonLabel="Already have an account?" // Label for the back button
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-6">
              {/* First Name Field */}
              <FormField
                name="firstName"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name*</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="First Name"
                        disabled={isPending} // Disable input during submission
                        className="h-11"
                      />
                    </FormControl>
                    <FormMessage /> {/* Display validation message */}
                  </FormItem>
                )}
              />

              {/* Last Name Field */}
              <FormField
                name="lastName"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name*</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Last Name"
                        disabled={isPending} // Disable input during submission
                        className="h-11"
                      />
                    </FormControl>
                    <FormMessage /> {/* Display validation message */}
                  </FormItem>
                )}
              />

              {/* Email Field */}
              <FormField
                name="email"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email*</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Email"
                        type="email"
                        disabled={isPending} // Disable input during submission
                        className="h-11"
                      />
                    </FormControl>
                    <FormMessage /> {/* Display validation message */}
                  </FormItem>
                )}
              />

              {/* Password and Confirm Password Fields */}
              <div className="flex flex-col md:flex-row gap-4 w-full">
                {/* Password Field */}
                <FormField
                  name="password"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="w-full md:w-[50%]">
                      <FormLabel>Password*</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            placeholder="Password"
                            type={showPassword ? "text" : "password"} // Toggle password visibility
                            disabled={isPending} // Disable input during submission
                            className="pr-[30px] h-11"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)} // Toggle show/hide password
                            className="absolute top-[15px] right-[13px]"
                            aria-label={
                              showPassword ? "Hide password" : "Show password"
                            }
                          >
                            {showPassword ? <EyeOff /> : <Eye />}{" "}
                            {/* Icon changes based on state */}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage /> {/* Display validation message */}
                    </FormItem>
                  )}
                />

                {/* Confirm Password Field */}
                <FormField
                  name="reEnterPassword"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="w-full md:w-[50%]">
                      <FormLabel>Confirm Password*</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            placeholder="Confirm Password"
                            type={showReEnterPassword ? "text" : "password"} // Toggle password visibility
                            disabled={isPending} // Disable input during submission
                            className="pr-[30px] h-11"
                          />
                          <button
                            type="button"
                            onClick={
                              () => setShowReEnterPassword(!showReEnterPassword) // Toggle show/hide password
                            }
                            className="absolute top-[15px] right-[13px]"
                            aria-label={
                              showReEnterPassword
                                ? "Hide password"
                                : "Show password"
                            }
                          >
                            {showReEnterPassword ? <EyeOff /> : <Eye />}{" "}
                            {/* Icon changes based on state */}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage /> {/* Display validation message */}
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Display success message if any */}
            {success && <FormSuccess message={success} />}
            {/* Display error message if any */}
            {error && <FormError message={error} />}

            <div className="flex justify-between items-center w-full gap-y-4 flex-wrap">
              {/* Link to login page */}
              <Button className="px-0 md:px-4 gap-1" asChild variant="link">
                <Link
                  className={`text-sm font-normal text-black ${
                    isPending ? "pointer-events-none" : ""
                  }`}
                  href="/"
                >
                  Already have an account?
                  <span className="font-semibold hidden sm:block">Login</span>
                </Link>
              </Button>

              {/* Submit button for registration */}
              <Button
                disabled={isPending} // Disable button during submission
                className=""
                size="default"
                type="submit"
                variant="default"
              >
                {isPending ? "Submitting..." : "Next"}{" "}
                {/* Button label changes based on state */}
              </Button>
            </div>
          </form>
        </Form>
      </CardWrapper>
    </Suspense>
  );
};
