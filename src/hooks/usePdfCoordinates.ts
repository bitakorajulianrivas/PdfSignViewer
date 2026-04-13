import { useCallback, useMemo, RefObject } from 'react'
import { Position, Dimensions, ElementPosition } from '../types'
import { PDF_PAGE_DIMENSIONS } from '../constants'

interface UsePdfCoordinatesProps {
  containerRef: RefObject<HTMLDivElement | null>
  currentPage: number
}

interface UsePdfCoordinatesReturn {
  calculatePdfCoordinates: (position: Position, dimensions: Dimensions) => ElementPosition | null
}

export const usePdfCoordinates = ({
  containerRef,
  currentPage
}: UsePdfCoordinatesProps): UsePdfCoordinatesReturn => {
  const calculatePdfCoordinates = useCallback(
    (position: Position, dimensions: Dimensions): ElementPosition | null => {
      const container = containerRef.current
      if (!container) return null

      const containerWidth = container.clientWidth
      const containerHeight = container.clientHeight

      const scaleX = PDF_PAGE_DIMENSIONS.width / containerWidth
      const scaleY = PDF_PAGE_DIMENSIONS.height / containerHeight

      const pdfX = position.x * scaleX
      const elementHeightPdf = dimensions.height * scaleY
      const pdfY = PDF_PAGE_DIMENSIONS.height - (position.y * scaleY) - elementHeightPdf

      return {
        x: Math.round(pdfX * 100) / 100,
        y: Math.round(pdfY * 100) / 100,
        width: Math.round(dimensions.width * scaleX),
        height: Math.round(elementHeightPdf),
        page: currentPage
      }
    },
    [containerRef, currentPage]
  )

  return { calculatePdfCoordinates }
}

export const useElementCoordinates = (
  calculatePdfCoordinates: (position: Position, dimensions: Dimensions) => ElementPosition | null,
  position: Position,
  dimensions: Dimensions,
  isVisible: boolean
): ElementPosition | null => {
  return useMemo(() => {
    if (!isVisible) return null
    return calculatePdfCoordinates(position, dimensions)
  }, [calculatePdfCoordinates, position, dimensions, isVisible])
}
