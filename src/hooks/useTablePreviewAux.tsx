import { useCallback } from 'react'

import { IRow } from '../types/transactions'

export default function useTablePreview() {
  const findTotalColor = useCallback((row: IRow) => {
    const total = row.total.value

    if (total >= row.total.good_value) {
      return 'green'
    } else if (total < row.total.good_value && total >= row.total.warn_value) {
      return 'orange'
    } else {
      return 'red'
    }
  }, [])

  return {
    findTotalColor,
  }
}
