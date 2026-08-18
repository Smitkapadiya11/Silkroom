export function ShippingSticker({
  orderNumber,
  customerName,
  addressLine1,
  addressLine2,
  city,
  state,
  pincode,
  phone,
  paymentMethod,
  totalInr,
  items,
  paid,
}: {
  orderNumber: string;
  customerName: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  paymentMethod: string;
  totalInr: number;
  items: { quantity: number; productName: string; color: string; size: string }[];
  paid: boolean;
}) {
  const money = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(totalInr);
  const banner =
    paymentMethod === "cod" ? `COD — COLLECT ${money}` : paid ? "PREPAID — DO NOT COLLECT" : "UNPAID PREPAID";

  return (
    <article className="meesho-sticker">
      <header>{banner}</header>
      <p className="meesho-sticker-kicker">Ship to</p>
      <p className="meesho-sticker-name">{customerName}</p>
      <p>{addressLine1}</p>
      {addressLine2 ? <p>{addressLine2}</p> : null}
      <p>
        {city}, {state}
      </p>
      <p className="meesho-sticker-pin">PIN {pincode}</p>
      <p>{phone}</p>
      <img src={`/api/admin/barcode/${orderNumber}`} alt={`Barcode ${orderNumber}`} width={280} height={72} />
      <p className="meesho-sticker-order">{orderNumber}</p>
      <ul>
        {items.map((item) => (
          <li key={`${item.productName}-${item.size}`}>
            {item.quantity}× {item.productName} · {item.color} / {item.size}
          </li>
        ))}
      </ul>
      <p className="meesho-sticker-from">From Silk Room, Surat · Leave space for courier AWB</p>
    </article>
  );
}
