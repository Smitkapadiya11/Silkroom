import Link from "next/link";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Size guide",
  description:
    "Silk Room polo measurements in inches and centimetres, plus how to measure a polo you already own.",
  path: "/size-guide",
});

const rows = [
  { size: "S", chestIn: "38", chestCm: "96", lengthIn: "27", lengthCm: "68" },
  { size: "M", chestIn: "40", chestCm: "102", lengthIn: "28", lengthCm: "71" },
  { size: "L", chestIn: "42", chestCm: "107", lengthIn: "29", lengthCm: "74" },
  { size: "XL", chestIn: "44", chestCm: "112", lengthIn: "30", lengthCm: "76" },
];

export default function SizeGuidePage() {
  return (
    <article className="policy-page">
      <header className="store-page-header">
        <p className="eyebrow">Fit</p>
        <h1>Size guide</h1>
        <p>Relaxed regular fit · measure a polo that already fits you well.</p>
      </header>

      <div className="size-table-wrap">
        <table className="size-table">
          <thead>
            <tr>
              <th scope="col">Size</th>
              <th scope="col">Chest (in)</th>
              <th scope="col">Chest (cm)</th>
              <th scope="col">Length (in)</th>
              <th scope="col">Length (cm)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.size}>
                <th scope="row">{row.size}</th>
                <td>{row.chestIn}</td>
                <td>{row.chestCm}</td>
                <td>{row.lengthIn}</td>
                <td>{row.lengthCm}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section aria-labelledby="measure-title">
        <h2 id="measure-title">How to measure your polo</h2>
        <ol className="policy-list">
          <li>Lay the polo flat on a table.</li>
          <li>
            <strong>Chest:</strong> measure armpit to armpit, then double.
          </li>
          <li>
            <strong>Length:</strong> shoulder seam to hem along the back.
          </li>
          <li>Compare to the table — between sizes? Size up for an easier drape.</li>
        </ol>
      </section>

      <p>
        Still unsure? <Link href="/contact">Message us on WhatsApp</Link> with your
        usual brand and size.
      </p>
    </article>
  );
}
