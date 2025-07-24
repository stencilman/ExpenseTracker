
import { RegisterForm } from "@/components/auth/register-form";
import React from "react";

const RegisterPage = () => {
  return (  
    <div className="w-full min-h-[calc(100vh-64px)] flex justify-center items-center my-[50px] md:my-0">
      <RegisterForm />
    </div>
  );
};
export default RegisterPage;

