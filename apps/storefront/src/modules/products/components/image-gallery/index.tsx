"use client"

import {
  ArrowLeftMini,
  ArrowRightMini,
  MagnifyingGlass,
  XMark,
} from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { clx, IconButton } from "@medusajs/ui"
import Image from "next/image"
import { useCallback, useEffect, useMemo, useState } from "react"

type ImageGalleryProps = {
  product: HttpTypes.StoreProduct
}

type GalleryImage = {
  id: string
  url?: string | null
  alt?: string
}

const ImageGallery = ({ product }: ImageGalleryProps) => {
  const images = useMemo<GalleryImage[]>(() => {
    const gallery = product.images?.map((image, index) => ({
      id: image.id || `image-${index}`,
      url: image.url,
      alt:
        (image.metadata?.alt as string | undefined) ||
        `${product.title} - imagen ${index + 1}`,
    }))

    if (gallery?.length) {
      return gallery
    }

    return [
      {
        id: "thumbnail",
        url: product.thumbnail,
        alt: product.title,
      },
    ]
  }, [product])

  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isZoomOpen, setIsZoomOpen] = useState(false)
  const selectedImage = images[selectedImageIndex]

  const selectImage = useCallback(
    (index: number) => {
      setSelectedImageIndex(Math.min(Math.max(index, 0), images.length - 1))
    },
    [images.length]
  )

  const handleArrowClick = useCallback(
    (direction: "left" | "right") => {
      selectImage(selectedImageIndex + (direction === "left" ? -1 : 1))
    },
    [selectImage, selectedImageIndex]
  )

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (document.activeElement instanceof HTMLInputElement) {
        return
      }

      if (event.key === "ArrowLeft") {
        handleArrowClick("left")
      }

      if (event.key === "ArrowRight") {
        handleArrowClick("right")
      }

      if (event.key === "Escape") {
        setIsZoomOpen(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleArrowClick])

  return (
    <section
      aria-label={`Galería de imágenes de ${product.title}`}
      className="grid gap-4 bg-white small:grid-cols-[80px_1fr]"
    >
      <div className="order-2 flex gap-3 overflow-x-auto small:order-1 small:flex-col small:overflow-visible">
        {images.map((image, index) => (
          <button
            key={image.id}
            type="button"
            onClick={() => selectImage(index)}
            aria-label={`Mostrar imagen ${index + 1}`}
            aria-current={index === selectedImageIndex}
            className={clx(
              "relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border bg-neutral-50 transition",
              index === selectedImageIndex
                ? "border-neutral-950 shadow-[0_0_0_2px_rgba(0,0,0,0.08)]"
                : "border-neutral-200 hover:border-neutral-400"
            )}
          >
            {image.url && (
              <Image
                src={image.url}
                alt={image.alt || product.title}
                fill
                sizes="80px"
                className="object-contain p-2"
              />
            )}
          </button>
        ))}
      </div>

      <div className="order-1 small:order-2">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100">
          {selectedImage?.url && (
            <Image
              src={selectedImage.url}
              priority
              className="object-contain p-6 small:p-10"
              alt={selectedImage.alt || product.title}
              fill
              sizes="(min-width: 1024px) 680px, 100vw"
            />
          )}

          <button
            type="button"
            onClick={() => setIsZoomOpen(true)}
            className="absolute bottom-5 right-5 inline-flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-950 shadow-sm transition hover:bg-neutral-100"
            aria-label="Ampliar imagen"
          >
            <MagnifyingGlass className="h-5 w-5" />
          </button>
        </div>

        {images.length > 1 && (
          <div className="mt-4 flex items-center justify-end gap-2">
            <IconButton
              disabled={selectedImageIndex === 0}
              className="rounded-full"
              onClick={() => handleArrowClick("left")}
              aria-label="Imagen anterior"
            >
              <ArrowLeftMini />
            </IconButton>
            <IconButton
              disabled={selectedImageIndex === images.length - 1}
              className="rounded-full"
              onClick={() => handleArrowClick("right")}
              aria-label="Imagen siguiente"
            >
              <ArrowRightMini />
            </IconButton>
          </div>
        )}
      </div>

      {isZoomOpen && selectedImage?.url && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Imagen ampliada"
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-4"
        >
          <button
            type="button"
            onClick={() => setIsZoomOpen(false)}
            className="absolute right-5 top-5 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-neutral-950"
            aria-label="Cerrar imagen ampliada"
          >
            <XMark className="h-5 w-5" />
          </button>
          <div className="relative h-full max-h-[86vh] w-full max-w-5xl">
            <Image
              src={selectedImage.url}
              alt={selectedImage.alt || product.title}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
        </div>
      )}
    </section>
  )
}

export default ImageGallery
