import { MinusMini, PlusMini } from "@medusajs/icons"
import { IconButton, Input, clx } from "@medusajs/ui"
import { useEffect, useState } from "react"

type BulkTableQuantityProps = {
  variantId: string
  label?: string
  compact?: boolean
  onChange: (variantId: string, quantity: number) => void
}

const BulkTableQuantity = ({
  variantId,
  label = "uds",
  compact = false,
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
    <div
      className={clx("flex w-full flex-col gap-1", {
        "min-w-[132px]": !compact,
        "min-w-0": compact,
      })}
    >
      <div className="flex w-full flex-row justify-between gap-1">
        <IconButton
          onClick={() => handleSubtract()}
          className={clx("rounded-md hover:bg-neutral-200", {
            "h-9 w-9": compact,
          })}
          variant="transparent"
        >
          <MinusMini />
        </IconButton>
        <Input
          value={quantity}
          onChange={(e) => handleChange(e)}
          onKeyDown={handleKeyDown}
          type="number"
          className={clx(
            "text-center items-center justify-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
            compact ? "max-w-12" : "max-w-10"
          )}
        />
        <IconButton
          onClick={() => handleAdd()}
          className={clx("rounded-md hover:bg-neutral-200", {
            "h-9 w-9": compact,
          })}
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
