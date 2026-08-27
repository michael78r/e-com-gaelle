import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import type { Session } from "@supabase/supabase-js";
import { ImageOff, LogOut, Pencil, Plus, ShieldAlert, Trash2, Upload, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Layout } from "@/components/Layout";
import { Pagination } from "@/components/Pagination";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { SITE_NAME } from "@/lib/contact";
import { CATEGORIES, categoryLabel, formatDate, formatPrice } from "@/lib/format";
import { ITEM_IMAGES_BUCKET, useImageUrls } from "@/lib/images";
import { ADMIN_PAGE_SIZE, fetchCatalogue, type Item, type ItemInsert } from "@/lib/items";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: `Administration — ${SITE_NAME}` },
      {
        name: "description",
        content: `Espace d'administration du catalogue ${SITE_NAME}.`,
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: `Administration — ${SITE_NAME}` },
      { property: "og:description", content: `Espace d'administration du catalogue.` },
    ],
  }),
  component: AdminPage,
  errorComponent: ({ error }) => (
    <Layout>
      <div className="mx-auto max-w-6xl px-4 py-24 text-center sm:px-6">
        <h1 className="font-display text-2xl">L'administration n'a pas pu se charger</h1>
        <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
      </div>
    </Layout>
  ),
  notFoundComponent: () => (
    <Layout>
      <div className="mx-auto max-w-6xl px-4 py-24 text-center sm:px-6">
        <h1 className="font-display text-2xl">Page introuvable</h1>
      </div>
    </Layout>
  ),
});

function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const roleQuery = useQuery({
    queryKey: ["is-admin", session?.user.id],
    enabled: Boolean(session),
    queryFn: async () => {
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: session!.user.id,
        _role: "admin",
      });
      if (error) throw error;
      return Boolean(data);
    },
  });

  if (!ready) {
    return (
      <Layout>
        <div className="mx-auto max-w-md px-4 py-24 sm:px-6">
          <div className="shimmer h-64 w-full rounded-3xl" />
        </div>
      </Layout>
    );
  }

  if (!session) return <AuthPanel />;
  if (roleQuery.isLoading) {
    return (
      <Layout>
        <div className="mx-auto max-w-md px-4 py-24 sm:px-6">
          <div className="shimmer h-40 w-full rounded-3xl" />
        </div>
      </Layout>
    );
  }
  if (!roleQuery.data) return <AccessDenied email={session.user.email ?? ""} />;

  return <AdminDashboard email={session.user.email ?? ""} />;
}

/* ───────────────────────── Authentification ───────────────────────── */

function AuthPanel() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Connexion réussie");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        toast.success("Compte créé. Vérifiez votre boîte mail si une confirmation est demandée.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Une erreur est survenue");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Layout>
      <div className="mx-auto w-full max-w-md px-4 py-16 sm:px-6 sm:py-24">
        <div className="surface fade-up p-6 sm:p-8">
          <span className="eyebrow text-clay-deep">Espace réservé</span>
          <h1 className="mt-2 font-display text-2xl">
            {mode === "signin" ? "Connexion" : "Créer un compte"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            L'administration du catalogue est réservée aux comptes administrateurs.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email">Adresse e-mail</Label>
              <Input
                id="admin-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Mot de passe</Label>
              <Input
                id="admin-password"
                type="password"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                required
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            <Button type="submit" className="w-full rounded-full" disabled={busy}>
              {mode === "signin" ? "Se connecter" : "Créer le compte"}
            </Button>
          </form>

          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="link-underline mt-5 text-sm text-muted-foreground hover:text-foreground"
          >
            {mode === "signin" ? "Pas encore de compte ? En créer un" : "J'ai déjà un compte"}
          </button>
        </div>
      </div>
    </Layout>
  );
}

