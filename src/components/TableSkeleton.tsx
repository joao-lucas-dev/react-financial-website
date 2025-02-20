import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

const TableSkeleton = ({ rows = 7 }) => {
  return (
    <div className="overflow-auto h-full">
      <table className="min-w-640 sm:w-full h-full text-left rounded-lg">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-background rounded-tl-lg text-center p-4 text-gray border-b-1 border-lineGray text-sm max-w-8">
              Data
            </th>
            <th className="text-center text-gray border-b-1 border-lineGray bg-background text-sm max-w-8">
              Entradas
            </th>
            <th className="text-center text-gray border-b-1 border-lineGray bg-background text-sm max-w-8">
              Saídas
            </th>
            <th className="text-center text-gray border-b-1 border-lineGray bg-background text-sm max-w-8">
              Diário
            </th>
            <th className="rounded-tr-lg text-center text-gray border-b-1 border-lineGray bg-background text-sm max-w-8">
              Saldo
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, index) => (
            <tr key={index}>
              <td className="sticky left-0 z-auto sm:relative p-2">
                <Skeleton height={20} />
              </td>
              <td className="p-2">
                <Skeleton height={20} />
              </td>
              <td className="p-2">
                <Skeleton height={20} />
              </td>
              <td className="p-2">
                <Skeleton height={20} />
              </td>
              <td className="p-2">
                <Skeleton height={20} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TableSkeleton
