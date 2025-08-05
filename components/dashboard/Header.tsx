"use client";

import { Building } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface UserProfile {
  firstName: string;
  lastName: string;
  company: string;
}

export default function Header() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/user/profile");
        
        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }
        
        const data = await response.json();
        setProfile(data.data);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, []);

  return (
    <div className="flex items-center w-full">
      <div className="flex items-center gap-4">
        <div className="p-3 border rounded-md">
          <Building />
        </div>
        <div>
          {loading ? (
            <div className="animate-pulse">
              <div className="h-5 w-32 bg-gray-200 rounded mb-1"></div>
              <div className="h-3 w-24 bg-gray-200 rounded"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-sm">Error loading profile</div>
          ) : (
            <>
              <div className="font-medium text-lg">
                Hello, {profile?.firstName || "User"}
              </div>
              <div className="text-xs text-muted-foreground">
                {profile?.company || ""}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
