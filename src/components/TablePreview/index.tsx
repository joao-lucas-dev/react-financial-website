import { useEffect, useState, useMemo } from 'react'
import MiniInfoModal from '../MiniInfoModal'

import 'react-loading-skeleton/dist/skeleton.css'
import './styles.css'
import TableSkeleton from '../TableSkeleton'
import useDashboardContext from '../../hook/useDashboardContext'
import useTablePreviewAux from '../../hook/useTablePreviewAux'
import { ITransaction, IItem } from '../../types/transactions'

const TablePreview: React.FC = () => {
  const { transactions } = useDashboardContext()
  const { findTotalColor, handleGetAllTransactions, handleDeleteTransaction } =
    useTablePreviewAux()
  const [isMiniInfoVisible, setIsMiniInfoVisible] = useState(false)
  const [openModal, setOpenModal] = useState({
    isOpen: false,
    item: {} as IItem,
    type: '',
  })

  useEffect(() => {
    handleGetAllTransactions()
  }, [handleGetAllTransactions])

  const memoizedTransactions = useMemo(() => {
    return transactions.map((item: ITransaction, index) => {
      const color = findTotalColor(item)

      return (
        <tr key={item.formatted_date} className="relative">
          <td
            className={`${index === 3 ? 'bg-grayWhite' : 'bg-white'} sticky left-0 z-auto sm:relative border-b-1 p-2 border-lineGray text-sm text-center group`}
          >
            {item.formatted_date}
          </td>
          <td
            className={`border-b-1 p-2 border-lineGray text-sm text-center ${index === 3 ? 'bg-grayWhite' : ''} sm:relative hover:cursor-pointer group hover:border`}
            onMouseEnter={() => setIsMiniInfoVisible(!isMiniInfoVisible)}
            onMouseLeave={() => setIsMiniInfoVisible(!isMiniInfoVisible)}
          >
            {item.incomes.valueFormatted}
            <MiniInfoModal
              item={item}
              type="incomes"
              isMiniInfoVisible={isMiniInfoVisible}
              setOpenModal={setOpenModal}
            />
          </td>
          <td
            className={`border-b-1 p-2 border-lineGray text-sm text-center ${index === 3 ? 'bg-grayWhite' : ''} sm:relative hover:cursor-pointer group hover:border`}
            onMouseEnter={() => setIsMiniInfoVisible(!isMiniInfoVisible)}
            onMouseLeave={() => setIsMiniInfoVisible(!isMiniInfoVisible)}
          >
            {item.outcomes.valueFormatted}
            <MiniInfoModal
              item={item}
              type="outcomes"
              isMiniInfoVisible={isMiniInfoVisible}
              setOpenModal={setOpenModal}
            />
          </td>
          <td
            className={`border-b-1 p-2 border-lineGray text-sm text-center ${index === 3 ? 'bg-grayWhite' : ''} sm:relative hover:cursor-pointer group hover:border`}
            onMouseEnter={() => setIsMiniInfoVisible(!isMiniInfoVisible)}
            onMouseLeave={() => setIsMiniInfoVisible(!isMiniInfoVisible)}
          >
            {item.dailies.valueFormatted}
            <MiniInfoModal
              item={item}
              type="dailies"
              isMiniInfoVisible={isMiniInfoVisible}
              setOpenModal={setOpenModal}
            />
          </td>
          <td
            className={`border-b-1 p-2 border-lineGray ${color} ${index === 3 ? 'bg-grayWhite' : ''} font-semibold text-sm text-center`}
          >
            {item.total.valueFormatted}
          </td>
        </tr>
      )
    })
  }, [transactions, findTotalColor, isMiniInfoVisible, setOpenModal])

  return (
    <>
      {transactions.length > 0 ? (
        <table className="min-w-640 sm:w-full h-full text-left rounded-lg">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-background rounded-tl-lg text-center p-4 text-gray border-b-1 border-lineGray  text-sm">
                Data
              </th>
              <th className="text-center text-gray border-b-1 border-lineGray bg-background text-sm">
                Entradas
              </th>
              <th className="text-center text-gray border-b-1 border-lineGray bg-background text-sm">
                Saídas
              </th>
              <th className="text-center text-gray border-b-1 border-lineGray bg-background text-sm">
                Diário
              </th>
              <th className="rounded-tr-lg text-center text-gray border-b-1 border-lineGray bg-background text-sm">
                Saldo
              </th>
            </tr>
          </thead>
          <tbody>{memoizedTransactions}</tbody>
        </table>
      ) : (
        <TableSkeleton />
      )}

      {openModal.isOpen && (
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
                    item: {} as IItem,
                    type: '',
                  })
                }
                className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  await handleDeleteTransaction(openModal.item.id)
                  setOpenModal({
                    isOpen: false,
                    item: {} as IItem,
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
      )}
    </>
  )
}

export default TablePreview
