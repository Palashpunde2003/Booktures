import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { LogOut, BookOpen, User } from "lucide-react";
import { Link } from 'react-router-dom';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);

    return (
        <nav className="bg-white shadow-sm border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">

                    <div className="flex items-center">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="bg-indigo-600 p-1.5 rounded-lg">
                                <BookOpen className="h-6 w-6 text-white" />
                            </div>
                            <span className="font-bold text-xl text-gray-900 tracking-tight">Booktures</span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                            <User className="w-4 h-4" />
                            <span className="text-sm font-medium">{user?.name}</span>
                        </div>

                        <button
                            onClick={logout}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;