function AccessDenied({ email }: { email: string }) {
  return (
    <Layout>
      <div className="mx-auto w-full max-w-lg px-4 py-16 sm:px-6 sm:py-24">
        <div className="surface fade-up p-6 sm:p-8">
          <ShieldAlert className="h-8 w-8 text-clay-deep" aria-hidden="true" />
          <h1 className="mt-4 font-display text-2xl">Accès refusé</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Le compte <span className="font-medium text-foreground">{email}</span> n'a pas le rôle
            administrateur.
          </p>
          <div className="mt-5 rounded-xl bg-secondary p-4 text-sm text-secondary-foreground">
            <p className="font-medium">Comment obtenir le rôle</p>
            <p className="mt-1.5 text-muted-foreground">
              Un administrateur doit ajouter une ligne dans la table{" "}
              <code className="rounded bg-background px-1 py-0.5 text-xs">user_roles</code> avec
              votre identifiant utilisateur et le rôle{" "}
              <code className="rounded bg-background px-1 py-0.5 text-xs">admin</code>. Pour le tout
              premier compte, cette ligne se crée directement depuis le tableau de bord de la base
              de données.
            </p>
          </div>
          <Button
            variant="outline"
            className="mt-6 rounded-full"
            onClick={() => void supabase.auth.signOut()}
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Se déconnecter
          </Button>
        </div>
      </div>
    </Layout>
  );
}

/* ───────────────────────── Tableau de bord ───────────────────────── */

const emptyForm: ItemInsert = {
  name: "",
  description: "",
  category: CATEGORIES[0].slug,
  price: 0,
  stock: 0,
  available: true,
  images: [],
};

