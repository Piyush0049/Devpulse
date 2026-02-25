"use client";

import { Sidebar } from "./Sidebar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#05050d] bg-grid">
      <Sidebar />
      <main className="ml-[260px] min-h-screen">
        <div className="max-w-[1320px] mx-auto p-6 lg:p-7">{children}</div>
      </main>
    </div>
  );
}
