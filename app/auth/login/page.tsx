import { LoginForm } from "@/components/auth/login-form";
import React from "react";

const LoginPage = () => {
  return (
    <div className="w-full min-h-[calc(100vh-64px)] flex justify-center items-center my-[50px] md:my-0">
      <LoginForm />
    </div>
  );
};

export default LoginPage;
