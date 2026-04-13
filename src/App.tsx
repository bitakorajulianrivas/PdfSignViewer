import { useState, useRef, useMemo } from 'react'
import { pdfjs } from 'react-pdf'
import { ConfigModal } from './components'
import { useDraggable } from './hooks/useDraggable'
import { usePdfCoordinates } from './hooks/usePdfCoordinates'
import { Position, Dimensions, ElementPosition } from './types'
import {
  DEFAULT_SIGNATURE_POSITION,
  DEFAULT_QR_POSITION,
  DEFAULT_SIGNATURE_DIMENSIONS,
  QR_SIZE,
  SIGNATURE_MAX_WIDTH,
  SIGNATURE_MAX_HEIGHT,
  SIGNATURE_SCALE_DEFAULT
} from './constants'
import './App.css'

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

function App() {
  // PDF state
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [pageInputValue, setPageInputValue] = useState('1')

  // Signature state
  const [signatureImage, setSignatureImage] = useState<string | null>(null)
  const [signaturePosition, setSignaturePosition] = useState<Position>(DEFAULT_SIGNATURE_POSITION)
  const [signatureDimensions, setSignatureDimensions] = useState<Dimensions>(DEFAULT_SIGNATURE_DIMENSIONS)
  const [signatureScale, setSignatureScale] = useState(SIGNATURE_SCALE_DEFAULT)
  const [originalSignatureDimensions, setOriginalSignatureDimensions] = useState<Dimensions>(DEFAULT_SIGNATURE_DIMENSIONS)
  const [savedSignaturePosition, setSavedSignaturePosition] = useState<ElementPosition | null>(null)

  // QR state
  const [qrText, setQrText] = useState('')
  const [qrPosition, setQrPosition] = useState<Position>(DEFAULT_QR_POSITION)
  const [savedQrPosition, setSavedQrPosition] = useState<ElementPosition | null>(null)

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Refs
  const pdfContainerRef = useRef<HTMLDivElement>(null)

  // Custom hooks
  const { calculatePdfCoordinates } = usePdfCoordinates({
    containerRef: pdfContainerRef,
    currentPage
  })

  const { draggingElement, handleMouseDown, handleMouseMove, handleMouseUp } = useDraggable({
    containerRef: pdfContainerRef,
    signatureDimensions,
    qrSize: QR_SIZE,
    onSignatureMove: setSignaturePosition,
    onQrMove: setQrPosition
  })

  // Calculate coordinates
  const signatureCoordinates = useMemo(() => {
    if (!signatureImage) return null
    return calculatePdfCoordinates(signaturePosition, signatureDimensions)
  }, [signaturePosition, signatureDimensions, signatureImage, calculatePdfCoordinates])

  const qrCoordinates = useMemo(() => {
    if (!qrText) return null
    return calculatePdfCoordinates(qrPosition, { width: QR_SIZE, height: QR_SIZE })
  }, [qrPosition, qrText, calculatePdfCoordinates])

  // Handlers
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
        setSignaturePosition(DEFAULT_SIGNATURE_POSITION)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSignatureLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget
    let width = img.naturalWidth
    let height = img.naturalHeight

    if (width > SIGNATURE_MAX_WIDTH) {
      height = height * (SIGNATURE_MAX_WIDTH / width)
      width = SIGNATURE_MAX_WIDTH
    }
    if (height > SIGNATURE_MAX_HEIGHT) {
      width = width * (SIGNATURE_MAX_HEIGHT / height)
      height = SIGNATURE_MAX_HEIGHT
    }

    setOriginalSignatureDimensions({ width, height })
    setSignatureDimensions({ width, height })
    setSignatureScale(SIGNATURE_SCALE_DEFAULT)
  }

  const handleSignatureScaleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const scale = parseInt(event.target.value, 10)
    setSignatureScale(scale)
    setSignatureDimensions({
      width: (originalSignatureDimensions.width * scale) / 100,
      height: (originalSignatureDimensions.height * scale) / 100
    })
  }

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
    setSignaturePosition(DEFAULT_SIGNATURE_POSITION)
  }

  const handleClearQr = () => {
    setQrText('')
    setSavedQrPosition(null)
    setQrPosition(DEFAULT_QR_POSITION)
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

      {pdfFile && (
        <ConfigModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          pdfFile={pdfFile}
          currentPage={currentPage}
          totalPages={totalPages}
          pageInputValue={pageInputValue}
          containerRef={pdfContainerRef}
          onDocumentLoadSuccess={handleDocumentLoadSuccess}
          onPageInputChange={setPageInputValue}
          onPageInputKeyDown={handlePageInputKeyDown}
          onGoToPage={handleGoToPage}
          signatureImage={signatureImage}
          signaturePosition={signaturePosition}
          signatureDimensions={signatureDimensions}
          signatureScale={signatureScale}
          onSignatureFileSelect={handleSignatureFileSelect}
          onSignatureLoad={handleSignatureLoad}
          onSignatureScaleChange={handleSignatureScaleChange}
          onClearSignature={handleClearSignature}
          qrText={qrText}
          qrPosition={qrPosition}
          qrSize={QR_SIZE}
          onQrTextChange={setQrText}
          onClearQr={handleClearQr}
          signatureCoordinates={signatureCoordinates}
          qrCoordinates={qrCoordinates}
          draggingElement={draggingElement}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onSave={handleSavePositions}
        />
      )}
    </div>
  )
}

export default App
