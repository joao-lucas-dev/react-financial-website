import React, { useState, useMemo, useRef, useEffect } from 'react'
import MiniInfoModal from '../MiniInfoModal'
import 'react-loading-skeleton/dist/skeleton.css'
import './styles.css'
import TableSkeleton from '../TableSkeleton'
import ModalDelete from '../ModalDelete'
import useTablePreviewAux from '../../hooks/useTablePreviewAux'
import { IRow, ITransaction } from '../../types/transactions'
import ModalEdit from '../ModalEdit'
import ModalCreate from '../ModalCreate.tsx'

interface IParams {
  rows: IRow[]
  handleCreateTransaction: (
    type: 'incomes' | 'outcomes' | 'dailies',
    row: IRow,
    value: { formattedValue: string; originalValue: number },
    setValue: React.Dispatch<
      React.SetStateAction<{ formattedValue: string; originalValue: number }>
    >,
    currentMonth: number,
    setCurrentMonth: React.Dispatch<number>,
  ) => Promise<void>
  handleCreateCompleteTransaction: (
    createTransaction: ITransaction,
    currentMonth: number,
    setCurrentMonth: React.Dispatch<number>,
  ) => Promise<void>
  handleUpdateTransaction: (
    updateTransaction: ITransaction,
    currentMonth: number,
    setCurrentMonth: React.Dispatch<number>,
  ) => Promise<void>
  handleDeleteTransaction: (
    id: string,
    currentMonth: number,
    setCurrentMonth: React.Dispatch<number>,
  ) => Promise<void>
  currentMonth: number
  setCurrentMonth: React.Dispatch<number>
  openModal: {
    isOpen: boolean
    transaction: ITransaction
    type: string
  }
  setOpenModal: React.Dispatch<{
    isOpen: boolean
    transaction: ITransaction
    type: string
  }>
}

const TablePreview = ({
  rows,
  handleCreateTransaction,
  handleCreateCompleteTransaction,
  handleDeleteTransaction,
  handleUpdateTransaction,
  currentMonth,
  setCurrentMonth,
  openModal,
  setOpenModal,
}: IParams) => {
  const targetRowRef = useRef<HTMLTableRowElement>(null)
  const tableContainerRef = useRef<HTMLDivElement>(null)

  const { findTotalColor } = useTablePreviewAux()
  const [hoveredCell, setHoveredCell] = useState<{
    rowIndex: number
    colIndex: number
    tdRect: DOMRect | null
  } | null>(null)

  useEffect(() => {
    if (targetRowRef.current && tableContainerRef.current) {
      const rowTop = targetRowRef.current.offsetTop
      const containerHeight = tableContainerRef.current.clientHeight
      const rowHeight = targetRowRef.current.clientHeight

      tableContainerRef.current.scrollTo({
        top: rowTop - containerHeight / 2 + rowHeight / 2,
        behavior: 'smooth',
      })
    }
  }, [rows])

  const handleMouseEnter = (
    event: React.MouseEvent<HTMLTableCellElement>,
    rowIndex: number,
    colIndex: number,
  ) => {
    const tdRect = event.currentTarget.getBoundingClientRect()
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
        <tr
          key={row.formatted_date}
          ref={row.isToday ? targetRowRef : null}
          className="relative"
        >
          <td
            className={`${row.isToday ? 'bg-grayWhite dark:bg-zinc-800' : 'bg-white'} dark:bg-black-bg dark:text-softGray sm:relative border-b-1 p-2 border-lineGray text-sm text-center font-[600] h-[56px]`}
          >
            {row.formatted_date}
          </td>
          <td
            className={`border-b-1 p-2 border-lineGray text-sm text-center ${row.isToday ? 'bg-grayWhite dark:bg-zinc-800' : ''} dark:text-softGray sm:relative hover:cursor-pointer group hover:border h-[56px]`}
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
            className={`border-b-1 p-2 border-lineGray text-sm text-center ${row.isToday ? 'bg-grayWhite dark:bg-zinc-800' : ''} dark:text-softGray sm:relative hover:cursor-pointer group hover:border h-[56px]`}
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
            className={`border-b-1 p-2 border-lineGray text-sm text-center ${row.isToday ? 'bg-grayWhite dark:bg-zinc-800' : ''} dark:text-softGray sm:relative hover:cursor-pointer group hover:border h-[56px]`}
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
            className={`border-b-1 p-2 border-lineGray ${color} ${row.isToday ? 'bg-grayWhite dark:bg-zinc-800' : ''} font-semibold text-sm text-center h-[56px]`}
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
    setCurrentMonth,
  ])

  return (
    <>
      {rows.length > 0 ? (
        <div
          ref={tableContainerRef}
          className="w-full overflow-y-scroll scrollbar-hide flex flex-auto relative"
        >
          <table className="min-w-640 sm:w-full h-full text-left">
            <thead>
              <tr>
                <th className="sticky top-0 z-10 bg-background dark:bg-orangeDark rounded-tl-lg text-center p-4 text-gray dark:text-softGray border-b-1 border-lineGray text-sm">
                  Data
                </th>
                <th className="sticky top-0 z-10 text-center text-gray dark:text-softGray border-b-1 border-lineGray bg-background dark:bg-orangeDark text-sm">
                  Entradas
                </th>
                <th className="sticky top-0 z-10 text-center text-gray dark:text-softGray border-b-1 border-lineGray bg-background dark:bg-orangeDark text-sm">
                  Saídas
                </th>
                <th className="sticky top-0 z-10 text-center text-gray dark:text-softGray border-b-1 border-lineGray bg-background dark:bg-orangeDark text-sm">
                  Diário
                </th>
                <th className="sticky top-0 z-10 rounded-tr-lg text-center text-gray dark:text-softGray border-b-1 border-lineGray bg-background dark:bg-orangeDark text-sm">
                  Saldo
                </th>
              </tr>
            </thead>
            <tbody>{memoizedTransactions}</tbody>
          </table>
        </div>
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
                currentMonth={currentMonth}
                setCurrentMonth={setCurrentMonth}
              />
            ) : openModal.type === 'delete' ? (
              <ModalDelete
                setOpenModal={setOpenModal}
                openModal={openModal}
                handleDeleteTransaction={handleDeleteTransaction}
                currentMonth={currentMonth}
                setCurrentMonth={setCurrentMonth}
              />
            ) : (
              <ModalCreate
                openModal={openModal}
                setOpenModal={setOpenModal}
                handleCreateCompleteTransaction={
                  handleCreateCompleteTransaction
                }
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
