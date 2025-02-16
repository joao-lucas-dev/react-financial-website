import { FC } from 'react'
import { FcGoogle } from 'react-icons/fc'

interface IGoogleButton {
  title: string
}

const GoogleButton: FC<IGoogleButton> = ({ title }) => {
  return (
    <form>
      <button className="flex justify-center items-center w-full h-12 p-2 border border-softGray bg-white rounded-lg group hover:bg-red-500 transition-all">
        <FcGoogle className="mr-2 group-hover:hidden" />

        <span className="group-hover:text-white">{title}</span>
      </button>
    </form>
  )
}

export default GoogleButton
