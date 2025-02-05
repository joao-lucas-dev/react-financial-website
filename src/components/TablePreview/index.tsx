import React, { useState, useMemo } from 'react'
import MiniInfoModal from '../MiniInfoModal'
import 'react-loading-skeleton/dist/skeleton.css'
import './styles.css'
import TableSkeleton from '../TableSkeleton'
import ModalDelete from '../ModalDelete'
import useTablePreviewAux from '../../hooks/useTablePreviewAux'
import { IRow, ITransaction } from '../../types/transactions'
import ModalEdit from '../ModalEdit'

interface IParams {
  rows: IRow[]
  handleCreateTransaction: (
    type: 'incomes' | 'outcomes' | 'dailies',
    row: IRow,
    value: { formattedValue: string; originalValue: number },
    setValue: React.Dispatch<
      React.SetStateAction<{ formattedValue: string; originalValue: number }>
    >,
    previewView: boolean,
    currentMonth: number,
    setCurrentMonth: React.Dispatch<number>,
  ) => Promise<void>
  handleUpdateTransaction: (
    updateTransaction: ITransaction,
    previewView: boolean,
    currentMonth: number,
    setCurrentMonth: React.Dispatch<number>,
  ) => Promise<void>
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

const TablePreview = ({
  rows,
  handleCreateTransaction,
  handleDeleteTransaction,
  handleUpdateTransaction,
  previewView,
  currentMonth,
  setCurrentMonth,
}: IParams) => {
  const { findTotalColor } = useTablePreviewAux()
  const [openModal, setOpenModal] = useState({
    isOpen: false,
    transaction: {} as ITransaction,
    type: '',
  })
  const [hoveredCell, setHoveredCell] = useState<{
    rowIndex: number
    colIndex: number
    tdRect: DOMRect | null
  } | null>(null)

  const handleMouseEnter = (
    event: React.MouseEvent<HTMLTableCellElement>,
    rowIndex: number,
    colIndex: number,
  ) => {
    const tdRect = event.currentTarget.getBoundingClientRect() // Get the <td> bounding rectangle
    setHoveredCell({ rowIndex, colIndex, tdRect })
  }

  const handleMouseLeave = () => {
    setHoveredCell(null)
  }

  const memoizedTransactions = useMemo(() => {
    return rows.map((row: IRow, rowIndex: number) => {
      const color = findTotalColor(row)

      const today = new Date()
      today.setHours(0, 0, 0)
      const transactionDate = new Date(`${row.date}T00:00:00`)

      if (transactionDate.toDateString() === today.toDateString()) {
        row.isToday = true
      }

      return (
        <tr key={row.formatted_date} className="relative">
          <td
            className={`${row.isToday ? 'bg-grayWhite' : 'bg-white'} sm:relative border-b-1 p-2 border-lineGray text-sm text-center font-[600] min-w-[153px] h-[56px]`}
          >
            {row.formatted_date}
          </td>
          <td
            className={`border-b-1 p-2 border-lineGray text-sm text-center ${row.isToday ? 'bg-grayWhite' : ''} sm:relative hover:cursor-pointer group hover:border min-w-[153px] h-[56px]`}
            onMouseEnter={(e) => handleMouseEnter(e, rowIndex, 1)}
            onMouseLeave={handleMouseLeave}
          >
            {row.incomes?.valueFormatted}
            {hoveredCell?.rowIndex === rowIndex &&
              hoveredCell?.colIndex === 1 && (
                <MiniInfoModal
                  handleCreateTransaction={(value, setValue) =>
                    handleCreateTransaction(
                      'incomes',
                      row,
                      value,
                      setValue,
                      previewView,
                      currentMonth,
                      setCurrentMonth,
                    )
                  }
                  transactions={row.incomes.transactions}
                  type="income"
                  setOpenModal={setOpenModal}
                  tdRect={hoveredCell?.tdRect}
                />
              )}
          </td>
          <td
            className={`border-b-1 p-2 border-lineGray text-sm text-center ${row.isToday ? 'bg-grayWhite' : ''} sm:relative hover:cursor-pointer group hover:border min-w-[153px] h-[56px]`}
            onMouseEnter={(e) => handleMouseEnter(e, rowIndex, 2)}
            onMouseLeave={handleMouseLeave}
          >
            {row.outcomes?.valueFormatted}
            {hoveredCell?.rowIndex === rowIndex &&
              hoveredCell?.colIndex === 2 && (
                <MiniInfoModal
                  handleCreateTransaction={(value, setValue) =>
                    handleCreateTransaction(
                      'outcomes',
                      row,
                      value,
                      setValue,
                      previewView,
                      currentMonth,
                      setCurrentMonth,
                    )
                  }
                  transactions={row.outcomes.transactions}
                  type="outcome"
                  setOpenModal={setOpenModal}
                  tdRect={hoveredCell?.tdRect}
                />
              )}
          </td>
          <td
            className={`border-b-1 p-2 border-lineGray text-sm text-center ${row.isToday ? 'bg-grayWhite' : ''} sm:relative hover:cursor-pointer group hover:border min-w-[153px] h-[56px]`}
            onMouseEnter={(e) => handleMouseEnter(e, rowIndex, 3)}
            onMouseLeave={handleMouseLeave}
          >
            {row.dailies.valueFormatted}
            {hoveredCell?.rowIndex === rowIndex &&
              hoveredCell?.colIndex === 3 && (
                <MiniInfoModal
                  handleCreateTransaction={(value, setValue) =>
                    handleCreateTransaction(
                      'dailies',
                      row,
                      value,
                      setValue,
                      previewView,
                      currentMonth,
                      setCurrentMonth,
                    )
                  }
                  transactions={row.dailies.transactions}
                  type="daily"
                  setOpenModal={setOpenModal}
                  tdRect={hoveredCell?.tdRect}
                />
              )}
          </td>
          <td
            className={`border-b-1 p-2 border-lineGray ${color} ${row.isToday ? 'bg-grayWhite' : ''} font-semibold text-sm text-center min-w-[153px] h-[56px]`}
          >
            {row.total.valueFormatted}
          </td>
        </tr>
      )
    })
  }, [
    rows,
    findTotalColor,
    setOpenModal,
    handleCreateTransaction,
    hoveredCell,
    currentMonth,
    previewView,
    setCurrentMonth,
  ])

  return (
    <>
      {rows.length > 0 ? (
        <table className="min-w-640 sm:w-full h-full text-left rounded-lg">
          <thead>
            <tr>
              <th className="sticky top-0 z-10 bg-background rounded-tl-lg text-center p-4 text-gray border-b-1 border-lineGray  text-sm">
                Data
              </th>
              <th className="sticky top-0 z-10 text-center text-gray border-b-1 border-lineGray bg-background text-sm">
                Entradas
              </th>
              <th className="sticky top-0 z-10 text-center text-gray border-b-1 border-lineGray bg-background text-sm">
                Saídas
              </th>
              <th className="sticky top-0 z-10 text-center text-gray border-b-1 border-lineGray bg-background text-sm">
                Diário
              </th>
              <th className="sticky top-0 z-10 rounded-tr-lg text-center text-gray border-b-1 border-lineGray bg-background text-sm">
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
            {openModal.type === 'edit' ? (
              <ModalEdit
                openModal={openModal}
                setOpenModal={setOpenModal}
                handleUpdateTransaction={handleUpdateTransaction}
                previewView={previewView}
                currentMonth={currentMonth}
                setCurrentMonth={setCurrentMonth}
              />
            ) : (
              <ModalDelete
                setOpenModal={setOpenModal}
                openModal={openModal}
                handleDeleteTransaction={handleDeleteTransaction}
                previewView={previewView}
                currentMonth={currentMonth}
                setCurrentMonth={setCurrentMonth}
              />
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default TablePreview
