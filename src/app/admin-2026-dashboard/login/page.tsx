// src/app/admin-2026-dashboard/login/page.tsx
"use client";

import { useState } from "react";
import { loginAction } from "@/app/actions/auth";
import { Lock } from "lucide-react";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const res = await loginAction(formData);

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md p-8 bg-white/5 border border-white/10 rounded-3xl fade-in-up">
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-black border border-white/10 rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(15,242,99,0.2)]">
          <Lock className="w-8 h-8 text-hxnf-green" />
        </div>
        <h1 className="text-2xl font-bold text-white text-center">Acceso Restringido</h1>
        <p className="text-white/50 text-sm mt-2 text-center">
          Panel de Administración HXNF
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-semibold text-white/50 mb-2 uppercase">
            Contraseña
          </label>
          <input
            type="password"
            name="password"
            placeholder="••••••••"
            required
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:border-hxnf-green outline-none transition-colors"
          />
        </div>

        {error && (
          <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg border border-red-400/20">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-hxnf-green text-black font-bold text-lg py-3 rounded-xl hover:bg-hxnf-yellow transition-colors disabled:opacity-50"
        >
          {loading ? "Verificando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
