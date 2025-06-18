import React, { useState } from 'react'
import {
  Plus,
  ChartColumnDecreasing,
  MoveDownLeft,
  MoveUpRight,
} from 'lucide-react'
import { ITransaction } from '../types/transactions.ts'

interface IParams {
  setOpenModal: React.Dispatch<{
    isOpen: boolean
    transaction: ITransaction
    type: string
    button?: string
  }>
}

const FloatingButton = ({ setOpenModal }: IParams) => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div className="fixed bottom-10 right-10 z-30">
      <button
        onClick={toggleMenu}
        className="bg-primary text-white p-4 rounded-full shadow-lg hover:bg-softOrange transition duration-300"
      >
        <Plus
          className={`${isOpen ? 'rotate-45' : 'rotate-0'} transition-all`}
        />
      </button>

      {isOpen && (
        <div className="absolute bottom-16 right-2 space-y-2">
          <button
            onClick={() => {
              setIsOpen(false)
              setOpenModal({
                isOpen: true,
                transaction: {} as ITransaction,
                type: 'create',
                button: 'income',
              })
            }}
            className="relative flex items-center bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600 transition duration-300 transform opacity-0 scale-95 animate-fade-in-up"
          >
            <MoveDownLeft />
            <span className="absolute -left-16 bg-zinc-800 opacity-90 p-1 rounded-md text-xs">
              Entrada
            </span>
          </button>

          <button
            onClick={() => {
              setIsOpen(false)
              setOpenModal({
                isOpen: true,
                transaction: {} as ITransaction,
                type: 'create',
                button: 'outcome',
              })
            }}
            className="relative flex items-center bg-red-500 text-white p-3 rounded-full shadow-lg hover:bg-red-600 transition duration-300 transform opacity-0 scale-95 animate-fade-in-up delay-100"
          >
            <MoveUpRight />
            <span className="absolute -left-14 bg-zinc-800 opacity-90 p-1 rounded-md text-xs">
              Saída
            </span>
          </button>

          <button
            onClick={() => {
              setIsOpen(false)
              setOpenModal({
                isOpen: true,
                transaction: {} as ITransaction,
                type: 'create',
                button: 'daily',
              })
            }}
            className="relative flex items-center bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-400 transition duration-300 transform opacity-0 scale-95 animate-fade-in-up delay-200"
          >
            <ChartColumnDecreasing />
            <span className="absolute -left-14 bg-zinc-800 opacity-90 p-1 rounded-md text-xs">
              Diário
            </span>
          </button>
        </div>
      )}
    </div>
  )
}

export default FloatingButton
