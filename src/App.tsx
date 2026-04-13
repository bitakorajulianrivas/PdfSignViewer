import { useState, useRef, useCallback, useMemo } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { QRCodeSVG } from 'qrcode.react'
import { FaTrash, FaSave } from 'react-icons/fa'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import './App.css'

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

interface ElementPosition {
  x: number
  y: number
  width: number
  height: number
  page: number
}

type DraggingElement = 'signature' | 'qr' | null

function App() {
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [signatureImage, setSignatureImage] = useState<string | null>(null)
  const [signaturePosition, setSignaturePosition] = useState({ x: 50, y: 50 })
  const [signatureDimensions, setSignatureDimensions] = useState({ width: 150, height: 75 })
  const [signatureScale, setSignatureScale] = useState(100)
  const [originalSignatureDimensions, setOriginalSignatureDimensions] = useState({ width: 150, height: 75 })
  const [savedSignaturePosition, setSavedSignaturePosition] = useState<ElementPosition | null>(null)

  const [qrText, setQrText] = useState('')
  const [qrPosition, setQrPosition] = useState({ x: 200, y: 50 })
  const [savedQrPosition, setSavedQrPosition] = useState<ElementPosition | null>(null)
  const qrSize = 50

  const [draggingElement, setDraggingElement] = useState<DraggingElement>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [pageInputValue, setPageInputValue] = useState('1')

  const [isModalOpen, setIsModalOpen] = useState(false)

  const pdfContainerRef = useRef<HTMLDivElement>(null)

  // Standard PDF page dimensions (Letter size in points)
  const pdfPageDimensions = { width: 612, height: 792 }

  const calculatePdfCoordinates = useCallback((position: { x: number, y: number }, dimensions: { width: number, height: number }) => {
    const container = pdfContainerRef.current
    if (!container) return null

    const containerWidth = container.clientWidth
    const containerHeight = container.clientHeight

    const scaleX = pdfPageDimensions.width / containerWidth
    const scaleY = pdfPageDimensions.height / containerHeight

    const pdfX = position.x * scaleX
    const elementHeightPdf = dimensions.height * scaleY
    const pdfY = pdfPageDimensions.height - (position.y * scaleY) - elementHeightPdf

    return {
      x: Math.round(pdfX * 100) / 100,
      y: Math.round(pdfY * 100) / 100,
      width: Math.round(dimensions.width * scaleX),
      height: Math.round(elementHeightPdf),
      page: currentPage
    }
  }, [currentPage])

  const signatureCoordinates = useMemo(() => {
    if (!signatureImage) return null
    return calculatePdfCoordinates(signaturePosition, signatureDimensions)
  }, [signaturePosition, signatureDimensions, signatureImage, calculatePdfCoordinates])

  const qrCoordinates = useMemo(() => {
    if (!qrText) return null
    return calculatePdfCoordinates(qrPosition, { width: qrSize, height: qrSize })
  }, [qrPosition, qrText, calculatePdfCoordinates])

  const handlePdfFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setPdfFile(file)
      setCurrentPage(1)
      setPageInputValue('1')
    }
  }

  const handleSignatureFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSignatureImage(e.target?.result as string)
        setSignaturePosition({ x: 50, y: 50 })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSignatureLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget
    const maxWidth = 200
    const maxHeight = 100

    let width = img.naturalWidth
    let height = img.naturalHeight

    if (width > maxWidth) {
      height = height * (maxWidth / width)
      width = maxWidth
    }
    if (height > maxHeight) {
      width = width * (maxHeight / height)
      height = maxHeight
    }

    setOriginalSignatureDimensions({ width, height })
    setSignatureDimensions({ width, height })
    setSignatureScale(100)
  }

  const handleSignatureScaleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const scale = parseInt(event.target.value, 10)
    setSignatureScale(scale)
    setSignatureDimensions({
      width: (originalSignatureDimensions.width * scale) / 100,
      height: (originalSignatureDimensions.height * scale) / 100
    })
  }

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
    if (!draggingElement || !pdfContainerRef.current) return

    const container = pdfContainerRef.current
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
      setSignaturePosition({ x, y })
    } else if (draggingElement === 'qr') {
      setQrPosition({ x, y })
    }
  }, [draggingElement, dragOffset, signatureDimensions])

  const handleMouseUp = useCallback(() => {
    setDraggingElement(null)
  }, [])

  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setTotalPages(numPages)
  }

  const handleGoToPage = () => {
    const page = parseInt(pageInputValue, 10)
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    } else {
      setPageInputValue(currentPage.toString())
    }
  }

  const handlePageInputKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleGoToPage()
    }
  }

  const handleSavePositions = () => {
    if (signatureCoordinates) {
      setSavedSignaturePosition(signatureCoordinates)
      console.log('Signature Position:', JSON.stringify(signatureCoordinates, null, 2))
    }
    if (qrCoordinates) {
      const qrPositionSimple = { x: qrCoordinates.x, y: qrCoordinates.y, page: qrCoordinates.page }
      setSavedQrPosition(qrPositionSimple as ElementPosition)
      console.log('QR Position:', JSON.stringify(qrPositionSimple, null, 2))
    }
    setIsModalOpen(false)
  }

  const handleClearSignature = () => {
    setSignatureImage(null)
    setSavedSignaturePosition(null)
    setSignaturePosition({ x: 50, y: 50 })
  }

  const handleClearQr = () => {
    setQrText('')
    setSavedQrPosition(null)
    setQrPosition({ x: 200, y: 50 })
  }

  return (
    <div className="pdf-signature-container">
      <div className="top-bar">
        <div className="input-group">
          <label htmlFor="pdfInput">Cargar PDF:</label>
          <input
            type="file"
            id="pdfInput"
            accept=".pdf"
            onChange={handlePdfFileSelect}
          />
        </div>

        {pdfFile && (
          <button className="open-modal-btn" onClick={() => setIsModalOpen(true)}>
            Configurar Firma y QR
          </button>
        )}
      </div>

      {(savedSignaturePosition || savedQrPosition) && (
        <div className="saved-position">
          <h3>Posiciones guardadas</h3>
          <pre>{JSON.stringify({ signature: savedSignaturePosition, qr: savedQrPosition }, null, 2)}</pre>
        </div>
      )}

      {/* Modal con visor completo */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal modal-fullscreen" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Configurar Firma y QR</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>×</button>
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
                      onChange={handleSignatureFileSelect}
                    />
                  </div>

                  {signatureImage && (
                    <div className="input-group">
                      <label htmlFor="signatureScale">Tamaño: {signatureScale}%</label>
                      <input
                        type="range"
                        id="signatureScale"
                        min="25"
                        max="200"
                        value={signatureScale}
                        onChange={handleSignatureScaleChange}
                        className="scale-slider"
                      />
                    </div>
                  )}

                  {signatureImage && (
                    <button className="clear-btn" onClick={handleClearSignature}>
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
                      onChange={(e) => setQrText(e.target.value)}
                      placeholder="Ingrese texto para QR"
                      className="qr-input"
                    />
                  </div>

                  {qrText && (
                    <button className="clear-btn" onClick={handleClearQr}>
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
                      onChange={(e) => setPageInputValue(e.target.value)}
                      onKeyDown={handlePageInputKeyDown}
                      className="page-input"
                    />
                    <span className="page-total">de {totalPages}</span>
                    <button className="go-btn" onClick={handleGoToPage}>
                      Ir
                    </button>
                  </div>
                </div>

                {/* Coordenadas dentro del sidebar */}
                {(signatureCoordinates || qrCoordinates) && (
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
                )}

                <div className="modal-actions">
                  <button className="save-btn" onClick={handleSavePositions}>
                    <FaSave /> Guardar Posiciones
                  </button>
                  <button className="cancel-btn" onClick={() => setIsModalOpen(false)}>
                    Cerrar
                  </button>
                </div>
              </div>

              {/* Visor del PDF */}
              <div
                className="modal-viewer"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <div className="pdf-wrapper">
                  <div className="pdf-object-container" ref={pdfContainerRef}>
                    <Document
                      file={pdfFile}
                      onLoadSuccess={handleDocumentLoadSuccess}
                      className="pdf-document"
                    >
                      <Page
                        pageNumber={currentPage}
                        width={pdfContainerRef.current?.clientWidth}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        className="pdf-page"
                      />
                    </Document>

                    {qrText && (
                      <div
                        className={`qr-overlay ${draggingElement === 'qr' ? 'dragging' : ''}`}
                        style={{
                          width: qrSize,
                          height: qrSize,
                          left: qrPosition.x,
                          top: qrPosition.y
                        }}
                        onMouseDown={(e) => handleMouseDown(e, 'qr')}
                      >
                        <QRCodeSVG value={qrText} size={qrSize} />
                      </div>
                    )}

                    {signatureImage && (
                      <img
                        src={signatureImage}
                        alt="Firma"
                        className={`signature-overlay ${draggingElement === 'signature' ? 'dragging' : ''}`}
                        style={{
                          width: signatureDimensions.width,
                          height: signatureDimensions.height,
                          left: signaturePosition.x,
                          top: signaturePosition.y
                        }}
                        onLoad={handleSignatureLoad}
                        onMouseDown={(e) => handleMouseDown(e, 'signature')}
                        draggable={false}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
