import { OrganizationProfile } from '../../models/organization.model';

export interface OrganizationState {
  profile: OrganizationProfile | null;
  loading: boolean;
  error: string | null;
}

export const initialState: OrganizationState = {
  profile: null,
  loading: false,
  error: null
}; 