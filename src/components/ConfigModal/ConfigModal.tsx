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
  signatureVisible: boolean
  signatureStamp: boolean
  tsaLogin: string
  tsaPassword: string
  signatureCrl: boolean
  signaturePosition: Position
  signatureDimensions: Dimensions
  signatureScale: number
  onSignatureFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void
  onSignatureVisibleChange: (visible: boolean) => void
  onSignatureStampChange: (stamp: boolean) => void
  onTsaLoginChange: (value: string) => void
  onTsaPasswordChange: (value: string) => void
  onSignatureCrlChange: (crl: boolean) => void
  onSignatureLoad: (event: React.SyntheticEvent<HTMLImageElement>) => void
  onSignatureScaleChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onClearSignature: () => void
  // QR props
  qrText: string
  qrVisible: boolean
  qrPosition: Position
  qrSize: number
  onQrTextChange: (value: string) => void
  onQrVisibleChange: (visible: boolean) => void
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
  signatureVisible,
  signatureStamp,
  tsaLogin,
  tsaPassword,
  signatureCrl,
  signaturePosition,
  signatureDimensions,
  signatureScale,
  onSignatureFileSelect,
  onSignatureVisibleChange,
  onSignatureStampChange,
  onTsaLoginChange,
  onTsaPasswordChange,
  onSignatureCrlChange,
  onSignatureLoad,
  onSignatureScaleChange,
  onClearSignature,
  qrText,
  qrVisible,
  qrPosition,
  qrSize,
  onQrTextChange,
  onQrVisibleChange,
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

            <div className="modal-section">
              <div className="input-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={signatureVisible}
                    onChange={(e) => onSignatureVisibleChange(e.target.checked)}
                  />
                  Firma visible
                </label>
              </div>

              <div className="input-group">
                <label htmlFor="signatureInput">Cargar Firma:</label>
                <input
                  type="file"
                  id="signatureInput"
                  accept="image/*"
                  onChange={onSignatureFileSelect}
                  disabled={!signatureVisible}
                />
              </div>

              {signatureImage && signatureVisible && (
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

              {signatureImage && signatureVisible && (
                <button className="clear-btn" onClick={onClearSignature}>
                  <FaTrash /> Eliminar
                </button>
              )}

              <hr className="section-divider" />

              <div className="input-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={signatureStamp}
                    onChange={(e) => onSignatureStampChange(e.target.checked)}
                  />
                  Firmar estampa
                </label>
              </div>

              <div className="input-group">
                <label htmlFor="tsaLogin">Login TSA:</label>
                <input
                  type="text"
                  id="tsaLogin"
                  value={tsaLogin}
                  onChange={(e) => onTsaLoginChange(e.target.value)}
                  placeholder="Usuario TSA"
                  className="tsa-input"
                  disabled={!signatureStamp}
                />
              </div>

              <div className="input-group">
                <label htmlFor="tsaPassword">Password TSA:</label>
                <input
                  type="password"
                  id="tsaPassword"
                  value={tsaPassword}
                  onChange={(e) => onTsaPasswordChange(e.target.value)}
                  placeholder="Contraseña TSA"
                  className="tsa-input"
                  disabled={!signatureStamp}
                />
              </div>

              <div className="input-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={signatureCrl}
                    onChange={(e) => onSignatureCrlChange(e.target.checked)}
                  />
                  Firmar CRL
                </label>
              </div>
            </div>

            <div className="modal-section">
              <div className="input-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={qrVisible}
                    onChange={(e) => onQrVisibleChange(e.target.checked)}
                  />
                  QR visible
                </label>
              </div>

              <div className="input-group">
                <label htmlFor="qrInput">Texto QR:</label>
                <input
                  type="text"
                  id="qrInput"
                  value={qrText}
                  onChange={(e) => onQrTextChange(e.target.value)}
                  placeholder="Ingrese texto para QR"
                  className="qr-input"
                  disabled={!qrVisible}
                />
              </div>

              {qrText && qrVisible && (
                <button className="clear-btn" onClick={onClearQr}>
                  <FaTrash /> Eliminar
                </button>
              )}
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
            signatureImage={signatureVisible ? signatureImage : null}
            signaturePosition={signaturePosition}
            signatureDimensions={signatureDimensions}
            onSignatureLoad={onSignatureLoad}
            qrText={qrVisible ? qrText : ''}
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
