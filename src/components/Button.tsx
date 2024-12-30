import React, { FC } from 'react'

interface CustomButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  title: string
}

const Button: FC<CustomButtonProps> = ({ title }) => {
  return (
    <button className="w-full h-12 bg-primary text-white rounded-lg mt-6 hover:bg-softOrange transition-all shadow-lg">
      {title}
    </button>
  )
}

export default Button
