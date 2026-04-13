import { useState, useCallback, RefObject } from 'react'
import { Position, DraggingElement } from '../types'

interface UseDraggableProps {
  containerRef: RefObject<HTMLDivElement | null>
  signatureDimensions: { width: number; height: number }
  qrSize: number
  onSignatureMove: (position: Position) => void
  onQrMove: (position: Position) => void
}

interface UseDraggableReturn {
  draggingElement: DraggingElement
  handleMouseDown: (event: React.MouseEvent, element: DraggingElement) => void
  handleMouseMove: (event: React.MouseEvent) => void
  handleMouseUp: () => void
}

export const useDraggable = ({
  containerRef,
  signatureDimensions,
  qrSize,
  onSignatureMove,
  onQrMove
}: UseDraggableProps): UseDraggableReturn => {
  const [draggingElement, setDraggingElement] = useState<DraggingElement>(null)
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 })

  const handleMouseDown = useCallback((event: React.MouseEvent, element: DraggingElement) => {
    event.preventDefault()
    const rect = (event.target as HTMLElement).getBoundingClientRect()
    setDragOffset({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    })
    setDraggingElement(element)
  }, [])

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!draggingElement || !containerRef.current) return

    const container = containerRef.current
    const containerRect = container.getBoundingClientRect()

    let x = event.clientX - containerRect.left - dragOffset.x
    let y = event.clientY - containerRect.top - dragOffset.y

    const elementWidth = draggingElement === 'signature' ? signatureDimensions.width : qrSize
    const elementHeight = draggingElement === 'signature' ? signatureDimensions.height : qrSize

    const maxX = containerRect.width - elementWidth
    const maxY = containerRect.height - elementHeight

    x = Math.max(0, Math.min(x, maxX))
    y = Math.max(0, Math.min(y, maxY))

    if (draggingElement === 'signature') {
      onSignatureMove({ x, y })
    } else if (draggingElement === 'qr') {
      onQrMove({ x, y })
    }
  }, [draggingElement, dragOffset, signatureDimensions, qrSize, containerRef, onSignatureMove, onQrMove])

  const handleMouseUp = useCallback(() => {
    setDraggingElement(null)
  }, [])

  return {
    draggingElement,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp
  }
}
