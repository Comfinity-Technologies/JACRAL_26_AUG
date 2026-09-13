import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  login as loginApi,
  register as registerApi,
  challengeMfa as challengeMfaApi,
  type LoginRequest,
  type RegisterRequest,
  type User,
  type TokenResponse,
} from "../api/auth";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (data: LoginRequest) => Promise<TokenResponse>;
  completeMfa: (mfaToken: string, code: string) => Promise<User>;
  register: (data: RegisterRequest) => Promise<User>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("jacral_user");
    if (!storedUser) return null;
    try {
      return JSON.parse(storedUser) as User;
    } catch {
      localStorage.removeItem("jacral_user");
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("jacral_access_token")
  );

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setUser(null);
    }
  }, [token]);

  const handleAuthSuccess = (response: TokenResponse) => {
    if (!response.access_token || !response.user) return;
    localStorage.setItem("jacral_access_token", response.access_token);
    localStorage.setItem("jacral_user", JSON.stringify(response.user));
    setToken(response.access_token);
    setUser(response.user);
  };

  async function login(
    data: LoginRequest
  ): Promise<TokenResponse> {
    setLoading(true);
    try {
      const response = await loginApi(data);
      if (response.mfa_required) {
        return response;
      }
      handleAuthSuccess(response);
      return response;
    } finally {
      setLoading(false);
    }
  }

  async function completeMfa(mfaToken: string, code: string): Promise<User> {
    setLoading(true);
    try {
      const response = await challengeMfaApi(mfaToken, code);
      handleAuthSuccess(response);
      return response.user!;
    } finally {
      setLoading(false);
    }
  }

  async function register(
    data: RegisterRequest
  ): Promise<User> {
    setLoading(true);
    try {
      const newUser = await registerApi(data);
      return newUser;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("jacral_access_token");
    localStorage.removeItem("jacral_user");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        completeMfa,
        register,
        logout,
        isAuthenticated: Boolean(token && user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}