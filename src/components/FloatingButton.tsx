import React, { useState } from 'react'
import {
  Plus,
  ChartColumnDecreasing,
  MoveDownLeft,
  MoveUpRight,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import { ISetOpenModal, ITransaction } from '../types/transactions.ts'

interface IParams {
  setOpenModal: ISetOpenModal
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
        className="bg-teal-600 text-white p-4 rounded-full shadow-lg hover:opacity-80 transition duration-300"
      >
        <Plus
          className={`${isOpen ? 'rotate-45' : 'rotate-0'} transition-all`}
        />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)} />
          <div className="absolute bottom-16 right-2 space-y-2 z-30">
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
              className="relative flex items-center bg-teal-500 text-white p-3 rounded-full shadow-lg hover:bg-teal-600 transition duration-300 transform opacity-0 scale-95 animate-fade-in-up"
            >
              <TrendingUp className="text-white" />
              <span className="absolute -left-16 bg-zinc-800 opacity-90 p-1 rounded-md text-xs">
                Receita
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
              className="relative flex items-center bg-red-600 text-white p-3 rounded-full shadow-lg hover:bg-red-700 transition duration-300 transform opacity-0 scale-95 animate-fade-in-up delay-100"
            >
              <TrendingDown className="text-white" />
              <span className="absolute -left-16 bg-zinc-800 opacity-90 p-1 rounded-md text-xs">
                Despesa
              </span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default FloatingButton
