
CREATE TYPE public.delivery_status AS ENUM ('pending','dispatched','out_for_delivery','delivered','failed');

CREATE TABLE public.deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid,
  customer_name text,
  customer_email text,
  customer_phone text,
  driver_id uuid,
  status public.delivery_status NOT NULL DEFAULT 'pending',
  scheduled_at timestamptz,
  dispatched_at timestamptz,
  delivered_at timestamptz,
  delivery_address text,
  delivery_notes text,
  gps_lat double precision,
  gps_lng double precision,
  pod_signature_path text,
  pod_signed_name text,
  pod_signed_at timestamptz,
  pod_gps_lat double precision,
  pod_gps_lng double precision,
  quote_id uuid,
  guest_quote_id uuid,
  invoice_ref text,
  project_ref text,
  reference text,
  total_amount numeric(12,2),
  failure_reason text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.deliveries TO authenticated;
GRANT ALL ON public.deliveries TO service_role;

ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers view own deliveries" ON public.deliveries
  FOR SELECT TO authenticated USING (customer_id = auth.uid());
CREATE POLICY "Staff view all deliveries" ON public.deliveries
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Driver views assigned deliveries" ON public.deliveries
  FOR SELECT TO authenticated USING (driver_id = auth.uid());
CREATE POLICY "Staff insert deliveries" ON public.deliveries
  FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff update deliveries" ON public.deliveries
  FOR UPDATE TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Driver updates assigned deliveries" ON public.deliveries
  FOR UPDATE TO authenticated USING (driver_id = auth.uid());

CREATE TRIGGER deliveries_set_updated_at BEFORE UPDATE ON public.deliveries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX deliveries_customer_idx ON public.deliveries(customer_id);
CREATE INDEX deliveries_driver_idx ON public.deliveries(driver_id);
CREATE INDEX deliveries_status_idx ON public.deliveries(status);

CREATE TABLE public.delivery_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id uuid NOT NULL REFERENCES public.deliveries(id) ON DELETE CASCADE,
  status public.delivery_status NOT NULL,
  note text,
  gps_lat double precision,
  gps_lng double precision,
  actor_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.delivery_events TO authenticated;
GRANT ALL ON public.delivery_events TO service_role;

ALTER TABLE public.delivery_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View events for accessible delivery" ON public.delivery_events
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.deliveries d WHERE d.id = delivery_id
      AND (d.customer_id = auth.uid() OR d.driver_id = auth.uid() OR public.is_staff(auth.uid())))
  );
CREATE POLICY "Staff or driver insert events" ON public.delivery_events
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.deliveries d WHERE d.id = delivery_id
      AND (d.driver_id = auth.uid() OR public.is_staff(auth.uid())))
  );

CREATE INDEX delivery_events_delivery_idx ON public.delivery_events(delivery_id);

CREATE TABLE public.delivery_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id uuid NOT NULL REFERENCES public.deliveries(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  caption text,
  uploaded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.delivery_photos TO authenticated;
GRANT ALL ON public.delivery_photos TO service_role;

ALTER TABLE public.delivery_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View photos for accessible delivery" ON public.delivery_photos
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.deliveries d WHERE d.id = delivery_id
      AND (d.customer_id = auth.uid() OR d.driver_id = auth.uid() OR public.is_staff(auth.uid())))
  );
CREATE POLICY "Staff or driver insert photos" ON public.delivery_photos
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.deliveries d WHERE d.id = delivery_id
      AND (d.driver_id = auth.uid() OR public.is_staff(auth.uid())))
  );

CREATE INDEX delivery_photos_delivery_idx ON public.delivery_photos(delivery_id);

INSERT INTO storage.buckets (id, name, public) VALUES ('delivery-pod','delivery-pod', false)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Staff read delivery-pod" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'delivery-pod' AND public.is_staff(auth.uid()));
CREATE POLICY "Staff or driver upload delivery-pod" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'delivery-pod' AND (
      public.is_staff(auth.uid()) OR
      EXISTS (SELECT 1 FROM public.deliveries d WHERE d.driver_id = auth.uid() AND d.id::text = (storage.foldername(name))[1])
    )
  );
CREATE POLICY "Customer read own delivery-pod" ON storage.objects
  FOR SELECT TO authenticated USING (
    bucket_id = 'delivery-pod' AND
    EXISTS (SELECT 1 FROM public.deliveries d WHERE d.customer_id = auth.uid() AND d.id::text = (storage.foldername(name))[1])
  );
CREATE POLICY "Driver read own delivery-pod" ON storage.objects
  FOR SELECT TO authenticated USING (
    bucket_id = 'delivery-pod' AND
    EXISTS (SELECT 1 FROM public.deliveries d WHERE d.driver_id = auth.uid() AND d.id::text = (storage.foldername(name))[1])
  );
