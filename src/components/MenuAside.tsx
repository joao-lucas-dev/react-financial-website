import { House, MessageCircleQuestion, Settings } from 'lucide-react'
import LogoutButton from './LoggoutButton.tsx'

const MenuAside = () => {
  return (
    <aside className="pt-28 h-screen w-52 bg-white dark:bg-black-bg hidden xl:flex flex-col justify-between shadow-lg shadow-background dark:shadow-black-bg">
      <ul>
        <li className="border-r-4 border-primary h-10 flex items-center transition-all cursor-pointer p-4">
          <a href="/" className="flex items-center">
            <House size={20} className="text-primary mr-5" />
            <span className="text-sm md:text-base text-primary">Dashboard</span>
          </a>
        </li>
        <li className="h-12 flex items-center p-4 mt-5">
          <a href="/" className="flex items-center">
            <MessageCircleQuestion
              size={20}
              className="text-zinc-500 dark:text-softGray mr-5"
            />
            <span className="text-sm md:text-base text-zinc-500 dark:text-softGray">
              Feedback
            </span>
          </a>
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
