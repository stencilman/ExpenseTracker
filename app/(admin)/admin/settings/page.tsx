import { currentRole } from "@/lib/auth";
import React from "react";

const AdminSettingsPage = async () => {
  const role = await currentRole();
  return (
    <div>
      <h1>Admin Settings Page</h1>
      <p>Role: {role}</p>
    </div>
  );
};
export default AdminSettingsPage;
