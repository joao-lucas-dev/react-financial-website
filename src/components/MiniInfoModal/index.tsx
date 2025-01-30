/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useEffect, useRef, Dispatch, SetStateAction } from 'react'
import { ITransaction } from '../../types/transactions'

import Index from '../CategoryIcon'
import './styles.css'
import { EllipsisVertical } from 'lucide-react'
import useMiniInfoAux from '../../hooks/useMiniInfoAux'

interface IParams {
  handleCreateTransaction: (
    value: { formattedValue: string; originalValue: number },
    setValue: React.Dispatch<
      React.SetStateAction<{ formattedValue: string; originalValue: number }>
    >,
  ) => Promise<void>
  transactions: ITransaction[]
  type: 'income' | 'outcome' | 'daily'
  setOpenModal: Dispatch<
    SetStateAction<{
      isOpen: boolean
      transaction: ITransaction
      type: string
    }>
  >
}

const MiniInfoModal = ({
  transactions,
  type,
  setOpenModal,
  handleCreateTransaction,
}: IParams) => {
  const {
    handleMouseEnter,
    handleMouseLeave,
    scrollDescriptionRefs,
    handleChange,
    value,
    setValue,
    checkIfClipped,
    modalRef,
    isClipped,
    findTextColor,
    handleOnKeyDown,
  } = useMiniInfoAux()

  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0
    }

    checkIfClipped()

    window.addEventListener('scroll', checkIfClipped)
    window.addEventListener('resize', checkIfClipped)

    return () => {
      window.removeEventListener('scroll', checkIfClipped)
      window.removeEventListener('resize', checkIfClipped)
    }
  }, [checkIfClipped])

  return (
    <div
      ref={modalRef}
      className={`z-30 absolute left-full ${isClipped ? 'bottom-0' : '-top-2'} w-80 bg-white shadow-lg rounded-lg hidden group-hover:lg:block`}
    >
      <div ref={scrollRef} className="max-h-52 card-miniinfo">
        <div className="w-full px-4 pt-2 flex flex-col">
          <label htmlFor="currency" className="text-left mb-2">
            Insira um valor
          </label>
          <input
            id="currency"
            type="text"
            className="border border-zinc-200 w-full h-8 px-4 rounded-lg text-xs"
            placeholder="R$ 0,00"
            value={value.formattedValue}
            onChange={handleChange}
            inputMode="numeric"
            onKeyDown={(event) =>
              handleOnKeyDown(event, async () => {
                await handleCreateTransaction(value, setValue)
              })
            }
          />
        </div>
        {transactions && transactions.length > 0 ? (
          <>
            {transactions.map((transaction, index) => {
              handleMouseLeave(index)

              return (
                <div key={transaction.id}>
                  {transaction.shared && (
                    <>
                      <div className="flex justify-center items-center mt-4 px-4">
                        <div className="w-3 h-px bg-zinc-300 mb-6" />
                      </div>

                      <div className="flex items-center mb-4 px-4">
                        <img
                          src="https://cdn-icons-png.flaticon.com/512/921/921124.png"
                          width={32}
                          height={32}
                          alt="Avatar"
                        />
                        <div className="ml-2 flex flex-col items-start">
                          <p className="font-semibold text-sm">Kátja Santos</p>
                          <p className="text-gray-500 text-xs font-light">
                            {transaction.createdAt}
                          </p>
                        </div>
                        <div className="flex flex-auto justify-center items-center">
                          <p className="text-sm text-orange-400">
                            Compartilhado
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  <div
                    className="flex px-4 py-3 hover:bg-zinc-50 transaction-area"
                    onMouseEnter={() => handleMouseEnter(index)}
                    onMouseLeave={() => handleMouseLeave(index)}
                  >
                    <div className="flex h-full">
                      <Index category={transaction.category} />
                    </div>

                    <div className="flex flex-1">
                      <p
                        ref={(el) => {
                          scrollDescriptionRefs.current[index] = el
                        }}
                        className="px-4 max-w-32 description"
                      >
                        {transaction.description}
                      </p>
                    </div>

                    <div className="flex">
                      <p className={`${findTextColor(type)} text-end`}>
                        {type === 'income' ? '+' : '-'} {transaction.price}
                      </p>
                    </div>

                    <div className="relative">
                      <div className="button-config justify-center items-center px-2">
                        <button>
                          <EllipsisVertical
                            size={16}
                            className="text-zinc-600"
                          />
                        </button>

                        <div className="absolute bottom-5 right-0 mt-2 w-28 bg-white shadow-md rounded-lg">
                          <button
                            onClick={() =>
                              setOpenModal({
                                isOpen: true,
                                transaction: {
                                  ...transaction,
                                  type,
                                },
                                type: 'edit',
                              })
                            }
                            className="w-full px-4 py-2 text-left text-gray-700 hover:bg-zinc-50"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() =>
                              setOpenModal({
                                isOpen: true,
                                transaction,
                                type: 'delete',
                              })
                            }
                            className="w-full px-4 py-2 text-left text-gray-700 hover:bg-zinc-50"
                          >
                            Excluir
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </>
        ) : (
          <div className="flex justify-center items-center p-4">
            <h1>Não há transações</h1>
          </div>
        )}
      </div>

      <div className="w-full h-full px-4">
        <div className="w-full h-px bg-zinc-200 mb-2" />
      </div>

      <div className="py-2 px-4">
        <button
          onClick={() => handleCreateTransaction(value, setValue)}
          className="w-full h-8 bg-primary hover:bg-orange-400 rounded-lg text-center text-white font-semibold text-md"
        >
          Adicionar
        </button>
      </div>
    </div>
  )
}

export default MiniInfoModal
