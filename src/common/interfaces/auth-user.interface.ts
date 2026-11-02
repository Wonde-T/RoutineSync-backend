export interface AuthUser {
  id: string;
  email: string;
  timezone: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
}
