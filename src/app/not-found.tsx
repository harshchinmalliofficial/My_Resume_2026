import Link from "next/link";

export default function NotFound() {
  return (
    <section className="lane mx-auto flex min-h-[70dvh] max-w-[1280px] flex-col justify-center px-5 md:px-8">
      <p className="label">404</p>
      <h1 className="display mt-3 text-5xl md:text-7xl">This page did not retrieve.</h1>
      <p className="mt-5 max-w-[50ch] text-lg text-muted">The link may be old or mistyped. The work is one click away.</p>
      <Link href="/" className="mt-8 w-fit bg-accent px-5 py-3 font-medium text-accent-ink">Back to home</Link>
    </section>
  );
}
