import React from 'react'
import { ITransaction } from '../types/transactions.ts'

interface IParams {
  openModal: {
    isOpen: boolean
    transaction: ITransaction
    type: string
  }
  setOpenModal: React.Dispatch<
    React.SetStateAction<{
      isOpen: boolean
      transaction: ITransaction
      type: string
    }>
  >
  handleDeleteTransaction: (
    id: string,
    previewView: boolean,
    currentMonth: number,
    setCurrentMonth: React.Dispatch<number>,
  ) => Promise<void>
  previewView: boolean
  currentMonth: number
  setCurrentMonth: React.Dispatch<number>
}

const ModalDelete = ({
  openModal,
  setOpenModal,
  handleDeleteTransaction,
  previewView,
  currentMonth,
  setCurrentMonth,
}: IParams) => {
  return (
    <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white w-96 rounded-lg shadow-lg p-6 relative">
        <h2 className="text-lg font-semibold mb-6 text-center">
          Deseja realmente excluir o item?
        </h2>

        <div className="flex justify-center gap-4">
          <button
            onClick={() =>
              setOpenModal({
                isOpen: false,
                transaction: {} as ITransaction,
                type: '',
              })
            }
            className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            onClick={async () => {
              await handleDeleteTransaction(
                openModal.transaction.id,
                previewView,
                currentMonth,
                setCurrentMonth,
              )
              setOpenModal({
                isOpen: false,
                transaction: {} as ITransaction,
                type: '',
              })
            }}
            className="px-4 py-2 bg-primary hover:bg-orange-400 rounded-lg text-center text-white font-semibold text-md"
          >
            Sim, apagar!
          </button>
        </div>
      </div>
    </div>
  )
}

export default ModalDelete
