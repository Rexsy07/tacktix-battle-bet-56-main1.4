
import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Youtube, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-white/5 pt-12 pb-6 mt-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Logo and Description */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-2">
              <div className="relative h-8 w-8 rounded-full bg-gradient-to-br from-tacktix-blue to-tacktix-blue-dark flex items-center justify-center">
                <span className="font-bold text-white text-lg">T</span>
              </div>
              <span className="font-extrabold text-xl text-gradient">TacktixEdge</span>
            </Link>
            <p className="mt-4 text-gray-400 text-sm">
              The ultimate platform for Call of Duty Mobile players to compete, bet, and earn.
              Test your skills and tactics in high-stakes matches across various game modes.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="text-gray-400 hover:text-tacktix-blue transition-colors">
                <Facebook size={18} />
              </a>
              <a href="#" className="text-gray-400 hover:text-tacktix-blue transition-colors">
                <Twitter size={18} />
              </a>
              <a href="#" className="text-gray-400 hover:text-tacktix-blue transition-colors">
                <Instagram size={18} />
              </a>
              <a href="#" className="text-gray-400 hover:text-tacktix-blue transition-colors">
                <Youtube size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {["Home", "Matchmaking", "Wallet", "History", "Leaderboards"].map((item) => (
                <li key={item}>
                  <Link
                    to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                    className="text-gray-400 hover:text-tacktix-blue transition-colors text-sm"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-white mb-4">Resources</h3>
            <ul className="space-y-2">
              {["How It Works", "Game Modes", "Dispute Resolution", "FAQs", "Support"].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-tacktix-blue transition-colors text-sm"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-2">
              {["Terms of Service", "Privacy Policy", "Refund Policy", "Responsible Gaming", "Contact Us"].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-tacktix-blue transition-colors text-sm"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <a href="mailto:info@tacktixedge.com" className="flex items-center text-sm text-gray-400 hover:text-tacktix-blue transition-colors">
                <Mail size={16} className="mr-2" />
                info@tacktixedge.com
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/5 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} TacktixEdge. All rights reserved.
          </p>
          <p className="text-xs text-gray-500 mt-2 md:mt-0">
            Not affiliated with Call of Duty Mobile or Activision. All game assets belong to their respective owners.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
