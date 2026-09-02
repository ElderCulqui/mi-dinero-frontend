import { type ReactNode } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  actions?: ReactNode;
}

export default function AppLayout({
  children,
  title,
  actions,
}: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <div className="md:pl-64">
        <Header />

        <main className="p-4 md:p-6 lg:p-8">
          {/* Page Header */}
          {(title || actions) && (
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              {title && (
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  {title}
                </h1>
              )}
              {actions && <div className="flex gap-2">{actions}</div>}
            </div>
          )}

          {/* Page Content */}
          <div className="space-y-4">{children}</div>
        </main>
      </div>
    </div>
  );
}
