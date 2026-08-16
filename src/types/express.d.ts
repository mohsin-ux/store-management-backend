declare namespace Express {
  interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    storeId: string | null;
    isOwner: boolean;
    isSuperAdmin: boolean;
  }
  interface Request {
    user?: User;
  }
}
