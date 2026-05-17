import shower from "@/assets/product-shower.jpg";
import mixer from "@/assets/product-mixer.jpg";
import fittings from "@/assets/product-fittings.jpg";
import bath from "@/assets/product-bath.jpg";
import faucet from "@/assets/hero-faucet.jpg";

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  sku: string;
  description: string;
};

export const products: Product[] = [
  { id: "1", name: "Aurelia Brushed Gold Basin Mixer", category: "Taps & Mixers", price: 4899, image: mixer, sku: "AU-MX-001", description: "Solid brass single-lever basin mixer with PVD brushed gold finish." },
  { id: "2", name: "Cascade Rainfall Showerhead 250mm", category: "Showers", price: 6450, image: shower, sku: "AU-SH-250", description: "Ultra-thin 304 stainless rainfall head with anti-lime nozzles." },
  { id: "3", name: "Noir Freestanding Bathtub", category: "Baths", price: 38900, image: bath, sku: "AU-BT-NR1", description: "Matte black acrylic freestanding tub, 1700mm, double-skin insulated." },
  { id: "4", name: "Copper Pipe Fitting Set", category: "Fittings", price: 1290, image: fittings, sku: "AU-FT-CP12", description: "Premium 22mm copper press-fit assortment, 24 pieces." },
  { id: "5", name: "Sovereign Sensor Faucet", category: "Taps & Mixers", price: 7250, image: faucet, sku: "AU-MX-SOV", description: "Touchless infrared faucet with brushed gold sculpted spout." },
  { id: "6", name: "Onyx Concealed Shower Set", category: "Showers", price: 12990, image: bath, sku: "AU-SH-ON1", description: "Thermostatic concealed valve, rainfall + handheld, matte black." },
];

export const formatZAR = (n: number) =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", minimumFractionDigits: 2 }).format(n);
