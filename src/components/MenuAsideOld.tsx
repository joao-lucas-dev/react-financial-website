import {
  House,
  MessageCircleQuestion,
  Settings,
  Newspaper,
  ChartColumn,
  CreditCard,
  PiggyBank,
} from "lucide-react";
import { Link } from "react-router-dom";
import LogoutButton from "./LoggoutButton.tsx";
import { useTheme } from "../context/ThemeProvider";

interface IParams {
  activePage: string;
}

const MenuAside = ({ activePage }: IParams) => {
  const { actualTheme } = useTheme();
  const navigationItems = [
    { id: "dashboard", icon: House, label: "Dashboard", path: "/dashboard" },
    {
      id: "transacoes",
      icon: Newspaper,
      label: "Transações",
      path: "/transacoes",
    },
    {
      id: "faturas",
      icon: CreditCard,
      label: "Faturas",
      path: "/faturas",
    },
    {
      id: "relatorios",
      icon: ChartColumn,
      label: "Relatórios",
      path: "/relatorios",
    },
    {
      id: "caixinhas",
      icon: PiggyBank,
      label: "Caixinhas",
      path: "/caixinhas",
    },
    {
      id: "feedback",
      icon: MessageCircleQuestion,
      label: "Feedback",
      path: "/feedback",
    },
    {
      id: "configuracoes",
      icon: Settings,
      label: "Configurações",
      path: "/configuracoes",
    },
  ];

  return (
    <aside className="fixed top-4 left-4 h-[calc(100vh-2rem)] hidden xl-lg:flex flex-col justify-between w-60 bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-2xl transition-colors font-sans">
      {/* Logo/Brand Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-teal-600 dark:text-teal-400">
          FinanceApp
        </h2>
        <p className="text-sm mt-1 text-zinc-600 dark:text-zinc-400">
          Gerencie suas finanças
        </p>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = activePage === item.id;
            const IconComponent = item.icon;

            return (
              <li key={item.id}>
                <Link
                  to={{ pathname: item.path }}
                  className={`flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200 text-sm ${
                    isActive
                      ? "bg-teal-600 text-white font-medium"
                      : "text-zinc-600 dark:text-zinc-400 font-normal hover:bg-zinc-100 dark:hover:bg-zinc-700"
                  }`}
                >
                  <IconComponent
                    size={20}
                    className={`mr-3 flex-shrink-0 ${
                      isActive
                        ? "text-white"
                        : "text-zinc-600 dark:text-zinc-400"
                    }`}
                  />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile Section */}
      <div className="pt-6 border-t border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center mb-4 p-3 rounded-lg bg-zinc-100 dark:bg-zinc-700">
          <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3 bg-teal-600 dark:bg-teal-500">
            <span className="text-white font-medium text-sm">U</span>
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

        <LogoutButton />
      </div>
    </aside>
  );
};

export default MenuAside;
