interface RootLayoutProps {
  children: React.ReactNode;
}
export default async function AuthLayout({ children }: RootLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* <Navbar /> */}
      <main>{children}</main>
    </div>
  );
}
