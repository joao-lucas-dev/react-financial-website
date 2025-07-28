import React, { useState, useEffect } from "react";
import {
  House,
  MessageCircleQuestion,
  Settings,
  Newspaper,
  ChartColumn,
  CreditCard,
  PiggyBank,
  Menu,
  X,
  LogOut,
  User,
  LayoutDashboard,
  Wallet,
  BarChart3,
  HelpCircle,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeProvider";
import useAuthentication from "../hooks/useAutentication";

interface IParams {
  activePage: string;
}

interface NavigationSection {
  title: string;
  items: {
    id: string;
    icon: React.ElementType;
    label: string;
    path: string;
  }[];
}

const MenuAside = ({ activePage }: IParams) => {
  const { actualTheme } = useTheme();
  const { logout } = useAuthentication();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Organização por setores
  const navigationSections: NavigationSection[] = [
    {
      title: "Visão Geral",
      items: [
        { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
      ]
    },
    {
      title: "Movimentação",
      items: [
        { id: "transacoes", icon: Newspaper, label: "Transações", path: "/transacoes" },
        { id: "faturas", icon: CreditCard, label: "Faturas", path: "/faturas" },
      ]
    },
    {
      title: "Planejamento",
      items: [
        { id: "caixinhas", icon: PiggyBank, label: "Caixinhas", path: "/caixinhas" },
        { id: "relatorios", icon: BarChart3, label: "Relatórios", path: "/relatorios" },
      ]
    },
    {
      title: "Sistema",
      items: [
        { id: "configuracoes", icon: Settings, label: "Configurações", path: "/configuracoes" },
        { id: "feedback", icon: HelpCircle, label: "Feedback", path: "/feedback" },
      ]
    }
  ];

  // Fechar menu mobile quando mudar de rota
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Fechar menu quando clicar fora (apenas mobile)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isMobileMenuOpen && !target.closest('.mobile-menu') && !target.closest('.mobile-menu-button')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);


  const renderNavigation = (isMobile = false) => (
    <nav className={`${isMobile ? 'flex-1 py-4 overflow-y-auto scrollbar-hide' : 'flex-1 overflow-y-auto scrollbar-hide py-4'}`}>
      <div className="space-y-3 min-h-0">
        {navigationSections.map((section) =>
          section.items.map((item) => {
            const isActive = activePage === item.id;
            const IconComponent = item.icon;

            return (
              <div key={item.id} className="relative group">
                <Link
                  to={{ pathname: item.path }}
                  className={`flex items-center w-full rounded-lg transition-all duration-200 text-sm ${
                    isMobile 
                      ? 'px-4 py-3 mx-2' 
                      : 'px-3 py-3 justify-center'
                  } ${
                    isActive
                      ? "bg-teal-600 text-white font-medium shadow-lg"
                      : "text-zinc-600 dark:text-zinc-300 font-normal hover:bg-zinc-100 dark:hover:bg-zinc-700"
                  }`}
                >
                  <IconComponent
                    size={20}
                    className={`${isMobile ? 'mr-3' : ''} flex-shrink-0 ${
                      isActive
                        ? "text-white"
                        : "text-zinc-500 dark:text-zinc-400"
                    }`}
                  />
                  {isMobile && (
                    <span className="font-medium">{item.label}</span>
                  )}
                </Link>
                
                {/* Tooltip para desktop */}
                {!isMobile && (
                  <div className="absolute left-full ml-3 top-1/2 transform -translate-y-1/2 px-3 py-2 bg-zinc-800 dark:bg-zinc-700 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg">
                    {item.label}
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-zinc-800 dark:bg-zinc-700 rotate-45"></div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </nav>
  );

  const renderUserSection = (isMobile = false) => (
    <div className={`flex-shrink-0 border-t border-zinc-200 dark:border-zinc-700 ${
      isMobile ? 'px-4 py-4' : 'pt-4'
    }`}>
      {isMobile && (
        <div className="flex items-center mb-4 p-3 rounded-lg bg-zinc-100 dark:bg-zinc-700">
          <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3 bg-teal-600 dark:bg-teal-500">
            <User size={20} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-zinc-700 dark:text-zinc-200">
              Usuário
            </p>
            <p className="text-xs truncate text-zinc-600 dark:text-zinc-400">
              usuario@email.com
            </p>
          </div>
        </div>
      )}

      <div className="relative group">
        <button
          onClick={() => logout()}
          className={`flex items-center w-full text-left rounded-lg transition-all duration-200 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 ${
            isMobile ? 'px-4 py-3' : 'px-3 py-3 justify-center'
          }`}
        >
          <LogOut size={20} className={`${isMobile ? 'mr-3' : ''} flex-shrink-0`} />
          {isMobile && <span className="font-medium">Sair</span>}
        </button>
        
        {/* Tooltip para logout no desktop */}
        {!isMobile && (
          <div className="absolute left-full ml-3 top-1/2 transform -translate-y-1/2 px-3 py-2 bg-zinc-800 dark:bg-zinc-700 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg">
            Sair
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-zinc-800 dark:bg-zinc-700 rotate-45"></div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile/Tablet Menu Button - até lg (1024px) */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="mobile-menu-button fixed top-4 left-4 z-50 lg:hidden p-3 bg-white dark:bg-zinc-800 rounded-xl shadow-lg transition-colors"
      >
        {isMobileMenuOpen ? (
          <X size={24} className="text-zinc-600 dark:text-zinc-300" />
        ) : (
          <Menu size={24} className="text-zinc-600 dark:text-zinc-300" />
        )}
      </button>

      {/* Desktop Icon Sidebar - lg até 2xl (1024px - 1536px) */}
      <aside className="fixed top-4 left-4 h-[calc(100vh-2rem)] hidden lg:flex 2xl:hidden flex-col w-16 bg-white dark:bg-zinc-800 rounded-2xl p-3 shadow-2xl transition-colors font-sans z-30">
        {/* Logo/Brand Section */}
        <div className="flex-shrink-0 mb-6">
          <div className="flex items-center justify-center relative group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
              <Wallet size={20} className="text-white" />
            </div>
            
            {/* Tooltip para logo */}
            <div className="absolute left-full ml-3 top-1/2 transform -translate-y-1/2 px-3 py-2 bg-zinc-800 dark:bg-zinc-700 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg">
              FinanceApp
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-zinc-800 dark:bg-zinc-700 rotate-45"></div>
            </div>
          </div>
        </div>

        {renderNavigation(false)}
        {renderUserSection(false)}
      </aside>

      {/* Full Desktop Sidebar - 2xl+ (1536px+) */}
      <aside className="fixed top-4 left-4 h-[calc(100vh-2rem)] hidden 2xl:flex flex-col w-64 bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-2xl transition-colors font-sans z-30">
        {/* Logo/Brand Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
              <Wallet size={20} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              FinanceApp
            </h2>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 ml-11">
            Gerencie suas finanças
          </p>
        </div>

        {/* Navigation with sections */}
        <nav className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="space-y-6 min-h-0">
            {navigationSections.map((section, sectionIndex) => (
              <div key={section.title}>
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-3 text-zinc-500 dark:text-zinc-400">
                  {section.title}
                </h3>
                <ul className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = activePage === item.id;
                    const IconComponent = item.icon;

                    return (
                      <li key={item.id}>
                        <Link
                          to={{ pathname: item.path }}
                          className={`flex items-center w-full rounded-lg transition-all duration-200 text-sm px-4 py-3 ${
                            isActive
                              ? "bg-teal-600 text-white font-medium shadow-lg"
                              : "text-zinc-600 dark:text-zinc-300 font-normal hover:bg-zinc-100 dark:hover:bg-zinc-700"
                          }`}
                        >
                          <IconComponent
                            size={20}
                            className={`mr-3 flex-shrink-0 ${
                              isActive
                                ? "text-white"
                                : "text-zinc-500 dark:text-zinc-400"
                            }`}
                          />
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </nav>

        {/* User Section */}
        <div className="flex-shrink-0 border-t border-zinc-200 dark:border-zinc-700 pt-6">
          <div className="flex items-center mb-4 p-3 rounded-lg bg-zinc-100 dark:bg-zinc-700">
            <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3 bg-teal-600 dark:bg-teal-500">
              <User size={20} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-zinc-700 dark:text-zinc-200">
                Usuário
              </p>
              <p className="text-xs truncate text-zinc-600 dark:text-zinc-400">
                usuario@email.com
              </p>
            </div>
          </div>

          <button
            onClick={() => logout()}
            className="flex items-center w-full text-left rounded-lg transition-all duration-200 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-3"
          >
            <LogOut size={20} className="mr-3 flex-shrink-0" />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        </div>
      )}

      {/* Mobile Menu */}
      <aside
        className={`mobile-menu fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white dark:bg-zinc-800 shadow-2xl transform transition-transform duration-300 ease-in-out z-40 lg:hidden flex flex-col ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header */}
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
              <Wallet size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                FinanceApp
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Gerencie suas finanças
              </p>
            </div>
          </div>
        </div>

        {renderNavigation(true)}
        {renderUserSection(true)}
      </aside>

      {/* Mobile Layout Padding */}
      <div className="lg:hidden h-16" />
    </>
  );
};

export default MenuAside;