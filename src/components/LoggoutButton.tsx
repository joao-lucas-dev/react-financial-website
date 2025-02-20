import { LogOut } from 'lucide-react'
import useAuthentication from '../hooks/useAutentication.ts'

const LogoutButton = () => {
  const { logout } = useAuthentication()

  return (
    <button
      className="flex justify-center items-center group transition-all"
      onClick={() => logout()}
    >
      <div className="block md:hidden">
        <LogOut
          size={14}
          className="group-hover:text-primary text-zinc-500 transition-all rotate-180"
        />
      </div>
      <div className="hidden md:block">
        <LogOut
          size={16}
          className="group-hover:text-primary text-zinc-500 transition-all rotate-180"
        />
      </div>
      <span className="ml-2 text-sm md:text-base text-zinc-500 group-hover:text-primary transition-all">
        Sair
      </span>
    </button>
  )
}

export default LogoutButton
