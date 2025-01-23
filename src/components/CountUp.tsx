import { useEffect, useState } from 'react'

interface IParams {
  valueNumber: number
}

const CountUp = ({ valueNumber }: IParams) => {
  const [value, setValue] = useState(0)
  // const targetValue = 100000
  const duration = 800
  const fps = 60

  useEffect(() => {
    const totalFrames = Math.round((duration / 1000) * fps)
    const increment = valueNumber / totalFrames
    let currentFrame = 0

    const interval = setInterval(() => {
      currentFrame += 1
      setValue((prevValue) => Math.min(prevValue + increment, valueNumber))

      if (currentFrame >= totalFrames) {
        clearInterval(interval)
      }
    }, 1000 / fps)

    return () => clearInterval(interval)
  }, [valueNumber, duration, fps])

  return (
    <>
      {value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      })}
    </>
  )
}

export default CountUp
