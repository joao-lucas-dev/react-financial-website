import React, { ChangeEvent, useCallback, useEffect } from 'react'
import { ITransaction } from '../types/transactions.ts'
import Input from './Input.tsx'
import Button from './Button.tsx'
import { X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import SelectInput from './SelectInput.tsx'

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
  handleUpdateTransaction: (updateTransaction: ITransaction) => Promise<void>
}

const modalEditSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória'),
  price: z.string().min(1, 'Preço é obrigatorio'),
  transaction_day: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Data é obrigatória e deve ser uma data válida',
  }),
  category: z.string(),
})

type ModalEditData = z.infer<typeof modalEditSchema>

const ModalEdit = ({
  openModal,
  setOpenModal,
  handleUpdateTransaction,
}: IParams) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ModalEditData>({
    resolver: zodResolver(modalEditSchema),
  })

  useEffect(() => {
    setValue('description', openModal.transaction.description)
    setValue('price', String(openModal.transaction.price))
    setValue(
      'transaction_day',
      new Date(openModal.transaction.transaction_day)
        .toISOString()
        .split('T')[0],
    )
    setValue('category', String(openModal.transaction.categoryId))
  }, [openModal.transaction, setValue])

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const inputValue = event.target.value.replace(/\D/g, '')

      if (inputValue) {
        const originalValue = Number(inputValue) / 100
        const formattedValue = originalValue.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        })
        setValue('price', formattedValue)
      } else {
        setValue('price', '')
      }
    },
    [setValue],
  )

  const handleUpdate = useCallback(
    async (data: ModalEditData) => {
      try {
        const updatedTransaction = {
          ...openModal.transaction,
          description: data.description,
          price: Number(data.price.replace(/\D/g, '')) / 100,
          category_id: Number(data.category),
          transaction_day: new Date(`${data.transaction_day}T00:00:00`),
          shared_id: null,
        } as ITransaction

        await handleUpdateTransaction(updatedTransaction)

        setOpenModal({
          isOpen: false,
          transaction: {} as ITransaction,
          type: '',
        })
      } catch (err) {
        console.error(err)
      }
    },
    [handleUpdateTransaction, openModal.transaction, setOpenModal],
  )

  return (
    <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white w-[490px] rounded-lg shadow-lg p-6 relative">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Editar item</h2>
          <button
            onClick={() => {
              setOpenModal({
                isOpen: false,
                transaction: {} as ITransaction,
                type: '',
              })
            }}
          >
            <X />
          </button>
        </div>
        <div>
          <form onSubmit={handleSubmit(handleUpdate)}>
            <Input label="Descrição" {...register('description')} />
            <span className="text-red-500 my-4 text-sm">
              {errors.description?.message}
            </span>

            <div className="flex justify-between items-center">
              <div className="w-[200px]">
                <Input
                  label="Valor"
                  {...register('price')}
                  onChange={handleChange}
                />
                <span className="text-red-500 my-4 text-sm">
                  {errors.price?.message}
                </span>
              </div>

              <div className="w-[200px]">
                <Input
                  label="Data"
                  type="date"
                  {...register('transaction_day')}
                />
                <span className="text-red-500 my-4 text-sm">
                  {errors.transaction_day?.message}
                </span>
              </div>
            </div>

            <SelectInput label="Categoria" {...register('category')} />
            <span className="text-red-500 my-4 text-sm">
              {errors.category?.message}
            </span>

            <Button title="Atualizar" type="submit" />
          </form>
        </div>
      </div>
    </div>
  )
}

export default ModalEdit
