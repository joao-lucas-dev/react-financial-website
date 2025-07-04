import {
  IHandleDeleteTransaction,
  IOpenModal,
  ISetCurrentMonth,
  ISetOpenModal,
  ITransaction,
} from '../types/transactions.ts'

interface IParams {
  openModal: IOpenModal
  setOpenModal: ISetOpenModal
  handleDeleteTransaction: IHandleDeleteTransaction
  currentMonth: number
  setCurrentMonth: ISetCurrentMonth
  from: string
}

const ModalDelete = ({
  openModal,
  setOpenModal,
  handleDeleteTransaction,
  currentMonth,
  setCurrentMonth,
  from,
}: IParams) => {
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
      <div className="bg-white dark:bg-black-bg w-96 rounded-lg shadow-lg p-6 relative">
        <h2 className="text-lg font-semibold mb-6 text-center dark:text-softGray">
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
            className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 dark:text-softGray"
          >
            Cancelar
          </button>
          <button
            onClick={async () => {
              await handleDeleteTransaction(
                openModal.transaction.id,
                currentMonth,
                setCurrentMonth,
                from,
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
