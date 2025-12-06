import { useState, useEffect, useContext } from "react";
import axios from "axios";
import API_URL from '../config';
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { Plus, Book, Loader2, UploadCloud } from 'lucide-react'
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    const [showModal, setShowModal] = useState(false);
    const { user } = useContext(AuthContext);

    const fetchBooks = async () => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            const { data } = await axios.get(`${API_URL}/api/books`, config);
            setBooks(data);
        } catch (error) {
            console.error("Error fetching books: ", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBooks();
    }, [user]);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!title || !file) return;

        setUploading(true);

        const formData = new FormData();
        formData.append('title', title);
        formData.append('pdfFile', file);

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                    'Content-Type': 'multipart/form-data'
                },
            };

            await axios.post(
                `${API_URL}/api/books`,
                formData,
                config,
            );

            setShowModal(false);
            setTitle('');
            setFile(null);
            fetchBooks();

        } catch (error) {
            alert('Uplaod failed: ' + (error.response?.data?.message || error.message));
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">My Library</h1>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition shadow-sm"
                    >
                        <Plus className="w-5 h-5" /> New Book
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center mt-20"><Loader2 className="animate-spin text-indigo-600 w-8 h-8" /></div>
                ) : books.length === 0 ? (
                    <div className="text-center mt-20 opacity-50">
                        <Book className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <p className="text-xl">Your library is empty.</p>
                        <p className="text-sm">Upload a PDF to get started!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {books.map((book) => (
                            <Link to={`/read/${book._id}`} key={book._id} className="group">
                                <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 overflow-hidden h-full flex flex-col">
                                    {/* Fake Book Cover */}
                                    <div className="h-40 bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition">
                                        <Book className="w-12 h-12 text-indigo-300 group-hover:text-indigo-500 transition" />
                                    </div>
                                    <div className="p-4 flex-1">
                                        <h3 className="font-semibold text-gray-900 truncate" title={book.title}>{book.title}</h3>
                                        <p className="text-xs text-gray-500 mt-1">Uploaded {new Date(book.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

            </main>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold mb-4">Add to Library</h2>

                        <form onSubmit={handleUpload} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Book Title</label>
                                <input
                                    type="text"
                                    className="w-full border rounded-lg p-2"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition cursor-pointer relative">
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={e => setFile(e.target.files[0])}
                                    required
                                />
                                <UploadCloud className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600 font-medium">
                                    {file ? file.name : "Click to upload PDF"}
                                </p>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex justify-center"
                                >
                                    {uploading ? <Loader2 className="animate-spin w-5 h-5" /> : "Upload"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;