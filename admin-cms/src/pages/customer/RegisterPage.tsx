import type { FormEvent } from "react";

import {
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";


export default function RegisterPage() {

  const navigate =
    useNavigate();


  const {
    register,
    login,
    loading,
  } = useAuth();


  const [
    name,
    setName,
  ] = useState("");


  const [
    email,
    setEmail,
  ] = useState("");


  const [
    password,
    setPassword,
  ] = useState("");


  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");


  const [
    error,
    setError,
  ] = useState("");


  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {

    event.preventDefault();

    setError("");


    const cleanName =
      name.trim();


    const cleanEmail =
      email.trim().toLowerCase();


    if (cleanName.length < 2) {

      setError(
        "Name must contain at least 2 characters.",
      );

      return;

    }


    if (password.length < 8) {

      setError(
        "Password must contain at least 8 characters.",
      );

      return;

    }


    if (
      password !==
      confirmPassword
    ) {

      setError(
        "Passwords do not match.",
      );

      return;

    }


    try {

      await register({
        name: cleanName,
        email: cleanEmail,
        password,
      });


      // Automatically login after registration
      await login({
        email: cleanEmail,
        password,
      });


      navigate(
        "/account",
        {
          replace: true,
        },
      );

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : "Unable to create account.",
      );

    }

  }


  return (

    <div className="min-h-screen bg-[#FCFAF4] px-6 py-16">

      <div className="mx-auto max-w-md">

        <div className="text-center">

          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#C98B4A]">
            JOIN JACRAL
          </p>

          <h1 className="mt-3 font-serif text-5xl text-[#17382B]">
            Create Account
          </h1>

          <p className="mt-4 text-[#718078]">
            Create your Jacral account to manage orders and checkout.
          </p>

        </div>


        <form
          onSubmit={handleSubmit}
          className="mt-10 botanica-card p-8 md:p-10"
        >

          <label className="block text-sm font-medium text-[#17382B]">

            Full Name

            <input
              required
              minLength={2}
              autoComplete="name"
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value,
                )
              }
              className="mt-2 w-full rounded-xl border border-[#DCD7CB] px-4 py-3 outline-none focus:border-[#17382B]"
              placeholder="Your name"
            />

          </label>


          <label className="mt-5 block text-sm font-medium text-[#17382B]">

            Email

            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value,
                )
              }
              className="mt-2 w-full rounded-xl border border-[#DCD7CB] px-4 py-3 outline-none focus:border-[#17382B]"
              placeholder="you@example.com"
            />

          </label>


          <label className="mt-5 block text-sm font-medium text-[#17382B]">

            Password

            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value,
                )
              }
              className="mt-2 w-full rounded-xl border border-[#DCD7CB] px-4 py-3 outline-none focus:border-[#17382B]"
              placeholder="At least 8 characters"
            />

          </label>


          <label className="mt-5 block text-sm font-medium text-[#17382B]">

            Confirm Password

            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(
                  event.target.value,
                )
              }
              className="mt-2 w-full rounded-xl border border-[#DCD7CB] px-4 py-3 outline-none focus:border-[#17382B]"
              placeholder="Repeat your password"
            />

          </label>


          {error && (

            <div
              role="alert"
              className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>

          )}


          <button
            disabled={loading}
            type="submit"
            className="mt-7 w-full rounded-full bg-[#17382B] px-6 py-4 font-semibold text-white transition hover:bg-[#285642] disabled:cursor-not-allowed disabled:opacity-60"
          >

            {loading
              ? "Creating Account..."
              : "Create Account"}

          </button>


          <p className="mt-6 text-center text-sm text-[#718078]">

            Already have an account?{" "}

            <Link
              to="/login"
              className="font-semibold text-[#17382B]"
            >
              Sign in
            </Link>

          </p>

        </form>

      </div>

    </div>

  );

}