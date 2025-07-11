
import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

interface LayoutProps {
  children: ReactNode;
  fullWidth?: boolean;
}

const Layout = ({ children, fullWidth = false }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-20">
        {fullWidth ? (
          children
        ) : (
          <div className="container mx-auto px-4 md:px-6 py-8">{children}</div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
