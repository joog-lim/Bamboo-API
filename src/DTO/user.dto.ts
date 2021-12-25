export type IdentityType = "faculty" | "graduate" | "student";
export interface DecodedAccessToken {
  isAdmin: boolean;
  email: string;
}
