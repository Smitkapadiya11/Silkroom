type PlaceholderFrameProps = {
  label: string;
  ratio?: string;
  className?: string;
};

export function PlaceholderFrame({
  label,
  ratio = "4 / 5",
  className = "",
}: PlaceholderFrameProps) {
  return (
    <div
      className={`placeholder-frame ${className}`.trim()}
      style={{ aspectRatio: ratio }}
      role="img"
      aria-label={label}
    >
      <span>{label}</span>
    </div>
  );
}
