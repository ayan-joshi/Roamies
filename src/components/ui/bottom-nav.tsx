"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Shape = "square" | "circle" | "diamond";

const items: { href: string; label: string; shape: Shape }[] = [
  { href: "/feed", label: "Feed", shape: "square" },
  { href: "/intros", label: "Intros", shape: "circle" },
  { href: "/trips", label: "My trips", shape: "diamond" },
];

function Icon({ shape, active }: { shape: Shape; active: boolean }) {
  const fill = active ? "bg-ink border-ink" : "border-ink2";
  if (shape === "square") return <span className={`mt-2 block h-4 w-5 rounded-[2px] border-2 ${fill}`} />;
  if (shape === "circle") return <span className={`mt-2 block size-[18px] rounded-full border-2 ${fill}`} />;
  return <span className={`mt-2.5 block size-3.5 rotate-45 border-2 ${fill}`} />;
}

export function BottomNav({ introCount, basePath = "" }: { introCount: number; basePath?: string }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className="sticky bottom-0 z-10 border-t-[1.5px] border-line bg-paper px-1 pt-1.5 pb-[max(10px,env(safe-area-inset-bottom))]">
      <ul className="grid grid-cols-3">
        {items.map(({ href: path, label, shape }) => {
          const href = basePath + path;
          const active = pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className="relative flex min-h-14 flex-col items-center justify-center gap-[5px] rounded-[10px]"
              >
                {active && <span aria-hidden className="absolute top-0 size-2.5 rounded-full bg-pin" />}
                <span className="relative">
                  <Icon shape={shape} active={active} />
                  {path === "/intros" && introCount > 0 && (
                    <span className="absolute -top-0 -right-4 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-pin px-1 font-mono text-[11px] font-bold text-white">
                      {introCount}
                      <span className="sr-only"> new intros</span>
                    </span>
                  )}
                </span>
                <span className={`text-[12.5px] ${active ? "font-extrabold" : "font-semibold text-ink2"}`}>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
