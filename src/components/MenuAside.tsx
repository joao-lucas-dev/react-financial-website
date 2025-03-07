import { House, MessageCircleQuestion, Settings, Newspaper } from 'lucide-react'
import { Link } from 'react-router-dom'
import LogoutButton from './LoggoutButton.tsx'

interface IParams {
  activePage: string
}

const MenuAside = ({ activePage }: IParams) => {
  return (
    <aside className="fixed pt-28 h-dvh w-52 bg-white dark:bg-black-bg hidden xl:flex flex-col justify-between shadow-lg shadow-background dark:shadow-black-bg">
      <ul>
        <li
          className={`${activePage === 'dashboard' && 'border-r-4 border-primary'} h-10 flex items-center transition-all cursor-pointer p-4`}
        >
          <Link to={{ pathname: '/dashboard' }} className="flex items-center">
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
          className={`${activePage === 'transacoes' && 'border-r-4 border-primary'} h-12 flex items-center p-4 mt-5`}
        >
          <Link to={{ pathname: '/transacoes' }} className="flex items-center">
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
        <li className="h-12 flex items-center p-4 mt-5">
          <Link to={{ pathname: '/feedback' }} className="flex items-center">
            <MessageCircleQuestion
              size={20}
              className={`${activePage === 'feedback' ? 'text-primary' : 'text-zinc-500'} mr-5`}
            />
            <span className="text-sm md:text-base text-zinc-500 dark:text-softGray">
              Feedback
            </span>
          </Link>
        </li>
        <li className="h-12 flex items-center p-4 mt-5">
          <a href="/" className="flex items-center">
            <Settings
              size={20}
              className="text-zinc-500 dark:text-softGray mr-5"
            />
            <span className="text-sm md:text-base text-zinc-500 dark:text-softGray">
              Configurações
            </span>
          </a>
        </li>
      </ul>
      <div className="border-t-2 border-lightGray dark:border-gray py-6 flex justify-center items-center">
        <LogoutButton />
      </div>
    </aside>
  )
}

export default MenuAside
