import { Link, useLocation } from "wouter";
import { Brain, Shield, Search, FlaskConical, FileText, Gauge, User, Settings, Code } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const [location] = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/", icon: Gauge },
    { name: "Vulnerability Search", href: "/vulnerability-search", icon: Search },
    { name: "Risk Assessment", href: "/risk-assessment", icon: Shield },
    { name: "Test Environment", href: "/test-environment", icon: FlaskConical },
    { name: "Exploit Development", href: "/exploit-development", icon: Code },
    { name: "Reports", href: "/reports", icon: FileText },
  ];

  return (
    <div className="w-64 bg-dark-800 border-r border-dark-700 flex-shrink-0" data-testid="sidebar">
      <div className="flex flex-col h-full">
        {/* Logo & Brand */}
        <div className="p-6 border-b border-dark-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Brain className="text-white text-xl" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">CyberMoriarty</h1>
              <p className="text-xs text-dark-400">AI Security Platform</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <Link key={item.name} href={item.href}>
                <a
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2.5 rounded-lg font-medium transition-colors",
                    isActive
                      ? "bg-primary text-white"
                      : "text-dark-300 hover:bg-dark-700 hover:text-white"
                  )}
                  data-testid={`nav-${item.name.toLowerCase().replace(' ', '-')}`}
                >
                  <Icon size={20} />
                  <span>{item.name}</span>
                </a>
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-dark-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <User className="text-white text-sm" size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Security Analyst</p>
              <p className="text-xs text-dark-400 truncate">analyst@company.com</p>
            </div>
            <button 
              className="text-dark-400 hover:text-white transition-colors"
              data-testid="user-settings"
            >
              <Settings size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
