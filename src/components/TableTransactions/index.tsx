import React, { useMemo, useState, useEffect } from 'react'
import 'react-loading-skeleton/dist/skeleton.css'
import CategoryIcon from '../CategoryIcon'
import { EllipsisVertical, Search, MessageCircleQuestion } from 'lucide-react'
import './styles.css'
import { DateTime } from 'luxon'
import { typeMap } from '../../common/constants'
import ModalEdit from '../ModalEdit.tsx'
import ModalDelete from '../ModalDelete.tsx'
import ModalCreate from '../ModalCreate.tsx'
import { ITransaction } from '../../types/transactions'

interface TableRecentTransactionsProps {
  recentTransactions: ITransaction[]
  onSort?: (field: string, order: 'asc' | 'desc') => void
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  openModal: {
    isOpen: boolean
    transaction: ITransaction
    type: string
  }
  setOpenModal: React.Dispatch<React.SetStateAction<{
    isOpen: boolean
    transaction: ITransaction
    type: string
  }>>
  handleUpdateTransaction: any
  handleDeleteTransaction: any
  currentMonth: number
  setCurrentMonth: any
  categories: any[]
  from: string
  searchTerm?: string
}

const ITEMS_PER_PAGE = 7;

const TableRecentTransactions = ({ recentTransactions, onSort, sortBy, sortOrder, openModal, setOpenModal, handleUpdateTransaction, handleDeleteTransaction, currentMonth, setCurrentMonth, categories, from, searchTerm = '' }: TableRecentTransactionsProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [recentTransactions]);

  const filteredTransactions = useMemo(() => {
    if (!searchTerm) return recentTransactions;
    return recentTransactions.filter(t =>
      t.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [recentTransactions, searchTerm]);

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);

  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredTransactions.slice(start, end);
  }, [filteredTransactions, currentPage]);

  const memoizedTransactions = useMemo(() => {
    const getTag = (type: string) => {
      const item = typeMap.get(type)

      return (
        <div className="w-full h-full flex justify-center items-center">
          <div
            className={`${item?.bgColor} min-w-[68px] px-3 py-1 rounded text-white flex justify-center items-center text-xs`}
          >
            {item?.title}
          </div>
        </div>
      )
    }

    return (
      paginatedTransactions.length > 0 &&
      paginatedTransactions.map((recentTransaction: ITransaction) => {
        const formattedPrice = Number(recentTransaction.price).toLocaleString(
          'pt-BR',
          {
            style: 'currency',
            currency: 'BRL',
          },
        )

        const formattedDate = DateTime.fromISO(
          typeof recentTransaction.transaction_day === 'string' ? recentTransaction.transaction_day : '',
        )
          .setZone('America/Sao_Paulo')
          .setLocale('pt-BR')
          .toFormat('dd LLL yy')

        const formattedUpdatedDate = (() => {
          try {
            if (recentTransaction.updated_at) {
              return DateTime.fromISO(recentTransaction.updated_at)
                .setZone('America/Sao_Paulo')
                .toFormat('dd/MM/yyyy')
            }
            if (recentTransaction.created_at) {
              return DateTime.fromISO(recentTransaction.created_at)
                .setZone('America/Sao_Paulo')
                .toFormat('dd/MM/yyyy')
            }
            return 'Data não disponível'
          } catch (error) {
            return 'Data inválida'
          }
        })()
        return (
          <tr key={recentTransaction.id} className="relative">
            <td className="border-b-[1px] p-3 border-lineGray text-sm font-medium h-[56px]">
              <div className="flex justify-center items-center">
                {recentTransaction.category ? (
                  <CategoryIcon
                    category={{
                      iconName: recentTransaction.category.iconName,
                      color: recentTransaction.category.color,
                      icon_name: recentTransaction.category.icon_name,
                      id: recentTransaction.category.id,
                      name: recentTransaction.category.name,
                      type: recentTransaction.category.type,
                    }}
                    size="large"
                  />
                ) : (
                  <span className="text-xs text-gray-400">Sem categoria</span>
                )}
              </div>
            </td>
            <td
              className={`w-60 p-3 text-center border-lineGray border-b-[1px] text-sm dark:text-softGray sm:relative h-[56px]`}
            >
              {recentTransaction.description}
            </td>
            <td
              className={`border-b-[1px] p-3 text-center border-lineGray text-sm dark:text-softGray sm:relative h-[56px]`}
            >
              {formattedPrice}
            </td>
            <td
              className={`border-b-[1px] p-3 text-center border-lineGray text-sm dark:text-softGray sm:relative h-[56px]`}
            >
              {formattedDate}
            </td>
            <td
              className={`border-b-[1px] p-3 text-center border-lineGray text-sm dark:text-softGray sm:relative h-[56px]`}
            >
              {formattedUpdatedDate}
            </td>
            <td
              className={`border-b-[1px] p-3 text-center border-lineGray text-sm dark:text-softGray sm:relative h-[56px]`}
            >
              {getTag(recentTransaction.type || '')}
            </td>
            <td
              className={`border-b-[1px] p-3 text-center border-lineGray text-sm h-[56px]`}
            >
              <div className="relative">
                <div className="button-config justify-center items-center px-2">
                  <button>
                    <EllipsisVertical
                      size={18}
                      className="text-zinc-600 dark:text-softGray"
                    />
                  </button>

                  <div className="absolute z-20 bottom-5 right-0 mt-2 w-28 bg-white dark:bg-black-bg shadow-md rounded-lg">
                    <button
                      className="w-full px-4 py-2 text-left text-gray-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                      onClick={() => setOpenModal({ isOpen: true, transaction: recentTransaction, type: 'edit' })}
                    >
                      Editar
                    </button>
                    <button
                      className="w-full px-4 py-2 text-left text-gray-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                      onClick={() => setOpenModal({ isOpen: true, transaction: recentTransaction, type: 'delete' })}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        )
      })
    )
  }, [paginatedTransactions, setOpenModal])

  return (
    <>
      {filteredTransactions.length > 0 ? (
        <div className="w-full overflow-y-scroll flex flex-auto relative">
          <table className="min-w-640 sm:w-full h-full text-left">
            <thead>
              <tr>
                <th className="sticky top-0 z-10 text-center bg-background dark:bg-orangeDark rounded-tl-lg p-4 text-gray dark:text-softGray border-b-1 border-lineGray text-sm">
                  Categoria
                </th>
                <th className="sticky top-0 z-10 text-center text-gray dark:text-softGray border-b-1 border-lineGray bg-background dark:bg-orangeDark text-sm">
                  Descrição
                </th>
                <th
                  className="sticky top-0 z-10 text-center text-gray dark:text-softGray border-b-1 border-lineGray bg-background dark:bg-orangeDark text-sm cursor-pointer select-none"
                  onClick={() => onSort && onSort('price', sortBy === 'price' ? (sortOrder === 'desc' ? 'asc' : 'desc') : 'desc')}
                >
                  Valor
                  {sortBy === 'price' && (
                    <span>{sortOrder === 'asc' ? ' ▲' : ' ▼'}</span>
                  )}
                </th>
                <th
                  className="sticky top-0 z-10 text-center text-gray dark:text-softGray border-b-1 border-lineGray bg-background dark:bg-orangeDark text-sm cursor-pointer select-none"
                  onClick={() => onSort && onSort('transaction_day', sortBy === 'transaction_day' ? (sortOrder === 'desc' ? 'asc' : 'desc') : 'desc')}
                >
                  Dia
                  {sortBy === 'transaction_day' && (
                    <span>{sortOrder === 'asc' ? ' ▲' : ' ▼'}</span>
                  )}
                </th>
                <th
                  className="sticky top-0 z-10 text-center text-gray dark:text-softGray border-b-1 border-lineGray bg-background dark:bg-orangeDark text-sm cursor-pointer select-none"
                  onClick={() => onSort && onSort('updated_at', sortBy === 'updated_at' ? (sortOrder === 'desc' ? 'asc' : 'desc') : 'desc')}
                >
                  Última modificação
                  {sortBy === 'updated_at' && (
                    <span>{sortOrder === 'asc' ? ' ▲' : ' ▼'}</span>
                  )}
                </th>
                <th className="sticky top-0 z-10 text-center text-gray dark:text-softGray border-b-1 border-lineGray bg-background dark:bg-orangeDark text-sm">
                  Tipo
                </th>
                <th className="sticky top-0 z-10 text-center rounded-tr-lg text-gray dark:text-softGray border-b-1 border-lineGray bg-background dark:bg-orangeDark text-sm">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>{memoizedTransactions}</tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center w-full h-64 py-8">
          <span style={{ color: 'rgb(160 160 160)' }} className="text-lg font-medium">Nenhuma transação cadastrada ainda</span>
          <span style={{ color: 'rgb(160 160 160)' }} className="text-sm mt-1">Adicione sua primeira transação para começar!</span>
        </div>
      )}
      {/* Pagination Controls */}
      <div className="flex justify-center items-center gap-2 mt-4">
        <button
          className="px-2 py-1 rounded border text-sm disabled:opacity-50"
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          Anterior
        </button>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            className={`px-2 py-1 rounded border text-sm ${currentPage === i + 1 ? 'bg-orange-500 text-white' : ''}`}
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
        <button
          className="px-2 py-1 rounded border text-sm disabled:opacity-50"
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
        >
          Próxima
        </button>
        <span className="ml-4 text-sm text-gray-500">Página {currentPage}</span>
      </div>
      {/* Modais de Editar/Excluir */}
      {openModal.isOpen && openModal.type === 'edit' && (
        <ModalEdit
          openModal={openModal}
          setOpenModal={setOpenModal}
          handleUpdateTransaction={handleUpdateTransaction}
          currentMonth={currentMonth}
          setCurrentMonth={setCurrentMonth}
          categories={categories}
          from={from}
        />
      )}
      {openModal.isOpen && openModal.type === 'delete' && (
        <ModalDelete
          openModal={openModal}
          setOpenModal={setOpenModal}
          handleDeleteTransaction={handleDeleteTransaction}
          currentMonth={currentMonth}
          setCurrentMonth={setCurrentMonth}
          from={from}
        />
      )}
    </>
  )
}

export default TableRecentTransactions
