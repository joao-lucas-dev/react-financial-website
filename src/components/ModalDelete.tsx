import { useState } from 'react'
import {
  EditMode,
  IHandleDeleteInstallmentTransaction,
  IHandleDeleteTransaction,
  InstallmentEditMode,
  IOpenModal,
  ISetCurrentMonth,
  ISetOpenModal,
  ITransaction,
} from '../types/transactions.ts'
import InstallmentTransactionOptions from './InstallmentTransactionOptions.tsx'
import RecurringTransactionOptions from './RecurringTransactionOptions.tsx'

interface IParams {
  openModal: IOpenModal
  setOpenModal: ISetOpenModal
  handleDeleteTransaction: IHandleDeleteTransaction
  handleDeleteRecurringTransaction?: (
    id: string,
    editMode: EditMode,
    currentMonth: number,
    setCurrentMonth: ISetCurrentMonth,
    from: string,
  ) => Promise<void>
  handleDeleteInstallmentTransaction?: IHandleDeleteInstallmentTransaction
  currentMonth: number
  setCurrentMonth: ISetCurrentMonth
  from: string
}

const ModalDelete = ({
  openModal,
  setOpenModal,
  handleDeleteTransaction,
  handleDeleteRecurringTransaction,
  handleDeleteInstallmentTransaction,
  currentMonth,
  setCurrentMonth,
  from,
}: IParams) => {
  console.log(openModal.transaction)
  const [editMode, setEditMode] = useState<EditMode>('instance_only')
  const [installmentEditMode, setInstallmentEditMode] = useState<InstallmentEditMode>('installment_only')
  
  const isRecurringTransaction = openModal.transaction.is_recurring === true ||
    (openModal.transaction.recurrence_pattern && 
    openModal.transaction.recurrence_pattern !== null && 
    openModal.transaction.recurrence_pattern !== undefined &&
    openModal.transaction.recurrence_pattern !== '')

  const isInstallmentTransaction = openModal.transaction.isinstallment
                              
  const handleDelete = async () => {
    if (isRecurringTransaction && handleDeleteRecurringTransaction) {
      await handleDeleteRecurringTransaction(
        openModal.transaction.id,
        editMode,
        currentMonth,
        setCurrentMonth,
        from,
      )
    } else if (isInstallmentTransaction && handleDeleteInstallmentTransaction) {
      await handleDeleteInstallmentTransaction(
        openModal.transaction.id,
        installmentEditMode,
        currentMonth,
        setCurrentMonth,
        from,
      )
    } else {
      await handleDeleteTransaction(
        openModal.transaction.id,
        currentMonth,
        setCurrentMonth,
        from,
      )
    }
    
    setOpenModal({
      isOpen: false,
      transaction: {} as ITransaction,
      type: '',
    })
  }

  return (
    <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50" onClick={e => {
      if (e.target === e.currentTarget) {
        setOpenModal({
          isOpen: false,
          transaction: {} as ITransaction,
          type: '',
        })
      }
    }}>
      <div className={`bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl p-8 relative transition-colors ${(isRecurringTransaction || isInstallmentTransaction) ? 'w-[600px] max-w-[90vw]' : 'w-96'}`}>
        <h2 className="text-xl font-bold mb-6 text-center text-zinc-700 dark:text-zinc-200">
          Deseja realmente excluir o item?
        </h2>

        {isRecurringTransaction && (
          <div className="mb-6">
            <RecurringTransactionOptions
              value={editMode}
              onChange={setEditMode}
              action="delete"
            />
          </div>
        )}

        {isInstallmentTransaction && !isRecurringTransaction && (
          <div className="mb-6">
            <InstallmentTransactionOptions
              value={installmentEditMode}
              onChange={setInstallmentEditMode}
              action="delete"
              currentInstallment={openModal.transaction.installment_count}
              totalInstallments={openModal.transaction.installment_all}
            />
          </div>
        )}

        <div className="flex justify-center gap-4">
          <button
            onClick={() =>
              setOpenModal({
                isOpen: false,
                transaction: {} as ITransaction,
                type: '',
              })
            }
            className="px-6 py-3 border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleDelete}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 rounded-lg text-center text-white font-semibold transition-colors"
          >
            Sim, apagar!
          </button>
        </div>
      </div>
    </div>
  )
}

export default ModalDelete
