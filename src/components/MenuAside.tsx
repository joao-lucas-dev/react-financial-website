import {
  BadgeHelp,
  House,
  MessageCircleQuestion,
  Settings,
  Tags,
} from 'lucide-react'

const MenuAside = () => {
  return (
    <aside className="pt-28 h-screen w-52 bg-white hidden xl:flex flex-col justify-between shadow-lg shadow-background">
      <ul>
        <li className="border-r-4 border-primary h-10 flex items-center transition-all cursor-pointer p-4">
          <a href="/" className="flex items-center">
            <House size={20} className="text-primary mr-5" />
            <span className="text-sm md:text-base text-primary">Dashboard</span>
          </a>
        </li>
        <li className="h-12 flex items-center p-4 mt-5">
          <a href="/" className="flex items-center">
            <Tags size={20} className="text-zinc-500 mr-5" />
            <span className="text-sm md:text-base text-zinc-500">
              Categorias
            </span>
          </a>
        </li>
        <li className="h-12 flex items-center p-4 mt-5">
          <a href="/" className="flex items-center">
            <MessageCircleQuestion size={20} className="text-zinc-500 mr-5" />
            <span className="text-sm md:text-base text-zinc-500">Feedback</span>
          </a>
        </li>
        <li className="h-12 flex items-center p-4 mt-5">
          <a href="/" className="flex items-center">
            <BadgeHelp size={20} className="text-zinc-500 mr-5" />
            <span className="text-sm md:text-base text-zinc-500">Ajuda</span>
          </a>
        </li>
        <li className="h-12 flex items-center p-4 mt-5">
          <a href="/" className="flex items-center">
            <Settings size={20} className="text-zinc-500 mr-5" />
            <span className="text-sm md:text-base text-zinc-500">
              Configurações
            </span>
          </a>
        </li>
      </ul>
      <div className="border-t-2 border-lightGray py-6 flex justify-center items-center">
        {/* <LogoutButton /> */}
      </div>
    </aside>
  )
}

export default MenuAside
