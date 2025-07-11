
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home } from "lucide-react";
import Layout from "@/components/layout/Layout";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <Layout>
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-20">
        <div className="glass-card rounded-lg p-8 text-center max-w-lg w-full animate-fade-in-up">
          <div className="space-y-6">
            <div className="h-24 w-24 bg-tacktix-dark-light rounded-full flex items-center justify-center mx-auto">
              <span className="text-6xl font-bold text-tacktix-blue">404</span>
            </div>
            
            <h1 className="text-2xl font-bold text-white">Page Not Found</h1>
            
            <p className="text-gray-400">
              The page you're looking for doesn't exist or has been moved.
            </p>
            
            <div className="pt-6">
              <Link to="/">
                <Button variant="gradient" className="w-full sm:w-auto">
                  <Home className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
