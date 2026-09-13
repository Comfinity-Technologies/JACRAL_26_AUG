import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <section className="mx-auto max-w-2xl px-6 py-20 text-center">
      <h1 className="text-6xl font-serif text-[#17382B]">
        404
      </h1>

      <p className="mt-4 text-gray-600">
        The page you're looking for doesn't exist.
      </p>

      <Link
        to="/"
        className="mt-8 inline-block rounded-full bg-[#17382B] px-6 py-3 text-white"
      >
        Back Home
      </Link>
    </section>
  );
}