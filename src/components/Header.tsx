import { AlignJustify } from 'lucide-react'
import LogoIcon from '../icons/LogoIcon'

interface IParams {
  title: string
}

const Header = ({ title }: IParams) => {
  return (
    <header className="fixed z-40 w-full h-24 top-0">
      <div className="w-full h-24 flex bg-white dark:bg-black-bg py-4">
        <div className="hidden xl:flex w-52 h-full justify-center items-center">
          <LogoIcon />
        </div>

        <div className="w-full flex justify-between items-center px-6 md:px-10">
          <div className="flex xl:hidden h-full justify-center items-center">
            <AlignJustify size={24} className="text-gray" />
          </div>

          <h1 className="text-xl md:text-2xl text-gray dark:text-softGray font-semibold">
            {title}
          </h1>
        </div>
      </div>
    </header>
  )
}

export default Header
