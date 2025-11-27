import { useState, useEffect, useContext, use } from "react";
import { useParams, Link } from "react-router-dom";
import axios from 'axios';
import { AuthContext } from "../context/AuthContext";
import { Document, Page, pdfjs } from "react-pdf";
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2, Sparkles } from "lucide-react";

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

    const [pageText, setPageText] = useState('');
    const [aiImage, setAiImage] = useState('null');
    const [generatingImg, setGeneratingImg] = useState(false);

    useEffect(() => {
        const fetchBook = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get(`http://localhost:3000/api/books/${id}`, config);
                setBook(data);
            } catch (error) {
                console.error("Error loading Book:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBook();
    }, [id, user]);

    const onPageLoadSuccess = async (page) => {
        const textContent = await page.getTextContent();
        const text = textContent.items.map((item) => item.str).join(' ');
        setPageText(text);

        generateImage(text);
    };

    const generateImage = async (text) => {
        if (!text) return;

        setGeneratingImg(true);

        const prompt = `cinematic fantasy art, detailed, ${text.substring(0, 300).replace(/[^\w\s]/gi, '')}`;
        const encodedPrompt = encodeURIComponent(prompt);

        const seed = Math.floor(Math.random() * 1000);
        const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=${seed}&nologo=true`;

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

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin w-10 h-10 text-indigo-600"/></div>;
    if (!book) return <div className="text-center p-10">Book not found</div>;

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-white overflow-hidden">

            <header className="h-14 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4 z-10">
                <div className="flex items-center gap-4">
                    <Link to="/" className="p-2 hover:bg-gray-700 rounded-full transition"><ArrowLeft className="w-5 h-5" /></Link>
                    <h1 className="font-medium truncate max-w-xs">{book.title}</h1>
                </div>
                <div className="text-sm text-gray-400">
                    Page {pageNumber} of {numPages}
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">

                <div className="flex-1 overflow-auto bg-gray-500/10 flex justify-center p-8 relative">
                    <Document
                        file={`http://localhost:3000/${book.filePath}`} // Pointing to our backend static folder
                        onLoadSuccess={onDocumentLoadSuccess}
                        loading={<div className="text-white">Loading PDF...</div>}
                        className="shadow-2xl"
                    >
                        <Page
                            pageNumber={pageNumber}
                            onLoadSuccess={onPageLoadSuccess}
                            renderTextLayer={true} // Needed for text extraction
                            renderAnnotationLayer={false}
                            width={500} // Fixed width for consistency
                            className="bg-white shadow-xl"
                        />
                    </Document>

                    <div className="absolute bottom-8 flex gap-4 bg-gray-800/90 p-2 rounded-xl backdrop-blur-sm shadow-xl">
                        <button
                            onClick={() => changePage(-1)}
                            disabled={pageNumber <= 1}
                            className="p-2 hover:bg-gray-700 rounded-lg disabled:opacity-30"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                            onClick={() => changePage(1)}
                            disabled={pageNumber >= numPages}
                            className="p-2 hover:bg-gray-700 rounded-lg disabled:opacity-30"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="w-[45%] bg-black border-l border-gray-800 relative flex items-center justify-center overflow-hidden">

                    {aiImage && !generatingImg ? (
                        <img
                            src={aiImage}
                            alt="AI Visualization"
                            className="w-full h-full object-cover animate-in fade-in duration-700"
                        />
                    ) : (
                        <div className="text-center p-8">
                            <div className="relative inline-block">
                                <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 animate-pulse"></div>
                                <Sparkles className={`w-12 h-12 text-indigo-400 mx-auto mb-4 ${generatingImg ? 'animate-pulse' : ''}`} />
                            </div>
                            <p className="text-indigo-300 font-medium">
                                {generatingImg ? "Dreaming up the scene..." : "Waiting for story..."}
                            </p>
                            <p className="text-gray-500 text-xs mt-2 max-w-xs mx-auto">
                                {generatingImg ? "Analyzing page context & generating visuals" : "Turn the page to see the magic."}
                            </p>
                        </div>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Context Analysis</p>
                        <p className="text-xs text-gray-300 line-clamp-2 opacity-60 font-mono">
                            {pageText.substring(0, 150)}...
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reader;