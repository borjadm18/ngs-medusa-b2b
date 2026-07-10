import { MinusMini, PlusMini } from "@medusajs/icons"
import { IconButton, Input } from "@medusajs/ui"
import { useEffect, useState } from "react"

type BulkTableQuantityProps = {
  variantId: string
  label?: string
  onChange: (variantId: string, quantity: number) => void
}

const BulkTableQuantity = ({
  variantId,
  label = "uds",
  onChange,
}: BulkTableQuantityProps) => {
  const [quantity, setQuantity] = useState("0")
  const [shiftPressed, setShiftPressed] = useState(false)

  const normalizeQuantity = (value: string | number) => {
    const numericValue = Number(value)

    if (!Number.isFinite(numericValue)) {
      return 0
    }

    return Math.max(Math.floor(numericValue), 0)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = normalizeQuantity(e.target.value)
    setQuantity(e.target.value)
    onChange(variantId, q)
  }

  const handleAdd = () => {
    const q = normalizeQuantity(quantity) + (shiftPressed ? 10 : 1)
    setQuantity(q.toString())
    onChange(variantId, q)
  }

  const handleSubtract = () => {
    const q = Math.max(normalizeQuantity(quantity) - (shiftPressed ? 10 : 1), 0)
    setQuantity(q.toString())
    onChange(variantId, q)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault()
      handleAdd()
    }

    if (e.key === "ArrowDown") {
      e.preventDefault()
      handleSubtract()
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Shift") {
        setShiftPressed(true)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Shift") {
        setShiftPressed(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [])

  return (
    <div className="flex flex-col gap-1 w-full min-w-[132px]">
      <div className="flex flex-row justify-between gap-2 w-full">
        <IconButton
          onClick={() => handleSubtract()}
          className="rounded-md hover:bg-neutral-200"
          variant="transparent"
        >
          <MinusMini />
        </IconButton>
        <Input
          value={quantity}
          onChange={(e) => handleChange(e)}
          onKeyDown={handleKeyDown}
          type="number"
          className="max-w-10 text-center items-center justify-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <IconButton
          onClick={() => handleAdd()}
          className="rounded-md hover:bg-neutral-200"
          variant="transparent"
        >
          <PlusMini />
        </IconButton>
      </div>
      <span className="text-[0.65rem] leading-4 text-neutral-500 text-center">
        {label}
      </span>
    </div>
  )
}

export default BulkTableQuantity
