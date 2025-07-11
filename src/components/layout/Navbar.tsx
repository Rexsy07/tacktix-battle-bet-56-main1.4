
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, User, History, Search, LogIn, LogOut, Shield, Flame, Home, Trophy, Wallet, MessageCircle, Megaphone, Crown, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { getUserBalance } from "@/utils/wallet-utils";
import { supabase } from "@/integrations/supabase/client";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userBalance, setUserBalance] = useState(0);
  const [userProfile, setUserProfile] = useState<any>(null);
  const { user, signOut } = useAuth();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        // Fetch user balance
        const balance = await getUserBalance(user.id);
        setUserBalance(balance);
        
        // Fetch user profile to check moderator status
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_moderator, is_vip')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setUserProfile(profile);
        }
      } else {
        setUserProfile(null);
      }
    };

    fetchUserData();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged out",
        description: "You've been successfully logged out",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred during logout",
        variant: "destructive",
      });
    }
  };

  const primaryNavLinks = [
    { name: "Home", path: "/", icon: <Home className="w-4 h-4" /> },
    { name: "Play", path: "/matchmaking", icon: <Search className="w-4 h-4" /> },
    { name: "Tournaments", path: "/tournaments", icon: <Crown className="w-4 h-4" /> },
    { name: "Leaderboards", path: "/leaderboards", icon: <Trophy className="w-4 h-4" /> },
  ];

  const secondaryNavLinks = [
    { name: "Forum", path: "/forum", icon: <MessageCircle className="w-3 h-3" /> },
    { name: "News", path: "/announcements", icon: <Megaphone className="w-3 h-3" /> },
    ...(user ? [
      { name: "Profile", path: "/profile", icon: <User className="w-3 h-3" /> },
      { name: "History", path: "/history", icon: <History className="w-3 h-3" /> },
      { name: "VIP", path: "/vip", icon: <Flame className="w-3 h-3" /> },
      ...(userProfile?.is_moderator ? [{ name: "Moderator", path: "/moderator", icon: <Shield className="w-3 h-3" /> }] : [])
    ] : [])
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "glass-navbar py-0" : "py-1 bg-transparent"
      }`}
    >
      <div className="container mx-auto px-3">
        {/* Main Navigation Bar */}
        <div className="flex items-center justify-between h-10">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="relative h-5 w-5 rounded-full bg-gradient-to-br from-tacktix-blue to-tacktix-blue-dark flex items-center justify-center shadow-lg">
              <span className="font-bold text-white text-xs">T</span>
              <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 bg-tacktix-red rounded-full animate-pulse"></span>
            </div>
            <span className="font-extrabold text-sm text-gradient hidden sm:block">TacktixEdge</span>
          </Link>

          {/* Primary Navigation - Desktop */}
          <div className="hidden lg:flex items-center space-x-1 flex-1 justify-center">
            {primaryNavLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-2 py-1 rounded-md text-xs flex items-center transition-all duration-200 ${
                  location.pathname === link.path
                    ? "text-tacktix-blue font-medium bg-tacktix-blue/10"
                    : "text-gray-300 hover:text-white hover:bg-tacktix-dark-light"
                }`}
              >
                {link.icon}
                <span className="ml-1">{link.name}</span>
              </Link>
            ))}
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-1 flex-shrink-0">
            {user ? (
              <div className="flex items-center space-x-1">
                <Link to="/wallet">
                  <Button variant="ghost" size="sm" className="text-xs px-1.5 py-0.5 h-6">
                    <Wallet className="w-3 h-3 mr-1" />
                    ₦{userBalance.toLocaleString()}
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" className="text-xs h-6 px-1.5" onClick={handleLogout}>
                  <LogOut className="w-3 h-3 mr-1" />
                  Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                <Button variant="ghost" size="sm" className="text-xs h-6 px-1.5">
                  <Link to="/sign-in" className="flex items-center">
                    <LogIn className="w-3 h-3 mr-1" />
                    Sign In
                  </Link>
                </Button>
                <Button variant="gradient" size="sm" animation="pulseglow" className="text-xs h-6 px-1.5">
                  <Link to="/sign-up">Start</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-gray-200 hover:text-white focus:outline-none ml-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>

        {/* Secondary Navigation Bar - Desktop Only */}
        <div className="hidden lg:flex items-center justify-center py-0.5 border-t border-white/5">
          <div className="flex items-center space-x-2">
            {secondaryNavLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-1.5 py-0.5 rounded text-xs flex items-center transition-all duration-200 ${
                  location.pathname === link.path
                    ? "text-tacktix-blue font-medium"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                {link.icon}
                <span className="ml-1">{link.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden glass animate-fade-in p-3 mt-1">
          <div className="space-y-1">
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Main</div>
            {primaryNavLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center px-3 py-2 rounded-md text-sm ${
                  location.pathname === link.path
                    ? "bg-tacktix-blue/20 text-tacktix-blue"
                    : "text-gray-300 hover:bg-tacktix-dark-light hover:text-white"
                }`}
              >
                {link.icon}
                <span className="ml-2">{link.name}</span>
              </Link>
            ))}
            
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2 mt-4">More</div>
            {secondaryNavLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center px-3 py-2 rounded-md text-sm ${
                  location.pathname === link.path
                    ? "bg-tacktix-blue/20 text-tacktix-blue"
                    : "text-gray-300 hover:bg-tacktix-dark-light hover:text-white"
                }`}
              >
                {link.icon}
                <span className="ml-2">{link.name}</span>
              </Link>
            ))}

            {/* Mobile Auth */}
            <div className="pt-3 border-t border-white/10 mt-3">
              {user ? (
                <div className="space-y-2">
                  <Link to="/wallet" className="block">
                    <Button variant="ghost" className="w-full text-sm justify-start h-8">
                      <Wallet className="w-4 h-4 mr-2" />
                      Balance: ₦{userBalance.toLocaleString()}
                    </Button>
                  </Link>
                  <Button variant="ghost" className="w-full text-sm justify-start h-8" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="ghost" className="text-sm h-8">
                    <Link to="/sign-in" className="flex items-center w-full justify-center">
                      <LogIn className="w-4 h-4 mr-2" />
                      Sign In
                    </Link>
                  </Button>
                  <Button variant="gradient" animation="pulseglow" className="text-sm h-8">
                    <Link to="/sign-up" className="w-full">Get Started</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
