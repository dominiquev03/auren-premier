import logo from "@/assets/app-icon.png";

type Props = {
  className?: string;
  showWordmark?: boolean;
  size?: number;
};

export function BrandLogo({ className = "", size = 32 }: Props) {
  return (
    <img
      src={logo}
      alt="Auren Plumbing Supplies"
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size, objectFit: "contain" }}
    />
  );
}

export function BrandWatermark({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 flex flex-col items-center justify-center select-none ${className}`}
      aria-hidden="true"
    >
      <img
        src={logo}
        alt=""
        className="w-[55%] max-w-md opacity-[0.04]"
        style={{ filter: "grayscale(0.2)" }}
      />
      <span className="mt-4 font-display tracking-[0.5em] text-foreground/[0.05] text-2xl uppercase">
        Auren Plumbing Supplies
      </span>
    </div>
  );
}
