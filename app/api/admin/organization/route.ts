import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/auth";
import { z } from "zod";
import { createDefaultOrganization, getOrganization, updateOrganization } from "@/data/organization";

// Organization update schema
const organizationUpdateSchema = z.object({
    name: z.string().optional(),
    legalName: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    website: z.string().url().optional().or(z.literal('')),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
    taxId: z.string().optional().or(z.literal('')),
    fiscalYearStart: z.string().optional().or(z.literal('')),
    fiscalYearEnd: z.string().optional().or(z.literal('')),
    currency: z.string().optional().or(z.literal('')),
    primaryColor: z.string().optional().or(z.literal('')),
});

// GET /api/admin/organization
export async function GET() {
    try {
        // Check if user is authenticated and is an admin
        const isUserAdmin = await isAdmin();
        if (!isUserAdmin) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Get organization settings
        let organization = await getOrganization();

        // If no organization exists, create a default one
        if (!organization) {
            organization = await createDefaultOrganization();
        }

        return NextResponse.json({ data: organization });
    } catch (error) {
        console.error("Error fetching organization:", error);
        return NextResponse.json(
            { error: "Failed to fetch organization settings" },
            { status: 500 }
        );
    }
}

// PATCH /api/admin/organization
export async function PATCH(request: Request) {
    try {
        // Check if user is authenticated and is an admin
        const isUserAdmin = await isAdmin();
        if (!isUserAdmin) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Parse and validate request body
        const body = await request.json();
        console.log("Received organization update request:", body);
        
        const validationResult = organizationUpdateSchema.safeParse(body);

        if (!validationResult.success) {
            console.error("Validation error:", validationResult.error.format());
            return NextResponse.json(
                { error: "Invalid request data", details: validationResult.error.format() },
                { status: 400 }
            );
        }

        console.log("Validated data:", validationResult.data);

        // Update organization settings
        const organization = await updateOrganization(validationResult.data);
        
        if (!organization) {
            console.error("Failed to update organization - null result returned");
            return NextResponse.json(
                { error: "Failed to update organization settings" },
                { status: 500 }
            );
        }

        console.log("Organization updated successfully:", organization);
        return NextResponse.json({ data: organization });
    } catch (error) {
        console.error("Error updating organization:", error);
        return NextResponse.json(
            { error: "Failed to update organization settings" },
            { status: 500 }
        );
    }
}
