import Link from "next/link";

export default function NotFound() {
  return (
    <main className="store-main">
      <p className="eyebrow">404</p>
      <h1>That page is not in the room.</h1>
      <p>Browse the polo edit or return to the combo builder.</p>
      <Link href="/" className="button button-primary">
        Back to Silk Room
      </Link>
    </main>
  );
}
