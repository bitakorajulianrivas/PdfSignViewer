import { FC } from 'react'
import { Position, Dimensions, DraggingElement } from '../../types'
import './SignatureOverlay.css'

interface SignatureOverlayProps {
  image: string
  position: Position
  dimensions: Dimensions
  isDragging: boolean
  onMouseDown: (event: React.MouseEvent, element: DraggingElement) => void
  onLoad: (event: React.SyntheticEvent<HTMLImageElement>) => void
}

export const SignatureOverlay: FC<SignatureOverlayProps> = ({
  image,
  position,
  dimensions,
  isDragging,
  onMouseDown,
  onLoad
}) => {
  return (
    <img
      src={image}
      alt="Firma"
      className={`signature-overlay ${isDragging ? 'dragging' : ''}`}
      style={{
        width: dimensions.width,
        height: dimensions.height,
        left: position.x,
        top: position.y
      }}
      onLoad={onLoad}
      onMouseDown={(e) => onMouseDown(e, 'signature')}
      draggable={false}
    />
  )
}
