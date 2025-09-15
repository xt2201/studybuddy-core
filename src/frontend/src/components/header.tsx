
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BookOpen, 
  Calendar, 
  BarChart3, 
  Plus, 
  Menu, 
  X,
  Brain
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VIETNAMESE_LABELS } from '@/lib/constants';
import { motion, AnimatePresence } from 'framer-motion';

const navigation = [
  { name: VIETNAMESE_LABELS.dashboard, href: '/', icon: BookOpen },
  { name: VIETNAMESE_LABELS.calendar, href: '/calendar', icon: Calendar },
  { name: VIETNAMESE_LABELS.analytics, href: '/analytics', icon: BarChart3 },
];

export function Header() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white shadow-lg"
            >
              <Brain className="h-6 w-6" />
            </motion.div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                StudyBuddy
              </h1>
              <p className="text-xs text-gray-500 -mt-1">Trợ lý học tập thông minh</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link key={item.href} to={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={`relative px-4 py-2 transition-all duration-200 ${
                      isActive 
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg" 
                        : "hover:bg-gray-100/80 hover:shadow-md"
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.name}
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-md -z-10"
                      />
                    )}
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* Add Task Button */}
          <div className="flex items-center space-x-4">
            <Link to="/tasks/new">
              <Button className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">{VIETNAMESE_LABELS.create}</span>
                <span className="sm:hidden">+</span>
              </Button>
            </Link>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden py-4 border-t border-gray-200/50"
            >
              <div className="flex flex-col space-y-2">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  const Icon = item.icon;
                  
                  return (
                    <Link 
                      key={item.href} 
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        className={`w-full justify-start transition-all duration-200 ${
                          isActive 
                            ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white" 
                            : "hover:bg-gray-100/80"
                        }`}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {item.name}
                      </Button>
                    </Link>
                  );
                })}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
