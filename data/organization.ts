import { db } from "@/lib/db";

/**
 * Get the organization data
 * @returns The organization data or null if not found
 */
export const getOrganization = async () => {
  try {
    // Get the first organization (there should only be one)
    const organization = await db.organization.findFirst();
    return organization;
  } catch (error) {
    console.error("Error getting organization:", error);
    return null;
  }
};

/**
 * Create a default organization if none exists
 * @returns The created organization or null if failed
 */
export const createDefaultOrganization = async () => {
  try {
    // Check if an organization already exists
    const existing = await getOrganization();
    if (existing) return existing;

    // Create a default organization
    const organization = await db.organization.create({
      data: {
        name: "My Organization",
        legalName: "My Organization Legal Name",
        email: "contact@myorganization.com",
        phone: "123-456-7890",
        website: "https://myorganization.com",
        address: "123 Main Street",
        city: "Anytown",
        state: "State",
        postalCode: "12345",
        country: "Country",
      },
    });
    return organization;
  } catch (error) {
    console.error("Error creating default organization:", error);
    return null;
  }
};

/**
 * Update the organization data
 * @param data The organization data to update
 * @returns The updated organization or null if failed
 */
export const updateOrganization = async (data: {
  name?: string;
  legalName?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}) => {
  try {
    console.log("Updating organization with data:", data);

    // Get the organization
    let organization = await getOrganization();
    console.log("Current organization:", organization);

    // If no organization exists, create a default one
    if (!organization) {
      console.log("No organization found, creating default");
      organization = await createDefaultOrganization();
      if (!organization) throw new Error("Failed to create default organization");
    }

    // Filter out undefined values and empty strings for optional fields
    const filteredData: Record<string, any> = {};

    // Process each field individually to handle empty strings properly
    if (data.name !== undefined) filteredData.name = data.name || null;
    if (data.legalName !== undefined) filteredData.legalName = data.legalName || null;
    if (data.email !== undefined) filteredData.email = data.email || null;
    if (data.phone !== undefined) filteredData.phone = data.phone || null;
    if (data.website !== undefined) filteredData.website = data.website || null;
    if (data.address !== undefined) filteredData.address = data.address || null;
    if (data.city !== undefined) filteredData.city = data.city || null;
    if (data.state !== undefined) filteredData.state = data.state || null;
    if (data.postalCode !== undefined) filteredData.postalCode = data.postalCode || null;
    if (data.country !== undefined) filteredData.country = data.country || null;

    console.log("Filtered data for update:", filteredData);
    console.log("Organization ID for update:", organization.id);

    // Update the organization
    const updated = await db.organization.update({
      where: {
        id: organization.id,
      },
      data: filteredData,
    });

    console.log("Organization updated successfully:", updated);
    return updated;
  } catch (error) {
    console.error("Error updating organization:", error);
    return null;
  }
};
