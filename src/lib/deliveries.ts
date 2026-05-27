export type DeliveryStatus = "pending" | "dispatched" | "out_for_delivery" | "delivered" | "failed";

export const DELIVERY_STATUS_LABEL: Record<DeliveryStatus, string> = {
  pending: "Pending",
  dispatched: "Dispatched",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  failed: "Failed",
};

export const DELIVERY_STATUS_ORDER: DeliveryStatus[] = [
  "pending",
  "dispatched",
  "out_for_delivery",
  "delivered",
];

export function statusTone(s: DeliveryStatus): string {
  switch (s) {
    case "delivered": return "border-emerald-500/40 text-emerald-400";
    case "out_for_delivery": return "border-primary/40 text-primary";
    case "dispatched": return "border-blue-400/40 text-blue-300";
    case "failed": return "border-destructive/50 text-destructive";
    default: return "border-border text-muted-foreground";
  }
}

export type Delivery = {
  id: string;
  customer_id: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  driver_id: string | null;
  status: DeliveryStatus;
  scheduled_at: string | null;
  dispatched_at: string | null;
  delivered_at: string | null;
  delivery_address: string | null;
  delivery_notes: string | null;
  gps_lat: number | null;
  gps_lng: number | null;
  pod_signature_path: string | null;
  pod_signed_name: string | null;
  pod_signed_at: string | null;
  pod_gps_lat: number | null;
  pod_gps_lng: number | null;
  quote_id: string | null;
  guest_quote_id: string | null;
  invoice_ref: string | null;
  project_ref: string | null;
  reference: string | null;
  total_amount: number | null;
  failure_reason: string | null;
  created_at: string;
};

export async function currentGps(): Promise<{ lat: number; lng: number } | null> {
  if (typeof navigator === "undefined" || !navigator.geolocation) return null;
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 6000 },
    );
  });
}
