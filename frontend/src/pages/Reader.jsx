import { useState, useEffect, useContext, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import axios from 'axios';
import API_URL from '../config';
import { AuthContext } from "../context/AuthContext";
import { Document, Page, pdfjs } from "react-pdf";
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2, Sparkles, AlertCircle } from "lucide-react";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

const Reader = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);

    const [book, setBook] = useState(null);
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [loading, setLoading] = useState(true);

    const [containerWidth, setContainerWidth] = useState(null);
    const pdfWrapperRef = useRef(null);

    const [pageText, setPageText] = useState('');
    const [aiImage, setAiImage] = useState(null);
    const [generatingImg, setGeneratingImg] = useState(false);

    useEffect(() => {
        const fetchBook = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get(`${API_URL}/api/books/${id}`, config);
                setBook(data);
            } catch (error) {
                console.error("Error loading Book:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBook();
    }, [id, user]);

    const updateWidth = useCallback(() => {
        if (pdfWrapperRef.current) {
            setContainerWidth(pdfWrapperRef.current.clientWidth - 64);
        }
    }, []);

    useEffect(() => {
        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, [updateWidth]);

    const onPageLoadSuccess = async (page) => {
        const textContent = await page.getTextContent();
        const text = textContent.items.map((item) => item.str).join(' ');
        setPageText(text);
        generateImage(text);
    };

    const generateImage = async (text) => {
        if (!text || text.length < 20) return;

        setGeneratingImg(true);

        const cleanText = text.replace(/\s+/g, ' ').substring(0, 500);
        const style = "comic book page, graphic novel style, multiple panels, speech bubbles with text, expressive characters, flat colors, thick outlines, modern webtoon style";
        
        const prompt = `${style}, scene description: ${cleanText.replace(/[^\w\s]/gi, '')}`;
        const encodedPrompt = encodeURIComponent(prompt);

        const seed = Math.floor(Math.random() * 1000);
        const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=${seed}&nologo=true&model=flux`;

        const img = new Image();
        img.src = url;
        img.onload = () => {
            setAiImage(url);
            setGeneratingImg(false);
        };
    };

    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages);
    };

    const changePage = (offset) => {
        setPageNumber(prev => {
            const target = prev + offset;
            if (target < 1) return 1;
            if (target > numPages) return numPages;
            return target;
        });
    };

    if (loading) return <div className="flex h-screen items-center justify-center bg-gray-900"><Loader2 className="animate-spin w-10 h-10 text-indigo-500"/></div>;
    if (!book) return <div className="text-center p-10 bg-gray-900 text-white">Book not found</div>;

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-white overflow-hidden">

            {/* Header */}
            <header className="h-14 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4 z-10">
                <div className="flex items-center gap-4">
                    <Link to="/" className="p-2 hover:bg-gray-700 rounded-full transition"><ArrowLeft className="w-5 h-5" /></Link>
                    <h1 className="font-medium truncate max-w-xs">{book.title}</h1>
                </div>
                <div className="text-sm text-gray-400 font-mono border border-gray-600 px-2 py-0.5 rounded">
                    Page {pageNumber} / {numPages}
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                <div 
                    ref={pdfWrapperRef}
                    className="flex-1 overflow-auto bg-gray-800/50 flex flex-col items-center p-8 relative custom-scrollbar"
                >
                    <div className="shadow-2xl border border-gray-700 w-full"> 
                        <Document
                            file={`${API_URL}/${book.filePath}`}
                            onLoadSuccess={onDocumentLoadSuccess}
                            loading={<div className="text-white p-10">Loading PDF...</div>}
                            className="flex justify-center"
                        >
                            <Page
                                pageNumber={pageNumber}
                                onLoadSuccess={onPageLoadSuccess}
                                renderTextLayer={true}
                                renderAnnotationLayer={false}
                                width={containerWidth || 500} 
                                className="bg-white"
                            />
                        </Document>
                    </div>

                    <div className="fixed bottom-8 bg-gray-900/90 p-2 rounded-full border border-gray-600 backdrop-blur-md shadow-2xl flex gap-4 z-20">
                        <button
                            onClick={() => changePage(-1)}
                            disabled={pageNumber <= 1}
                            className="p-3 hover:bg-gray-700 rounded-full disabled:opacity-30 transition-colors"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                            onClick={() => changePage(1)}
                            disabled={pageNumber >= numPages}
                            className="p-3 hover:bg-gray-700 rounded-full disabled:opacity-30 transition-colors"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="w-1/2 bg-black border-l border-gray-800 relative flex flex-col">
                    <div className="flex-1 relative overflow-hidden bg-gray-950">
                        {aiImage ? (
                            <img
                                src={aiImage}
                                alt="Comic Visualization"
                                className={`w-full h-full object-contain transition-opacity duration-500 ${generatingImg ? 'opacity-50 blur-sm' : 'opacity-100'}`}
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center flex-col opacity-30 p-8">
                                <Sparkles className="w-16 h-16 mb-4 text-gray-500" />
                                <p>Waiting for story...</p>
                            </div>
                        )}

                        {generatingImg && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-black/70 backdrop-blur-md px-6 py-4 rounded-2xl border border-gray-700 flex flex-col items-center shadow-2xl">
                                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-2" />
                                    <span className="text-sm font-bold text-indigo-300">Drawing Comic Panel...</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="h-auto max-h-32 bg-gray-900 border-t border-gray-800 p-4 overflow-y-auto">
                        <p className="text-[10px] text-indigo-400 uppercase tracking-widest font-bold mb-1">Scene Context</p>
                        <p className="text-xs text-gray-400 font-mono leading-relaxed">
                            {pageText.substring(0, 200)}...
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reader;