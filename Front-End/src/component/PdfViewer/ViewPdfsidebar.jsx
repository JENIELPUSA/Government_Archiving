import React, { useEffect, useState, useRef, useContext } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import axios from "axios";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min?worker";
import { AuthContext } from "../../contexts/AuthContext"; // Keeping AuthContext if it's used elsewhere for file fetching

pdfjs.GlobalWorkerOptions.workerPort = new pdfWorker();

const ViewinCover = ({ fileId }) => {
  const { authToken } = useContext(AuthContext); // Keeping this if file fetching requires auth
  const [fileUrl, setFileUrl] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(0.45); // Changed the default zoom to 0.4 (40%)
  const pdfWrapperRef = useRef(null);

  const originalPdfBytesRef = useRef(null);

  useEffect(() => {
    let canceled = false;
    let objectUrl;

    const fetchPDF = async () => {
      try {
        const meta = await axios.get(
          `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Files/${fileId}`
        );
        const { status } = meta.data;

        const res = await axios.get(
          `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Files/streampublic/${fileId}`,
          {
            responseType: "blob",
          }
        );
        let currentPdfBytes = await res.data.arrayBuffer();
        originalPdfBytesRef.current = currentPdfBytes;
        objectUrl = URL.createObjectURL(
          new Blob([currentPdfBytes], { type: "application/pdf" })
        );
        if (!canceled) setFileUrl(objectUrl);
      } catch (error) {
        console.error("Nabigo ang pag-load ng PDF:", error);
      }
    };
    if (fileId) fetchPDF();
    return () => {
      canceled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
      setFileUrl(null);
    };
  }, [fileId]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };
  return (
    <>
      <style>
        {`
        .pdf-viewer-container {
          height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        .pdf-page-container {
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        `}
      </style>

      <div className="flex h-screen w-full">
        <div
          className="pdf-viewer-container flex min-h-[130vh] flex-1 justify-center overflow-y-auto"
          ref={pdfWrapperRef}
        >
          {fileUrl ? (
            <div className="print-pdf-container w-full max-w-4xl overflow-hidden">
              <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess}>
                <div className="pdf-page-container print-pdf-container relative w-full">
                  <Page pageNumber={pageNumber} scale={scale} />
                </div>
              </Document>
            </div>
          ) : (
            <p>Loading Data...</p>
          )}
        </div>
      </div>
    </>
  );
};

export default ViewinCover;