getLogoUrl(organization: Organization): string {
  // Check if the organization has a logo, otherwise return default
  if (organization && organization.logoUrl) {
    return organization.logoUrl;
  }
  return 'assets/images/organization-placeholder.png';
} 