function AdminDashboard({ email }: { email: string }) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Item | null>(null);
  const [creating, setCreating] = useState(false);
  const [toDelete, setToDelete] = useState<Item | null>(null);

  const listQuery = useQuery({
    queryKey: ["admin-items", page],
    queryFn: () => fetchCatalogue({ category: "", q: "", page, pageSize: ADMIN_PAGE_SIZE }),
    placeholderData: (previous) => previous,
  });

  useEffect(() => {
    if (listQuery.data?.outOfRange) setPage(1);
  }, [listQuery.data?.outOfRange]);

  const count = listQuery.data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(count / ADMIN_PAGE_SIZE));

  const deleteMutation = useMutation({
    mutationFn: async (item: Item) => {
      const paths = item.images.filter((path) => !path.startsWith("http"));
      if (paths.length > 0) {
        await supabase.storage.from(ITEM_IMAGES_BUCKET).remove(paths);
      }
      const { error } = await supabase.from("items").delete().eq("id", item.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Produit supprimé");
      void queryClient.invalidateQueries({ queryKey: ["admin-items"] });
      void queryClient.invalidateQueries({ queryKey: ["catalogue"] });
      setToDelete(null);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <Layout>
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="eyebrow text-clay-deep">Administration</span>
            <h1 className="mt-1.5 font-display text-3xl">Catalogue</h1>
            <p className="mt-1 text-sm text-muted-foreground">Connecté en tant que {email}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => void supabase.auth.signOut()}
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Déconnexion
            </Button>
            <Button className="rounded-full" onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Nouveau produit
            </Button>
          </div>
        </div>

        <div className="surface mt-8 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-160 text-sm">
              <caption className="sr-only">Liste des produits du catalogue</caption>
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th scope="col" className="px-5 py-3 font-medium">
                    Produit
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium">
                    Catégorie
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium">
                    Prix
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium">
                    Stock
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium">
                    Ajouté le
                  </th>
                  <th scope="col" className="px-5 py-3 text-right font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {listQuery.isLoading
                  ? Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index} className="border-b border-border/60">
                        <td colSpan={6} className="px-5 py-4">
                          <div className="shimmer h-5 w-full rounded-full" />
                        </td>
                      </tr>
                    ))
                  : listQuery.data?.items.map((item) => (
                      <tr key={item.id} className="border-b border-border/60 last:border-0">
                        <td className="px-5 py-3.5 font-medium text-foreground">{item.name}</td>
                        <td className="px-5 py-3.5 text-muted-foreground">
                          {categoryLabel(item.category)}
                        </td>
                        <td className="px-5 py-3.5">{formatPrice(item.price)}</td>
                        <td className="px-5 py-3.5 text-muted-foreground">
                          {item.available ? item.stock : "—"}
                        </td>
                        <td className="px-5 py-3.5 text-muted-foreground">
                          {formatDate(item.created_at)}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Modifier ${item.name}`}
                              onClick={() => setEditing(item)}
                            >
                              <Pencil className="h-4 w-4" aria-hidden="true" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Supprimer ${item.name}`}
                              onClick={() => setToDelete(item)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} className="mt-8" />
      </div>

      <ItemDialog
        open={creating || editing !== null}
        item={editing}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
      />

      <AlertDialog open={toDelete !== null} onOpenChange={(open) => !open && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce produit ?</AlertDialogTitle>
            <AlertDialogDescription>
              « {toDelete?.name} » sera retiré du catalogue, ainsi que ses photos. Cette action est
              irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => toDelete && deleteMutation.mutate(toDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}

/* ───────────────────────── Dialogue de création / édition ───────────────────────── */

function ItemDialog({
  open,
  item,
  onClose,
}: {
  open: boolean;
  item: Item | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<ItemInsert>(emptyForm);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (item) {
      setForm({
        name: item.name,
        description: item.description,
        category: item.category,
        price: item.price,
        stock: item.stock,
        available: item.available,
      });
      setImages(item.images);
    } else {
      setForm(emptyForm);
      setImages([]);
    }
  }, [open, item]);

  const previews = useImageUrls(images);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { ...form, images };
      if (item) {
        const { error } = await supabase.from("items").update(payload).eq("id", item.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("items").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(item ? "Produit mis à jour" : "Produit créé");
      void queryClient.invalidateQueries({ queryKey: ["admin-items"] });
      void queryClient.invalidateQueries({ queryKey: ["catalogue"] });
      onClose();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const extension = file.name.split(".").pop() ?? "jpg";
        const path = `${crypto.randomUUID()}.${extension}`;
        const { error } = await supabase.storage.from(ITEM_IMAGES_BUCKET).upload(path, file);
        if (error) throw error;
        uploaded.push(path);
      }
      setImages((current) => [...current, ...uploaded]);
      toast.success(`${uploaded.length} photo(s) ajoutée(s)`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Échec du téléversement");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (path: string) => {
    setImages((current) => current.filter((entry) => entry !== path));
    if (!path.startsWith("http")) {
      await supabase.storage.from(ITEM_IMAGES_BUCKET).remove([path]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {item ? "Modifier le produit" : "Nouveau produit"}
          </DialogTitle>
          <DialogDescription>
            Les champs marqués d'un astérisque sont obligatoires.
          </DialogDescription>
        </DialogHeader>

        <form
          id="item-form"
          onSubmit={(event) => {
            event.preventDefault();
            saveMutation.mutate();
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="item-name">Nom *</Label>
            <Input
              id="item-name"
              required
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="item-description">Description</Label>
            <Textarea
              id="item-description"
              rows={4}
              value={form.description ?? ""}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="item-category">Catégorie *</Label>
              <select
                id="item-category"
                required
                value={form.category}
                onChange={(event) => setForm({ ...form, category: event.target.value })}
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs"
              >
                {CATEGORIES.map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-price">Prix (Ar)</Label>
              <Input
                id="item-price"
                type="number"
                min={0}
                value={form.price ?? 0}
                onChange={(event) => setForm({ ...form, price: Number(event.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-stock">Stock</Label>
              <Input
                id="item-stock"
                type="number"
                min={0}
                value={form.stock ?? 0}
                onChange={(event) => setForm({ ...form, stock: Number(event.target.value) })}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-border p-3">
            <Switch
              id="item-available"
              checked={form.available ?? true}
              onCheckedChange={(checked) => setForm({ ...form, available: checked })}
            />
            <Label htmlFor="item-available" className="cursor-pointer">
              Produit disponible à la commande
            </Label>
          </div>

          <div className="space-y-3">
            <Label htmlFor="item-images">Photos</Label>
            <div className="flex flex-wrap gap-2">
              {images.map((path, index) => (
                <div
                  key={path}
                  className="relative h-24 w-24 overflow-hidden rounded-xl border border-border"
                >
                  {previews[index] ? (
                    <img
                      src={previews[index] as string}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="shimmer flex h-full w-full items-center justify-center">
                      <ImageOff className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </span>
                  )}
                  <button
                    type="button"
                    aria-label="Retirer cette photo"
                    onClick={() => void removeImage(path)}
                    className="absolute top-1 right-1 rounded-full bg-card p-1 shadow-soft"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <Input
                id="item-images"
                type="file"
                accept="image/*"
                multiple
                disabled={uploading}
                onChange={(event) => void upload(event.target.files)}
                className="max-w-xs"
              />
              {uploading && (
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Upload className="h-3.5 w-3.5 animate-pulse" aria-hidden="true" />
                  Téléversement…
                </span>
              )}
            </div>
          </div>
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" form="item-form" disabled={saveMutation.isPending || uploading}>
            {item ? "Enregistrer" : "Créer le produit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
