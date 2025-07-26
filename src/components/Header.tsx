import { useState } from 'react'
import {
  AlignJustify,
  House,
  MessageCircleQuestion,
  Settings,
  X,
  Newspaper,
  ChartColumn
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import LogoIcon from '../icons/LogoIcon'
import LogoutButton from './LoggoutButton.tsx'
import { Link } from 'react-router-dom'

interface IParams {
  title: string
  activePage: string
}

const Header = ({ title, activePage }: IParams) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="hidden lg:fixed z-20 w-full h-24 top-0">
      <div className="w-full h-24 flex bg-white dark:bg-black-bg py-4">
        <div className="hidden xl-lg:flex w-52 h-full justify-center items-center">
          <LogoIcon />
        </div>

        <div className="w-full flex justify-between items-center px-6 md:px-10">
          <h1 className="text-xl md:text-2xl text-gray dark:text-softGray font-semibold">
            {title}
          </h1>

          <button
            className="flex xl-lg:hidden h-full justify-center items-center"
            onClick={() => setIsOpen(true)}
          >
            <AlignJustify size={24} className="text-gray" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed h-[100dvh] top-0 right-0 w-full sm:w-64 md:w-60 xl:w-60 bg-white dark:bg-black-bg shadow-lg flex flex-col pt-6 pr-6 pl-6 z-50"
          >
            <button className="self-end mb-6" onClick={() => setIsOpen(false)}>
              <X size={24} className="text-gray" />
            </button>

            <nav className="flex flex-col space-y-4 text-lg font-semibold text-gray dark:text-softGray flex-grow">
              <ul className="flex-grow pb-6">
                <li
                  className={`${activePage === 'dashboard' && 'border-l-4 border-primary'} h-10 flex items-center transition-all cursor-pointer p-4`}
                >
                  <Link
                    to={{ pathname: '/dashboard' }}
                    className="flex items-center"
                  >
                    <House
                      size={20}
                      className={`${activePage === 'dashboard' ? 'text-primary' : 'text-zinc-500'} mr-5`}
                    />
                    <span
                      className={`text-sm md:text-base ${activePage === 'dashboard' ? 'text-primary' : 'text-zinc-500'}`}
                    >
                      Dashboard
                    </span>
                  </Link>
                </li>
                <li
                  className={`${activePage === 'transacoes' && 'border-l-4 border-primary'} h-12 flex items-center p-4 mt-5`}
                >
                  <Link
                    to={{ pathname: '/transacoes' }}
                    className="flex items-center text-zinc-500 hover:text-primary"
                  >
                    <Newspaper
                      size={20}
                      className={`${activePage === 'transacoes' ? 'text-primary' : 'text-zinc-500'} mr-5`}
                    />
                    <span
                      className={`text-sm md:text-base ${activePage === 'transacoes' ? 'text-primary' : 'text-zinc-500'} dark:text-softGray`}
                    >
                      Transações
                    </span>
                  </Link>
                </li>
                <li
                  className={`${activePage === 'relatorios' && 'border-l-4 border-primary'} h-12 flex items-center p-4 mt-5`}
                >
                  <Link
                    to={{ pathname: '/relatorios' }}
                    className="flex items-center text-zinc-500 hover:text-primary"
                  >
                    <ChartColumn
                      size={20}
                      className={`${activePage === 'relatorios' ? 'text-primary' : 'text-zinc-500'} mr-5`}
                    />
                    <span
                      className={`text-sm md:text-base ${activePage === 'relatorios' ? 'text-primary' : 'text-zinc-500'} dark:text-softGray`}
                    >
                      Relatórios
                    </span>
                  </Link>
                </li>
                <li
                  className={`${activePage === 'feedback' && 'border-r-4 border-primary'} h-12 flex items-center p-4 mt-5`}
                >
                  <Link
                    to={{ pathname: '/feedback' }}
                    className="flex items-center text-zinc-500 hover:text-primary"
                  >
                    <MessageCircleQuestion
                      size={20}
                      className="dark:text-softGray mr-5"
                    />
                    <span className="text-sm md:text-base dark:text-softGray">
                      Feedback
                    </span>
                  </Link>
                </li>
                <li className="h-12 flex items-center p-4 mt-5">
                  <a
                    href="/"
                    className="flex items-center text-zinc-500 hover:text-primary"
                  >
                    <Settings size={20} className=" dark:text-softGray mr-5" />
                    <span className="text-sm md:text-base dark:text-softGray">
                      Configurações
                    </span>
                  </a>
                </li>
              </ul>
              <div className="border-t-2 border-lightGray dark:border-gray py-6 flex justify-center items-center">
                <LogoutButton />
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

export default Header
