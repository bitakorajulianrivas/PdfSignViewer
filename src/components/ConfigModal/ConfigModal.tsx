import { FC, RefObject } from 'react'
import { FaTrash, FaSave } from 'react-icons/fa'
import { PdfViewer } from '../PdfViewer'
import { CoordinatesDisplay } from '../CoordinatesDisplay'
import { Position, Dimensions, ElementPosition, DraggingElement } from '../../types'
import { SIGNATURE_SCALE_MIN, SIGNATURE_SCALE_MAX } from '../../constants'
import './ConfigModal.css'

interface ConfigModalProps {
  isOpen: boolean
  onClose: () => void
  // PDF props
  pdfFile: File
  currentPage: number
  totalPages: number
  pageInputValue: string
  containerRef: RefObject<HTMLDivElement | null>
  onDocumentLoadSuccess: (data: { numPages: number }) => void
  onPageInputChange: (value: string) => void
  onPageInputKeyDown: (event: React.KeyboardEvent) => void
  onGoToPage: () => void
  // Signature props
  signatureImage: string | null
  signaturePosition: Position
  signatureDimensions: Dimensions
  signatureScale: number
  onSignatureFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void
  onSignatureLoad: (event: React.SyntheticEvent<HTMLImageElement>) => void
  onSignatureScaleChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onClearSignature: () => void
  // QR props
  qrText: string
  qrPosition: Position
  qrSize: number
  onQrTextChange: (value: string) => void
  onClearQr: () => void
  // Coordinates
  signatureCoordinates: ElementPosition | null
  qrCoordinates: ElementPosition | null
  // Drag props
  draggingElement: DraggingElement
  onMouseDown: (event: React.MouseEvent, element: DraggingElement) => void
  onMouseMove: (event: React.MouseEvent) => void
  onMouseUp: () => void
  // Actions
  onSave: () => void
}

export const ConfigModal: FC<ConfigModalProps> = ({
  isOpen,
  onClose,
  pdfFile,
  currentPage,
  totalPages,
  pageInputValue,
  containerRef,
  onDocumentLoadSuccess,
  onPageInputChange,
  onPageInputKeyDown,
  onGoToPage,
  signatureImage,
  signaturePosition,
  signatureDimensions,
  signatureScale,
  onSignatureFileSelect,
  onSignatureLoad,
  onSignatureScaleChange,
  onClearSignature,
  qrText,
  qrPosition,
  qrSize,
  onQrTextChange,
  onClearQr,
  signatureCoordinates,
  qrCoordinates,
  draggingElement,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onSave
}) => {
  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal modal-fullscreen" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Configurar Firma y QR</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-content-wrapper">
          {/* Panel lateral de controles */}
          <div className="modal-sidebar">
            <div className="modal-section">
              <div className="input-group">
                <label htmlFor="signatureInput">Cargar Firma:</label>
                <input
                  type="file"
                  id="signatureInput"
                  accept="image/*"
                  onChange={onSignatureFileSelect}
                />
              </div>

              {signatureImage && (
                <div className="input-group">
                  <label htmlFor="signatureScale">Tamaño: {signatureScale}%</label>
                  <input
                    type="range"
                    id="signatureScale"
                    min={SIGNATURE_SCALE_MIN}
                    max={SIGNATURE_SCALE_MAX}
                    value={signatureScale}
                    onChange={onSignatureScaleChange}
                    className="scale-slider"
                  />
                </div>
              )}

              {signatureImage && (
                <button className="clear-btn" onClick={onClearSignature}>
                  <FaTrash /> Quitar Firma
                </button>
              )}
            </div>

            <div className="modal-section">
              <div className="input-group">
                <label htmlFor="qrInput">Texto QR:</label>
                <input
                  type="text"
                  id="qrInput"
                  value={qrText}
                  onChange={(e) => onQrTextChange(e.target.value)}
                  placeholder="Ingrese texto para QR"
                  className="qr-input"
                />
              </div>

              {qrText && (
                <button className="clear-btn" onClick={onClearQr}>
                  <FaTrash /> Quitar QR
                </button>
              )}
            </div>

            <div className="modal-section">
              <div className="page-controls">
                <label>Página:</label>
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={pageInputValue}
                  onChange={(e) => onPageInputChange(e.target.value)}
                  onKeyDown={onPageInputKeyDown}
                  className="page-input"
                />
                <span className="page-total">de {totalPages}</span>
                <button className="go-btn" onClick={onGoToPage}>
                  Ir
                </button>
              </div>
            </div>

            <CoordinatesDisplay
              signatureCoordinates={signatureCoordinates}
              qrCoordinates={qrCoordinates}
              currentPage={currentPage}
            />

            <div className="modal-actions">
              <button className="save-btn" onClick={onSave}>
                <FaSave /> Guardar Posiciones
              </button>
              <button className="cancel-btn" onClick={onClose}>
                Cerrar
              </button>
            </div>
          </div>

          {/* Visor del PDF */}
          <PdfViewer
            file={pdfFile}
            currentPage={currentPage}
            containerRef={containerRef}
            onLoadSuccess={onDocumentLoadSuccess}
            signatureImage={signatureImage}
            signaturePosition={signaturePosition}
            signatureDimensions={signatureDimensions}
            onSignatureLoad={onSignatureLoad}
            qrText={qrText}
            qrPosition={qrPosition}
            qrSize={qrSize}
            draggingElement={draggingElement}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
          />
        </div>
      </div>
    </div>
  )
}
