import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  FREE_SHIPPING_LIMIT,
  SHIPPING_FEE,
  type Product,
  type SizeOption,
} from "./data";

export interface CartItem {
  key: string;
  productId: string;
  name: string;
  sizeLabel: string;
  unitPrice: number;
  qty: number;
  lotCodes: string[];
  img: string;
}

interface CartCtx {
  items: CartItem[];
  add: (p: Product, s: SizeOption, qty?: number) => void;
  remove: (key: string) => void;
  setQty: (key: string, qty: number) => void;
  clear: () => void;
  subtotal: number;
  shipping: number;
  total: number;
  count: number;
  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  toast: string | null;
}

const Ctx = createContext<CartCtx | null>(null);
const STORAGE_KEY = "patik-cart-v1";

function load(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (i) =>
        i && typeof i.key === "string" && typeof i.qty === "number" && i.qty > 0
    );
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(load);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* saklama kapalıysa sepet oturumluk çalışmaya devam eder */
    }
  }, [items]);

  const showToast = useCallback((msg: string) => {
    window.clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = window.setTimeout(() => setToast(null), 3200);
  }, []);

  const add = useCallback(
    (p: Product, s: SizeOption, qty = 1) => {
      const key = `${p.id}:${s.id}`;
      setItems((prev) => {
        const existing = prev.find((i) => i.key === key);
        if (existing) {
          return prev.map((i) =>
            i.key === key ? { ...i, qty: Math.min(i.qty + qty, 20) } : i
          );
        }
        return [
          ...prev,
          {
            key,
            productId: p.id,
            name: p.name,
            sizeLabel: s.label,
            unitPrice: s.price,
            qty,
            lotCodes: p.lotCodes,
            img: p.img,
          },
        ];
      });
      showToast(`Sepete eklendi: ${p.name} · ${s.label}`);
    },
    [showToast]
  );

  const remove = useCallback((key: string) => {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.key !== key)
        : prev.map((i) => (i.key === key ? { ...i, qty: Math.min(qty, 20) } : i))
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const { subtotal, shipping, total, count } = useMemo(() => {
    const sub = items.reduce((a, i) => a + i.unitPrice * i.qty, 0);
    const ship = sub === 0 || sub >= FREE_SHIPPING_LIMIT ? 0 : SHIPPING_FEE;
    return {
      subtotal: sub,
      shipping: ship,
      total: sub + ship,
      count: items.reduce((a, i) => a + i.qty, 0),
    };
  }, [items]);

  const value: CartCtx = {
    items,
    add,
    remove,
    setQty,
    clear,
    subtotal,
    shipping,
    total,
    count,
    cartOpen,
    setCartOpen,
    toast,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart(): CartCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCart, CartProvider içinde kullanılmalı");
  return v;
}
