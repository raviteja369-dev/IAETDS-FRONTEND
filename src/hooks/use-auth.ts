"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();

  return useMutation({
    mutationFn: async (payload: {
      email: string;
      password: string;
      remember?: boolean;
    }) => {
      const { data } = await api.post("/auth/login", payload);
      return data.data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.permissions);
      router.push("/dashboard");
    },
  });
}

export function useLogout() {
  const clear = useAuthStore((s) => s.clear);
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      await api.post("/auth/logout", {});
    },
    onSettled: () => {
      clear();
      router.push("/login");
    },
  });
}
