import { FC } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Position, DraggingElement } from '../../types'
import './QrOverlay.css'

interface QrOverlayProps {
  text: string
  position: Position
  size: number
  isDragging: boolean
  onMouseDown: (event: React.MouseEvent, element: DraggingElement) => void
}

export const QrOverlay: FC<QrOverlayProps> = ({
  text,
  position,
  size,
  isDragging,
  onMouseDown
}) => {
  return (
    <div
      className={`qr-overlay ${isDragging ? 'dragging' : ''}`}
      style={{
        width: size,
        height: size,
        left: position.x,
        top: position.y
      }}
      onMouseDown={(e) => onMouseDown(e, 'qr')}
    >
      <QRCodeSVG value={text} size={size} />
    </div>
  )
}
