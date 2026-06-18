import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PageShell } from "@/components/page-shell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { audit } from "@/lib/audit";
import {
  LayoutDashboard, Package, Tags, Image as ImageIcon, HelpCircle,
  Plus, Pencil, Trash2, Loader2, RefreshCw, Upload, Crown, Star, EyeOff, Eye, X,
  FileText, Truck, Users,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/owner")({
  component: OwnerPortal,
  head: () => ({ meta: [{ title: "Owner Portal · Auren" }] }),
});

type Tab = "dashboard" | "products" | "categories" | "banners" | "faqs";

type Category = {
  id: string; name: string; slug: string; description: string | null;
  image_path: string | null; sort_order: number; is_active: boolean;
};
type Product = {
  id: string; category_id: string | null; name: string; slug: string;
  description: string | null; sku: string | null; price_cents: number;
  currency: string; stock: number; primary_image_path: string | null;
  is_active: boolean; is_featured: boolean; sort_order: number;
};
type Banner = {
  id: string; title: string; subtitle: string | null; image_path: string | null;
  link_url: string | null; cta_label: string | null; sort_order: number;
  is_active: boolean; starts_at: string | null; ends_at: string | null;
};
type Faq = {
  id: string; question: string; answer: string; category: string | null;
  sort_order: number; is_active: boolean;
};

