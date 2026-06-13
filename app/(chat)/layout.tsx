import { cookies } from 'next/headers';
import { AppSidebar } from '@/components/app-sidebar';
import { MainNav } from '@/components/main-nav';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import Script from 'next/script';

export const experimental_ppr = true;

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const isCollapsed = cookieStore.get('sidebar:state')?.value !== 'true';

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"
        strategy="beforeInteractive"
      />
      {/* 四区导航：手机底部 / 电脑左侧 */}
      <MainNav />
      {/* 给导航让出空间：手机底部留白，电脑左侧留白 */}
      <div className="pb-16 md:pb-0 md:pl-16 h-dvh">
        <SidebarProvider defaultOpen={!isCollapsed}>
          <AppSidebar />
          <SidebarInset>{children}</SidebarInset>
        </SidebarProvider>
      </div>
    </>
  );
}
