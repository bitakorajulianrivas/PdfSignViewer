import { FC } from 'react'
import { ElementPosition } from '../../types'
import './CoordinatesDisplay.css'

interface CoordinatesDisplayProps {
  signatureCoordinates: ElementPosition | null
  qrCoordinates: ElementPosition | null
  currentPage: number
}

export const CoordinatesDisplay: FC<CoordinatesDisplayProps> = ({
  signatureCoordinates,
  qrCoordinates,
  currentPage
}) => {
  if (!signatureCoordinates && !qrCoordinates) return null

  return (
    <div className="coordinates-display">
      <h4>Coordenadas actuales</h4>
      <div className="coords-sections">
        {signatureCoordinates && (
          <div className="coords-section">
            <h5>Firma</h5>
            <div className="coords-grid">
              <div className="coord-item">
                <span className="label">X:</span>
                <span className="value">{signatureCoordinates.x}</span>
              </div>
              <div className="coord-item">
                <span className="label">Y:</span>
                <span className="value">{signatureCoordinates.y}</span>
              </div>
              <div className="coord-item">
                <span className="label">Ancho:</span>
                <span className="value">{signatureCoordinates.width}</span>
              </div>
              <div className="coord-item">
                <span className="label">Alto:</span>
                <span className="value">{signatureCoordinates.height}</span>
              </div>
            </div>
          </div>
        )}
        {qrCoordinates && (
          <div className="coords-section">
            <h5>Código QR</h5>
            <div className="coords-grid">
              <div className="coord-item">
                <span className="label">X:</span>
                <span className="value">{qrCoordinates.x}</span>
              </div>
              <div className="coord-item">
                <span className="label">Y:</span>
                <span className="value">{qrCoordinates.y}</span>
              </div>
            </div>
          </div>
        )}
        <div className="coords-section">
          <div className="coord-item">
            <span className="label">Página:</span>
            <span className="value">{currentPage}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
