import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Gift, Wallet, ScanLine, User } from 'lucide-react';

const navItems = [
  { icon: Home, label: 'Home', path: '/dashboard' },
  { icon: Gift, label: 'Rewards', path: '/rewards' },
  { icon: ScanLine, label: 'Scan', path: '/scan' },
  { icon: Wallet, label: 'Wallet', path: '/wallet' },
  { icon: User, label: 'Profile', path: '/profile' },
];

const UserLayout = ({ children }: { children: ReactNode }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background pb-20">
      {children}
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center py-2 px-3 min-w-[56px] transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <Icon className={`w-5 h-5 ${item.label === 'Scan' ? 'w-6 h-6' : ''}`} />
                <span className="text-[10px] mt-0.5 font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default UserLayout;