function OwnerPortal() {
  const { isSuperAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("dashboard");

  useEffect(() => {
    if (!loading && !isSuperAdmin) navigate({ to: "/" });
  }, [loading, isSuperAdmin, navigate]);

  if (loading || !isSuperAdmin) {
    return <div className="min-h-[50vh] grid place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <PageShell
      eyebrow="Owner console"
      title="Owner Portal"
      lead="Manage every aspect of the Auren customer experience — products, content and notifications — without leaving the app."
    >
      <div className="flex flex-wrap items-center gap-2 mb-8">
        <OwnerTab active={tab === "dashboard"} onClick={() => setTab("dashboard")} icon={<LayoutDashboard className="h-3.5 w-3.5" />}>Dashboard</OwnerTab>
        <OwnerTab active={tab === "products"} onClick={() => setTab("products")} icon={<Package className="h-3.5 w-3.5" />}>Products</OwnerTab>
        <OwnerTab active={tab === "categories"} onClick={() => setTab("categories")} icon={<Tags className="h-3.5 w-3.5" />}>Categories</OwnerTab>
        <OwnerTab active={tab === "banners"} onClick={() => setTab("banners")} icon={<ImageIcon className="h-3.5 w-3.5" />}>Banners</OwnerTab>
        <OwnerTab active={tab === "faqs"} onClick={() => setTab("faqs")} icon={<HelpCircle className="h-3.5 w-3.5" />}>FAQs</OwnerTab>
      </div>

      {tab === "dashboard" && <DashboardPanel />}
      {tab === "products" && <ProductsPanel />}
      {tab === "categories" && <CategoriesPanel />}
      {tab === "banners" && <BannersPanel />}
      {tab === "faqs" && <FaqsPanel />}
    </PageShell>
  );
}

function OwnerTab({ active, onClick, children, icon }: { active: boolean; onClick: () => void; children: React.ReactNode; icon: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-full border transition ${
        active
          ? "border-primary text-primary bg-primary/10 shadow-gold-glow"
          : "border-border/60 text-muted-foreground hover:border-primary/40"
      }`}>
      {icon}{children}
    </button>
  );
}

// ───────────────────────── Dashboard ─────────────────────────
function DashboardPanel() {
  const [stats, setStats] = useState<{ products: number; categories: number; banners: number; faqs: number; quotes: number; guestQuotes: number; deliveries: number; customers: number } | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const [p, c, b, f, q, g, d, u] = await Promise.all([
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("categories").select("id", { count: "exact", head: true }),
      supabase.from("banners").select("id", { count: "exact", head: true }),
      supabase.from("faqs").select("id", { count: "exact", head: true }),
      supabase.from("quote_requests").select("id", { count: "exact", head: true }),
      supabase.from("guest_quote_requests").select("id", { count: "exact", head: true }),
      supabase.from("deliveries").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
    ]);
    setStats({
      products: p.count ?? 0, categories: c.count ?? 0, banners: b.count ?? 0, faqs: f.count ?? 0,
      quotes: q.count ?? 0, guestQuotes: g.count ?? 0, deliveries: d.count ?? 0, customers: u.count ?? 0,
    });
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  if (loading || !stats) {
    return <div className="py-16 grid place-items-center"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-background to-background p-6 flex items-start gap-4">
        <Crown className="h-6 w-6 text-primary mt-1" />
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-primary">Welcome, Owner</p>
          <h2 className="font-display text-2xl mt-1">Auren Plumbing — control centre</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-xl">Everything you publish here goes live immediately to every customer. Use the tabs above to manage the catalogue, content and customer experience.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Products" value={stats.products} icon={<Package className="h-4 w-4" />} />
        <Stat label="Categories" value={stats.categories} icon={<Tags className="h-4 w-4" />} />
        <Stat label="Banners" value={stats.banners} icon={<ImageIcon className="h-4 w-4" />} />
        <Stat label="FAQs" value={stats.faqs} icon={<HelpCircle className="h-4 w-4" />} />
        <Stat label="Customer quotes" value={stats.quotes} icon={<FileText className="h-4 w-4" />} />
        <Stat label="Guest quotes" value={stats.guestQuotes} icon={<FileText className="h-4 w-4" />} />
        <Stat label="Deliveries" value={stats.deliveries} icon={<Truck className="h-4 w-4" />} />
        <Stat label="Customers" value={stats.customers} icon={<Users className="h-4 w-4" />} />
      </div>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="border border-border/60 rounded-xl p-4 bg-card/40">
      <div className="flex items-center gap-2 text-primary">{icon}<span className="text-[10px] uppercase tracking-widest">{label}</span></div>
      <p className="font-display text-3xl mt-2">{value}</p>
    </div>
  );
}

// ───────────────────────── Products ─────────────────────────
function ProductsPanel() {
  const [rows, setRows] = useState<Product[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");
  const [signed, setSigned] = useState<Record<string, string>>({});

  async function load() {
    setLoading(true);
    const [p, c] = await Promise.all([
      supabase.from("products").select("*").order("sort_order").order("created_at", { ascending: false }),
      supabase.from("categories").select("*").order("sort_order"),
    ]);
    const prods = (p.data ?? []) as Product[];
    setRows(prods);
    setCats((c.data ?? []) as Category[]);
    setLoading(false);
    // signed urls
    const map: Record<string, string> = {};
    await Promise.all(prods.filter((r) => r.primary_image_path).map(async (r) => {
      const { data } = await supabase.storage.from("product-images").createSignedUrl(r.primary_image_path!, 3600);
      if (data?.signedUrl) map[r.id] = data.signedUrl;
    }));
    setSigned(map);
  }
  useEffect(() => { load(); }, []);

  async function remove(id: string) {
    if (!confirm("Delete this product permanently?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Product deleted.");
    await audit("product.deleted", { resourceType: "products", resourceId: id });
    load();
  }
  async function toggle(p: Product, field: "is_active" | "is_featured") {
    const patch = field === "is_active" ? { is_active: !p.is_active } : { is_featured: !p.is_featured };
    const { error } = await supabase.from("products").update(patch).eq("id", p.id);
    if (error) return toast.error(error.message);
    load();
  }

  const filtered = useMemo(() => rows.filter((r) => {
    const s = search.trim().toLowerCase();
    if (!s) return true;
    return r.name.toLowerCase().includes(s) || (r.sku ?? "").toLowerCase().includes(s);
  }), [rows, search]);

  return (
    <div>
      <Toolbar
        onCreate={() => setCreating(true)}
        onRefresh={load}
        createLabel="New product"
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search by name or SKU…"
      />
      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <Empty hint="Create your first product to populate the catalogue." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((p) => (
            <div key={p.id} className="border border-border/60 rounded-xl p-4 flex gap-4">
              <div className="h-20 w-20 rounded-lg overflow-hidden bg-secondary shrink-0 grid place-items-center">
                {signed[p.id] ? <img src={signed[p.id]} alt={p.name} className="h-full w-full object-cover" /> : <ImageIcon className="h-5 w-5 text-muted-foreground" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <p className="font-display text-base truncate">{p.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{p.sku ?? "—"} · {(p.price_cents / 100).toLocaleString("en-ZA", { style: "currency", currency: p.currency })}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {p.is_featured && <span className="text-[10px] inline-flex items-center gap-1 text-primary"><Star className="h-3 w-3" /> Featured</span>}
                    {!p.is_active && <span className="text-[10px] inline-flex items-center gap-1 text-muted-foreground"><EyeOff className="h-3 w-3" /> Hidden</span>}
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <IconBtn onClick={() => setEditing(p)}><Pencil className="h-3 w-3" /> Edit</IconBtn>
                  <IconBtn onClick={() => toggle(p, "is_featured")}><Star className="h-3 w-3" /> {p.is_featured ? "Unfeature" : "Feature"}</IconBtn>
                  <IconBtn onClick={() => toggle(p, "is_active")}>{p.is_active ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />} {p.is_active ? "Hide" : "Show"}</IconBtn>
                  <IconBtn onClick={() => remove(p.id)} danger><Trash2 className="h-3 w-3" /> Delete</IconBtn>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {(creating || editing) && (
        <ProductDialog
          categories={cats}
          product={editing}
          onClose={() => { setCreating(false); setEditing(null); }}
          onSaved={() => { setCreating(false); setEditing(null); load(); }}
        />
      )}
    </div>
  );
}

function ProductDialog({ product, categories, onClose, onSaved }: { product: Product | null; categories: Category[]; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    sku: product?.sku ?? "",
    description: product?.description ?? "",
    price: product ? (product.price_cents / 100).toString() : "",
    stock: product?.stock?.toString() ?? "0",
    category_id: product?.category_id ?? "",
    is_active: product?.is_active ?? true,
    is_featured: product?.is_featured ?? false,
    image_path: product?.primary_image_path ?? null as string | null,
  });
  const [imgPreview, setImgPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (form.image_path) {
      supabase.storage.from("product-images").createSignedUrl(form.image_path, 3600).then(({ data }) => {
        if (data?.signedUrl) setImgPreview(data.signedUrl);
      });
    }
  }, []);

  async function uploadImage(file: File) {
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file, { upsert: false, contentType: file.type });
    if (error) { toast.error(error.message); return; }
    setForm((f) => ({ ...f, image_path: path }));
    const { data } = await supabase.storage.from("product-images").createSignedUrl(path, 3600);
    if (data?.signedUrl) setImgPreview(data.signedUrl);
    toast.success("Image uploaded.");
  }

  async function save() {
    setSaving(true);
    const slug = (form.slug || form.name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const payload = {
      name: form.name.trim(),
      slug,
      sku: form.sku.trim() || null,
      description: form.description.trim() || null,
      price_cents: Math.round(parseFloat(form.price || "0") * 100),
      stock: parseInt(form.stock || "0", 10),
      category_id: form.category_id || null,
      is_active: form.is_active,
      is_featured: form.is_featured,
      primary_image_path: form.image_path,
    };
    const op = product
      ? supabase.from("products").update(payload).eq("id", product.id)
      : supabase.from("products").insert(payload);
    const { error } = await op;
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(product ? "Product updated." : "Product created.");
    await audit(product ? "product.updated" : "product.created", { resourceType: "products", resourceId: product?.id, metadata: { name: payload.name } });
    onSaved();
  }

  return (
    <Modal title={product ? "Edit product" : "New product"} onClose={onClose}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Name"><Input value={form.name} onChange={(v) => setForm({ ...form, name: v })} /></Field>
        <Field label="Slug (auto if blank)"><Input value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} /></Field>
        <Field label="SKU"><Input value={form.sku} onChange={(v) => setForm({ ...form, sku: v })} /></Field>
        <Field label="Category">
          <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="bg-input/40 border border-border rounded-lg px-3 py-2 text-sm w-full">
            <option value="">— Uncategorised —</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="Price (ZAR)"><Input value={form.price} onChange={(v) => setForm({ ...form, price: v })} type="number" /></Field>
        <Field label="Stock"><Input value={form.stock} onChange={(v) => setForm({ ...form, stock: v })} type="number" /></Field>
        <Field label="Description" full>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className="bg-input/40 border border-border rounded-lg px-3 py-2 text-sm w-full" />
        </Field>
        <Field label="Primary image" full>
          <div className="flex gap-3 items-center">
            <label className="cursor-pointer inline-flex items-center gap-2 text-xs border border-border rounded-full px-3 py-2 hover:border-primary/60">
              <Upload className="h-3 w-3" /> Upload
              <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} />
            </label>
            {imgPreview && <img src={imgPreview} alt="" className="h-14 w-14 rounded-lg object-cover border border-border/60" />}
          </div>
        </Field>
        <Field label="Active"><Toggle value={form.is_active} onChange={(v) => setForm({ ...form, is_active: v })} /></Field>
        <Field label="Featured"><Toggle value={form.is_featured} onChange={(v) => setForm({ ...form, is_featured: v })} /></Field>
      </div>
      <ModalActions onClose={onClose} onSave={save} saving={saving} disabled={!form.name.trim()} />
    </Modal>
  );
}

// ───────────────────────── Categories ─────────────────────────
function CategoriesPanel() {
  const [rows, setRows] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Category | null>(null);
  const [creating, setCreating] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("categories").select("*").order("sort_order").order("name");
    setRows((data ?? []) as Category[]);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function remove(id: string) {
    if (!confirm("Delete this category? Products in it become uncategorised.")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Category deleted.");
    await audit("category.deleted", { resourceType: "categories", resourceId: id });
    load();
  }

  return (
    <div>
      <Toolbar onCreate={() => setCreating(true)} onRefresh={load} createLabel="New category" />
      {loading ? <Spinner /> : rows.length === 0 ? <Empty hint="Create your first category to organise products." /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {rows.map((c) => (
            <div key={c.id} className="border border-border/60 rounded-xl p-4">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <p className="font-display text-base">{c.name}</p>
                  <p className="text-[11px] text-muted-foreground">/{c.slug}{!c.is_active && " · Hidden"}</p>
                </div>
                <span className="text-[10px] text-primary">#{c.sort_order}</span>
              </div>
              {c.description && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{c.description}</p>}
              <div className="mt-3 flex gap-2">
                <IconBtn onClick={() => setEditing(c)}><Pencil className="h-3 w-3" /> Edit</IconBtn>
                <IconBtn onClick={() => remove(c.id)} danger><Trash2 className="h-3 w-3" /> Delete</IconBtn>
              </div>
            </div>
          ))}
        </div>
      )}
      {(creating || editing) && (
        <CategoryDialog category={editing} onClose={() => { setCreating(false); setEditing(null); }} onSaved={() => { setCreating(false); setEditing(null); load(); }} />
      )}
    </div>
  );
}

function CategoryDialog({ category, onClose, onSaved }: { category: Category | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: category?.name ?? "",
    slug: category?.slug ?? "",
    description: category?.description ?? "",
    sort_order: category?.sort_order ?? 0,
    is_active: category?.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const slug = (form.slug || form.name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const payload = { name: form.name.trim(), slug, description: form.description.trim() || null, sort_order: form.sort_order, is_active: form.is_active };
    const op = category
      ? supabase.from("categories").update(payload).eq("id", category.id)
      : supabase.from("categories").insert(payload);
    const { error } = await op;
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(category ? "Category updated." : "Category created.");
    await audit(category ? "category.updated" : "category.created", { resourceType: "categories", resourceId: category?.id });
    onSaved();
  }

  return (
    <Modal title={category ? "Edit category" : "New category"} onClose={onClose}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Name"><Input value={form.name} onChange={(v) => setForm({ ...form, name: v })} /></Field>
        <Field label="Slug (auto if blank)"><Input value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} /></Field>
        <Field label="Description" full>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="bg-input/40 border border-border rounded-lg px-3 py-2 text-sm w-full" />
        </Field>
        <Field label="Sort order"><Input value={form.sort_order.toString()} onChange={(v) => setForm({ ...form, sort_order: parseInt(v || "0", 10) })} type="number" /></Field>
        <Field label="Active"><Toggle value={form.is_active} onChange={(v) => setForm({ ...form, is_active: v })} /></Field>
      </div>
      <ModalActions onClose={onClose} onSave={save} saving={saving} disabled={!form.name.trim()} />
    </Modal>
  );
}

// ───────────────────────── Banners ─────────────────────────
function BannersPanel() {
  const [rows, setRows] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [creating, setCreating] = useState(false);
  const [signed, setSigned] = useState<Record<string, string>>({});

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("banners").select("*").order("sort_order");
    const list = (data ?? []) as Banner[];
    setRows(list);
    setLoading(false);
    const map: Record<string, string> = {};
    await Promise.all(list.filter((b) => b.image_path).map(async (b) => {
      const { data } = await supabase.storage.from("site-banners").createSignedUrl(b.image_path!, 3600);
      if (data?.signedUrl) map[b.id] = data.signedUrl;
    }));
    setSigned(map);
  }
  useEffect(() => { load(); }, []);

  async function remove(id: string) {
    if (!confirm("Delete this banner?")) return;
    const { error } = await supabase.from("banners").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Banner deleted.");
    await audit("banner.deleted", { resourceType: "banners", resourceId: id });
    load();
  }

  return (
    <div>
      <Toolbar onCreate={() => setCreating(true)} onRefresh={load} createLabel="New banner" />
      {loading ? <Spinner /> : rows.length === 0 ? <Empty hint="Create your first homepage banner." /> : (
        <div className="space-y-3">
          {rows.map((b) => (
            <div key={b.id} className="border border-border/60 rounded-xl overflow-hidden flex">
              <div className="h-28 w-44 bg-secondary shrink-0">
                {signed[b.id] ? <img src={signed[b.id]} alt={b.title} className="h-full w-full object-cover" /> : <div className="h-full w-full grid place-items-center"><ImageIcon className="h-5 w-5 text-muted-foreground" /></div>}
              </div>
              <div className="flex-1 p-4">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <p className="font-display text-base">{b.title}</p>
                    {b.subtitle && <p className="text-xs text-muted-foreground mt-0.5">{b.subtitle}</p>}
                  </div>
                  {!b.is_active && <span className="text-[10px] text-muted-foreground inline-flex items-center gap-1"><EyeOff className="h-3 w-3" /> Hidden</span>}
                </div>
                <div className="mt-3 flex gap-2">
                  <IconBtn onClick={() => setEditing(b)}><Pencil className="h-3 w-3" /> Edit</IconBtn>
                  <IconBtn onClick={() => remove(b.id)} danger><Trash2 className="h-3 w-3" /> Delete</IconBtn>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {(creating || editing) && (
        <BannerDialog banner={editing} onClose={() => { setCreating(false); setEditing(null); }} onSaved={() => { setCreating(false); setEditing(null); load(); }} />
      )}
    </div>
  );
}

function BannerDialog({ banner, onClose, onSaved }: { banner: Banner | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    title: banner?.title ?? "",
    subtitle: banner?.subtitle ?? "",
    cta_label: banner?.cta_label ?? "",
    link_url: banner?.link_url ?? "",
    sort_order: banner?.sort_order ?? 0,
    is_active: banner?.is_active ?? true,
    image_path: banner?.image_path ?? null as string | null,
  });
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (form.image_path) {
      supabase.storage.from("site-banners").createSignedUrl(form.image_path, 3600).then(({ data }) => {
        if (data?.signedUrl) setPreview(data.signedUrl);
      });
    }
  }, []);

  async function uploadImage(file: File) {
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("site-banners").upload(path, file, { contentType: file.type });
    if (error) return toast.error(error.message);
    setForm((f) => ({ ...f, image_path: path }));
    const { data } = await supabase.storage.from("site-banners").createSignedUrl(path, 3600);
    if (data?.signedUrl) setPreview(data.signedUrl);
    toast.success("Image uploaded.");
  }

  async function save() {
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      subtitle: form.subtitle.trim() || null,
      cta_label: form.cta_label.trim() || null,
      link_url: form.link_url.trim() || null,
      sort_order: form.sort_order,
      is_active: form.is_active,
      image_path: form.image_path,
    };
    const op = banner
      ? supabase.from("banners").update(payload).eq("id", banner.id)
      : supabase.from("banners").insert(payload);
    const { error } = await op;
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(banner ? "Banner updated." : "Banner created.");
    await audit(banner ? "banner.updated" : "banner.created", { resourceType: "banners", resourceId: banner?.id });
    onSaved();
  }

  return (
    <Modal title={banner ? "Edit banner" : "New banner"} onClose={onClose}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Title" full><Input value={form.title} onChange={(v) => setForm({ ...form, title: v })} /></Field>
        <Field label="Subtitle" full><Input value={form.subtitle} onChange={(v) => setForm({ ...form, subtitle: v })} /></Field>
        <Field label="CTA label"><Input value={form.cta_label} onChange={(v) => setForm({ ...form, cta_label: v })} /></Field>
        <Field label="CTA link"><Input value={form.link_url} onChange={(v) => setForm({ ...form, link_url: v })} placeholder="/products" /></Field>
        <Field label="Image" full>
          <div className="flex gap-3 items-center">
            <label className="cursor-pointer inline-flex items-center gap-2 text-xs border border-border rounded-full px-3 py-2 hover:border-primary/60">
              <Upload className="h-3 w-3" /> Upload
              <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} />
            </label>
            {preview && <img src={preview} alt="" className="h-14 w-24 rounded-lg object-cover border border-border/60" />}
          </div>
        </Field>
        <Field label="Sort order"><Input value={form.sort_order.toString()} onChange={(v) => setForm({ ...form, sort_order: parseInt(v || "0", 10) })} type="number" /></Field>
        <Field label="Active"><Toggle value={form.is_active} onChange={(v) => setForm({ ...form, is_active: v })} /></Field>
      </div>
      <ModalActions onClose={onClose} onSave={save} saving={saving} disabled={!form.title.trim()} />
    </Modal>
  );
}

// ───────────────────────── FAQs ─────────────────────────
function FaqsPanel() {
  const [rows, setRows] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Faq | null>(null);
  const [creating, setCreating] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("faqs").select("*").order("sort_order").order("question");
    setRows((data ?? []) as Faq[]);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function remove(id: string) {
    if (!confirm("Delete this FAQ?")) return;
    const { error } = await supabase.from("faqs").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("FAQ deleted.");
    await audit("faq.deleted", { resourceType: "faqs", resourceId: id });
    load();
  }

  return (
    <div>
      <Toolbar onCreate={() => setCreating(true)} onRefresh={load} createLabel="New FAQ" />
      {loading ? <Spinner /> : rows.length === 0 ? <Empty hint="Add common customer questions to reduce support load." /> : (
        <div className="space-y-3">
          {rows.map((f) => (
            <div key={f.id} className="border border-border/60 rounded-xl p-4">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                  <p className="font-display text-base">{f.question}</p>
                  <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">{f.answer}</p>
                  {f.category && <p className="text-[10px] uppercase tracking-widest text-primary mt-2">{f.category}</p>}
                </div>
                {!f.is_active && <span className="text-[10px] text-muted-foreground inline-flex items-center gap-1 shrink-0"><EyeOff className="h-3 w-3" /> Hidden</span>}
              </div>
              <div className="mt-3 flex gap-2">
                <IconBtn onClick={() => setEditing(f)}><Pencil className="h-3 w-3" /> Edit</IconBtn>
                <IconBtn onClick={() => remove(f.id)} danger><Trash2 className="h-3 w-3" /> Delete</IconBtn>
              </div>
            </div>
          ))}
        </div>
      )}
      {(creating || editing) && (
        <FaqDialog faq={editing} onClose={() => { setCreating(false); setEditing(null); }} onSaved={() => { setCreating(false); setEditing(null); load(); }} />
      )}
    </div>
  );
}

function FaqDialog({ faq, onClose, onSaved }: { faq: Faq | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    question: faq?.question ?? "",
    answer: faq?.answer ?? "",
    category: faq?.category ?? "",
    sort_order: faq?.sort_order ?? 0,
    is_active: faq?.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const payload = {
      question: form.question.trim(),
      answer: form.answer.trim(),
      category: form.category.trim() || null,
      sort_order: form.sort_order,
      is_active: form.is_active,
    };
    const op = faq ? supabase.from("faqs").update(payload).eq("id", faq.id) : supabase.from("faqs").insert(payload);
    const { error } = await op;
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(faq ? "FAQ updated." : "FAQ created.");
    await audit(faq ? "faq.updated" : "faq.created", { resourceType: "faqs", resourceId: faq?.id });
    onSaved();
  }

  return (
    <Modal title={faq ? "Edit FAQ" : "New FAQ"} onClose={onClose}>
      <div className="space-y-3">
        <Field label="Question"><Input value={form.question} onChange={(v) => setForm({ ...form, question: v })} /></Field>
        <Field label="Answer">
          <textarea value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} rows={5} className="bg-input/40 border border-border rounded-lg px-3 py-2 text-sm w-full" />
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Category"><Input value={form.category} onChange={(v) => setForm({ ...form, category: v })} placeholder="Optional" /></Field>
          <Field label="Sort order"><Input value={form.sort_order.toString()} onChange={(v) => setForm({ ...form, sort_order: parseInt(v || "0", 10) })} type="number" /></Field>
          <Field label="Active"><Toggle value={form.is_active} onChange={(v) => setForm({ ...form, is_active: v })} /></Field>
        </div>
      </div>
      <ModalActions onClose={onClose} onSave={save} saving={saving} disabled={!form.question.trim() || !form.answer.trim()} />
    </Modal>
  );
}

// ───────────────────────── Shared bits ─────────────────────────
function Toolbar({ onCreate, onRefresh, createLabel, search, onSearch, searchPlaceholder }: { onCreate: () => void; onRefresh: () => void; createLabel: string; search?: string; onSearch?: (v: string) => void; searchPlaceholder?: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
      {onSearch ? (
        <input value={search} onChange={(e) => onSearch(e.target.value)} placeholder={searchPlaceholder} className="flex-1 min-w-[200px] bg-input/40 border border-border rounded-full px-4 py-2 text-sm" />
      ) : <div />}
      <div className="flex gap-2">
        <button onClick={onRefresh} className="text-xs inline-flex items-center gap-1.5 border border-border rounded-full px-3 py-2 hover:border-primary/60">
          <RefreshCw className="h-3 w-3" /> Refresh
        </button>
        <button onClick={onCreate} className="text-xs inline-flex items-center gap-1.5 bg-gold-gradient text-primary-foreground font-medium rounded-full px-4 py-2 shadow-gold-glow hover:opacity-90">
          <Plus className="h-3 w-3" /> {createLabel}
        </button>
      </div>
    </div>
  );
}

function IconBtn({ onClick, children, danger }: { onClick: () => void; children: React.ReactNode; danger?: boolean }) {
  return (
    <button onClick={onClick}
      className={`text-[11px] inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full border transition ${
        danger ? "border-destructive/40 text-destructive hover:bg-destructive/10" : "border-border/60 text-muted-foreground hover:border-primary/60 hover:text-foreground"
      }`}>
      {children}
    </button>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <label className={`flex flex-col gap-1.5 ${full ? "sm:col-span-2" : ""}`}>
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function Input({ value, onChange, type = "text", placeholder }: { value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return <input value={value} onChange={(e) => onChange(e.target.value)} type={type} placeholder={placeholder} className="bg-input/40 border border-border rounded-lg px-3 py-2 text-sm w-full" />;
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!value)}
      className={`w-12 h-6 rounded-full relative transition ${value ? "bg-primary" : "bg-secondary border border-border"}`}>
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-background transition ${value ? "left-6" : "left-0.5"}`} />
    </button>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md grid place-items-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-card border border-primary/30 rounded-2xl shadow-2xl shadow-primary/10 max-w-2xl w-full p-6 my-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-5">
          <h3 className="font-display text-xl">{title}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ModalActions({ onClose, onSave, saving, disabled }: { onClose: () => void; onSave: () => void; saving: boolean; disabled?: boolean }) {
  return (
    <div className="flex justify-end gap-2 mt-6">
      <button onClick={onClose} className="text-xs border border-border rounded-full px-4 py-2 text-muted-foreground hover:text-foreground">Cancel</button>
      <button onClick={onSave} disabled={saving || disabled} className="text-xs bg-gold-gradient text-primary-foreground font-medium rounded-full px-5 py-2 shadow-gold-glow disabled:opacity-50 inline-flex items-center gap-1.5">
        {saving && <Loader2 className="h-3 w-3 animate-spin" />} Save
      </button>
    </div>
  );
}

function Spinner() { return <div className="py-16 grid place-items-center"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>; }
function Empty({ hint }: { hint: string }) { return <div className="border border-dashed border-border/60 rounded-xl p-10 text-center text-sm text-muted-foreground">{hint}</div>; }
