import React, { useState, useEffect } from 'react';
// Firebase imports (will be initialized if __firebase_config is available)
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, getDocs, onSnapshot, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';

// Global variables for Firebase configuration (provided by Canvas environment)
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

function App() {
    // State for Firebase
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);

    // Sample data for files (will be replaced by Firestore data in a real app)
    const [files, setFiles] = useState([
        {
            id: 'file1',
            name: 'Project Proposal.pdf',
            type: 'PDF Document',
            size: '1.2 MB',
            date: '2023-03-15',
            tags: ['Proyekto A', 'Panukala', '2023'],
            imageUrl: 'https://placehold.co/150x100/e0e7ff/6366f1?text=PDF'
        },
        {
            id: 'file2',
            name: 'Team Meeting Notes.docx',
            type: 'Word Document',
            size: '345 KB',
            date: '2023-03-10',
            tags: ['Pulong', 'Team', '2023'],
            imageUrl: 'https://placehold.co/150x100/e0e7ff/6366f1?text=DOCX'
        },
        {
            id: 'file3',
            name: 'Marketing Campaign.pptx',
            type: 'PowerPoint Presentation',
            size: '5.8 MB',
            date: '2023-03-20',
            tags: ['Marketing', 'Kampanya', '2023', 'Proyekto B'],
            imageUrl: 'https://placehold.co/150x100/e0e7ff/6366f1?text=PPTX'
        },
        {
            id: 'file4',
            name: 'Invoice_Q1_2023.xlsx',
            type: 'Excel Spreadsheet',
            size: '80 KB',
            date: '2023-03-01',
            tags: ['Pananalapi', 'Invoice', 'Q1'],
            imageUrl: 'https://placehold.co/150x100/e0e7ff/6366f1?text=XLSX'
        },
        {
            id: 'file5',
            name: 'Website Mockup.png',
            type: 'PNG Image',
            size: '2.1 MB',
            date: '2023-03-25',
            tags: ['Disenyo', 'Website', 'Graphics'],
            imageUrl: 'https://placehold.co/150x100/e0e7ff/6366f1?text=PNG'
        },
        {
            id: 'file6',
            name: 'Client Contract.pdf',
            type: 'PDF Document',
            size: '750 KB',
            date: '2023-03-18',
            tags: ['Kontrata', 'Kliyente', 'Legal'],
            imageUrl: 'https://placehold.co/150x100/e0e7ff/6366f1?text=PDF'
        },
        {
            id: 'file7',
            name: 'Annual Report 2022.pdf',
            type: 'PDF Document',
            size: '10.5 MB',
            date: '2023-01-20',
            tags: ['Ulat', 'Taunan', '2022'],
            imageUrl: 'https://placehold.co/150x100/e0e7ff/6366f1?text=PDF'
        }
    ]);

    const [allAvailableTags, setAllAvailableTags] = useState(() => {
        // Initialize allAvailableTags from existing files
        return Array.from(new Set(files.flatMap(file => file.tags))).sort();
    });

    const [currentSelectedFileId, setCurrentSelectedFileId] = useState(null);
    const [isTagManagementViewVisible, setIsTagManagementViewVisible] = useState(false);
    const [isDetailsPaneVisible, setIsDetailsPaneVisible] = useState(false);
    const [messageBox, setMessageBox] = useState({ visible: false, title: '', content: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFilterTags, setSelectedFilterTags] = useState([]);
    const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
    const [newTagInput, setNewTagInput] = useState('');
    const [addTagInput, setAddTagInput] = useState('');
    const [tagSuggestions, setTagSuggestions] = useState([]);

    // Firebase Initialization and Authentication
    useEffect(() => {
        if (firebaseConfig) {
            const app = initializeApp(firebaseConfig);
            const firestore = getFirestore(app);
            const authInstance = getAuth(app);
            setDb(firestore);
            setAuth(authInstance);

            const unsubscribe = onAuthStateChanged(authInstance, async (user) => {
                if (user) {
                    setUserId(user.uid);
                } else {
                    // Sign in anonymously if no token is provided or user is not logged in
                    try {
                        if (initialAuthToken) {
                            await signInWithCustomToken(authInstance, initialAuthToken);
                        } else {
                            await signInAnonymously(authInstance);
                        }
                    } catch (error) {
                        console.error("Firebase authentication error:", error);
                        showMessageBox('Authentication Error', `Failed to authenticate: ${error.message}`);
                    }
                }
                setIsAuthReady(true);
            });

            return () => unsubscribe(); // Cleanup auth listener
        } else {
            console.warn("Firebase config not found. Running in demo mode without persistence.");
            setIsAuthReady(true); // Treat as ready for demo purposes
        }
    }, []);

    // Effect to fetch initial data or set up listeners (if using Firestore)
    useEffect(() => {
        if (db && userId && isAuthReady) {
            // Example of setting up a Firestore listener for files
            // const filesCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/files`);
            // const unsubscribeFiles = onSnapshot(filesCollectionRef, (snapshot) => {
            //     const fetchedFiles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            //     setFiles(fetchedFiles);
            //     // Update allAvailableTags based on fetched files
            //     setAllAvailableTags(Array.from(new Set(fetchedFiles.flatMap(file => file.tags))).sort());
            // });
            // return () => unsubscribeFiles(); // Cleanup listener
            console.log(`Firebase ready. User ID: ${userId}. App ID: ${appId}`);
            showMessageBox('Firebase Status', `Firebase ready. User ID: ${userId}. App ID: ${appId}. (Data persistence not fully implemented in this UI demo)`);
        }
    }, [db, userId, isAuthReady]);


    // Filtered files based on search term and selected tags
    const filteredFiles = files.filter(file => {
        const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              file.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesTags = selectedFilterTags.length === 0 ||
                            selectedFilterTags.every(selectedTag => file.tags.includes(selectedTag));
        return matchesSearch && matchesTags;
    });

    // Function to show custom message box
    const showMessageBox = (title, content) => {
        setMessageBox({ visible: true, title, content });
    };

    // Event listener for message box OK button
    const handleMessageBoxClose = () => {
        setMessageBox({ ...messageBox, visible: false });
    };

    // Function to select a file and show details
    const selectFile = (file) => {
        setCurrentSelectedFileId(file.id);
        setIsDetailsPaneVisible(true);
        setIsTagManagementViewVisible(false); // Hide tag management if file is selected
    };

    // Function to remove a tag from a file
    const removeTagFromFile = (fileId, tagToRemove) => {
        const updatedFiles = files.map(file =>
            file.id === fileId
                ? { ...file, tags: file.tags.filter(tag => tag !== tagToRemove) }
                : file
        );
        setFiles(updatedFiles);
        showMessageBox('Tag Tinanggal', `Ang tag na "${tagToRemove}" ay tinanggal mula sa file.`);
        // In a real app, you would update Firestore here:
        // const fileRef = doc(db, `artifacts/${appId}/users/${userId}/files`, fileId);
        // updateDoc(fileRef, { tags: files.find(f => f.id === fileId).tags.filter(tag => tag !== tagToRemove) });
    };

    // Function to add a tag to a file
    const addTagToFile = (fileId, tagToAdd) => {
        const file = files.find(f => f.id === fileId);
        if (file) {
            if (!file.tags.includes(tagToAdd)) {
                const updatedFiles = files.map(f =>
                    f.id === fileId
                        ? { ...f, tags: [...f.tags, tagToAdd] }
                        : f
                );
                setFiles(updatedFiles);
                showMessageBox('Tag Idinagdag', `Ang tag na "${tagToAdd}" ay idinagdag sa file.`);

                // Update allAvailableTags if new
                if (!allAvailableTags.includes(tagToAdd)) {
                    setAllAvailableTags(prevTags => [...prevTags, tagToAdd].sort());
                }
                // In a real app, you would update Firestore here:
                // const fileRef = doc(db, `artifacts/${appId}/users/${userId}/files`, fileId);
                // updateDoc(fileRef, { tags: [...file.tags, tagToAdd] });
            } else {
                showMessageBox('Tag Umiiral', `Ang tag na "${tagToAdd}" ay umiiral na sa file.`);
            }
            setAddTagInput(''); // Clear input
            setTagSuggestions([]); // Hide suggestions
        }
    };

    // Search functionality handler
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Filter by Tags dropdown handlers
    const handleFilterTagsClick = () => {
        setIsFilterDropdownOpen(prev => !prev);
    };

    const handleTagFilterChange = (e) => {
        const tag = e.target.value;
        setSelectedFilterTags(prev =>
            e.target.checked ? [...prev, tag] : prev.filter(t => t !== tag)
        );
    };

    // Tag Management View handlers
    const handleViewTagsClick = (e) => {
        e.preventDefault();
        setIsTagManagementViewVisible(true);
        setIsDetailsPaneVisible(false); // Hide details pane when in tag management
        setCurrentSelectedFileId(null); // Deselect any file
    };

    const handleAddNewTag = () => {
        const newTag = newTagInput.trim();
        if (newTag && !allAvailableTags.includes(newTag)) {
            setAllAvailableTags(prevTags => [...prevTags, newTag].sort());
            setNewTagInput('');
            showMessageBox('Tag Idinagdag', `Ang bagong tag na "${newTag}" ay matagumpay na idinagdag.`);
            // In a real app, you would add this to a separate 'tags' collection in Firestore
            // addDoc(collection(db, `artifacts/${appId}/users/${userId}/tags`), { name: newTag });
        } else if (newTag) {
            showMessageBox('Tag Umiiral', `Ang tag na "${newTag}" ay umiiral na.`);
        }
    };

    const handleDeleteTagGlobally = (tagToDelete) => {
        // Using a custom message box for confirmation instead of window.confirm
        setMessageBox({
            visible: true,
            title: 'Kumpirmahin ang Pagtanggal',
            content: `Sigurado ka bang gusto mong tanggalin ang tag na "${tagToDelete}"? Ito ay tatanggalin sa lahat ng files.`,
            onConfirm: () => {
                setAllAvailableTags(prevTags => prevTags.filter(tag => tag !== tagToDelete));
                // Also remove this tag from all files
                setFiles(prevFiles => prevFiles.map(file => ({
                    ...file,
                    tags: file.tags.filter(tag => tag !== tagToDelete)
                })));
                showMessageBox('Tag Tinanggal', `Ang tag na "${tagToDelete}" ay tinanggal mula sa lahat ng files.`);
                // In a real app, you would update Firestore:
                // 1. Delete from 'tags' collection
                // 2. Update all documents in 'files' collection that contain this tag
                handleMessageBoxClose(); // Close the confirmation box
            },
            showCancel: true
        });
    };

    // Add Tag input with auto-suggest
    const handleAddTagInputChange = (e) => {
        const inputVal = e.target.value;
        setAddTagInput(inputVal);

        if (inputVal.length > 0) {
            const currentFile = files.find(f => f.id === currentSelectedFileId);
            const currentFileTags = currentFile ? currentFile.tags : [];

            const filteredSuggestions = allAvailableTags.filter(tag =>
                tag.toLowerCase().includes(inputVal.toLowerCase()) &&
                !currentFileTags.includes(tag)
            );
            setTagSuggestions(filteredSuggestions);
        } else {
            setTagSuggestions([]);
        }
    };

    // Handle click outside for dropdowns and suggestions
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Close filter dropdown
            if (isFilterDropdownOpen && !event.target.closest('#filter-tags-btn') && !event.target.closest('#tag-filter-dropdown')) {
                setIsFilterDropdownOpen(false);
            }
            // Close tag suggestions
            if (tagSuggestions.length > 0 && !event.target.closest('#add-tag-input') && !event.target.closest('#tag-suggestions')) {
                setTagSuggestions([]);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isFilterDropdownOpen, tagSuggestions]);


    // Get the currently selected file object for details pane
    const selectedFile = files.find(file => file.id === currentSelectedFileId);

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-lg flex flex-col p-6">
                <div className="text-2xl font-bold text-indigo-700 mb-8">
                    Archive.ph
                </div>
                <nav className="flex-grow">
                    <ul>
                        <li className="mb-4">
                            <a href="#" onClick={() => { setIsTagManagementViewVisible(false); setCurrentSelectedFileId(null); setIsDetailsPaneVisible(false); }} className="flex items-center text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-lg transition-colors duration-200">
                                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 001 1h3m-6-6h.01M6 18h.01"></path></svg>
                                Lahat ng Files
                            </a>
                        </li>
                        <li className="mb-4">
                            <a href="#" id="view-tags-btn" onClick={handleViewTagsClick} className="flex items-center text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-lg transition-colors duration-200">
                                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
                                Tags
                            </a>
                        </li>
                        <li className="mb-4">
                            <a href="#" className="flex items-center text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-lg transition-colors duration-200">
                                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                Hanapin
                            </a>
                        </li>
                    </ul>
                </nav>
                <button onClick={() => showMessageBox('Upload Feature', 'Ang feature sa pag-upload ay idaragdag sa hinaharap na update!')} className="flex items-center justify-center bg-indigo-600 text-white py-3 px-4 rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-200">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                    Mag-upload ng File
                </button>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col p-8 overflow-hidden">
                <header className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Lahat ng Files</h1>
                    <div className="flex items-center space-x-4">
                        <div className="relative w-64">
                            <input
                                type="text"
                                id="search-input"
                                placeholder="Maghanap ng files o tags..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </div>
                        {/* Filter by Tags Dropdown */}
                        <div className="relative">
                            <button
                                id="filter-tags-btn"
                                onClick={handleFilterTagsClick}
                                className="flex items-center bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
                                Filter by Tags
                            </button>
                            {isFilterDropdownOpen && (
                                <div id="tag-filter-dropdown" className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                                    {allAvailableTags.length === 0 ? (
                                        <p className="px-4 py-2 text-gray-500">Walang tags.</p>
                                    ) : (
                                        allAvailableTags.map(tag => (
                                            <label key={tag} className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="form-checkbox h-4 w-4 text-indigo-600 rounded"
                                                    value={tag}
                                                    checked={selectedFilterTags.includes(tag)}
                                                    onChange={handleTagFilterChange}
                                                />
                                                <span className="ml-2 text-gray-700">{tag}</span>
                                            </label>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* File List/Grid */}
                <div id="file-list-container" className="flex-1 overflow-y-auto pr-4">
                    {!isTagManagementViewVisible ? (
                        <div id="file-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredFiles.length === 0 ? (
                                <p className="col-span-full text-center text-gray-500 mt-8">Walang nahanap na files.</p>
                            ) : (
                                filteredFiles.map(file => (
                                    <div
                                        key={file.id}
                                        id={`file-card-${file.id}`}
                                        className={`bg-white rounded-lg shadow-md p-4 flex flex-col items-start cursor-pointer transition-all duration-200 hover:shadow-lg ${file.id === currentSelectedFileId ? 'selected-file-card' : ''}`}
                                        onClick={() => selectFile(file)}
                                    >
                                        <div className="w-full h-24 bg-gray-100 rounded-md flex items-center justify-center mb-3 overflow-hidden">
                                            <img src={file.imageUrl} alt="File thumbnail" className="max-w-full max-h-full object-contain" />
                                        </div>
                                        <p className="font-semibold text-gray-800 text-sm mb-1">{file.name}</p>
                                        <p className="text-xs text-gray-500 mb-2">{file.type} - {file.size}</p>
                                        <div className="flex flex-wrap gap-1">
                                            {file.tags.map(tag => (
                                                <span key={tag} className="tag-bubble">{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        /* Tag Management View */
                        <div id="tag-management-view" className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Pamamahala ng Tags</h2>
                            <div id="all-tags-display" className="flex flex-wrap gap-2 mb-6">
                                {allAvailableTags.length === 0 ? (
                                    <p className="text-gray-500">Walang tags na idinagdag pa.</p>
                                ) : (
                                    allAvailableTags.map(tag => (
                                        <span key={tag} className="tag-bubble flex items-center group">
                                            {tag}
                                            <button
                                                className="ml-1 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                                onClick={() => handleDeleteTagGlobally(tag)}
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                            </button>
                                        </span>
                                    ))
                                )}
                            </div>
                            <div className="flex items-center space-x-3">
                                <input
                                    type="text"
                                    id="new-tag-input"
                                    placeholder="Magdagdag ng bagong tag..."
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={newTagInput}
                                    onChange={(e) => setNewTagInput(e.target.value)}
                                    onKeyPress={(e) => { if (e.key === 'Enter') handleAddNewTag(); }}
                                />
                                <button
                                    id="add-new-tag-btn"
                                    onClick={handleAddNewTag}
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                                >
                                    Idagdag
                                </button>
                            </div>
                            <p className="text-sm text-gray-500 mt-2">Maaari mong i-click ang isang tag upang i-edit o tanggalin ito.</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Details/Preview Pane */}
            {isDetailsPaneVisible && selectedFile && (
                <aside id="details-pane" className="w-96 bg-white shadow-lg p-6 flex flex-col">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Mga Detalye ng File</h2>
                    <div id="file-preview" className="flex-grow bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 mb-4 overflow-hidden">
                        {selectedFile.imageUrl ? (
                            <img id="preview-image" src={selectedFile.imageUrl} alt="File Preview" className="max-w-full max-h-full object-contain" />
                        ) : (
                            <svg id="preview-placeholder" className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        )}
                    </div>
                    <div className="space-y-3 mb-6">
                        <div>
                            <p className="text-sm text-gray-500">Pangalan ng File:</p>
                            <p id="detail-filename" className="font-medium text-gray-800">{selectedFile.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Uri ng File:</p>
                            <p id="detail-filetype" className="font-medium text-gray-800">{selectedFile.type}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Laki:</p>
                            <p id="detail-filesize" className="font-medium text-gray-800">{selectedFile.size}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Petsa ng Pag-upload:</p>
                            <p id="detail-date" className="font-medium text-gray-800">{selectedFile.date}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Tags:</p>
                            <div id="detail-tags" className="flex flex-wrap gap-1 mt-1">
                                {selectedFile.tags.map(tag => (
                                    <span key={tag} className="tag-bubble flex items-center group">
                                        {tag}
                                        <button
                                            className="ml-1 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                            onClick={(e) => { e.stopPropagation(); removeTagFromFile(selectedFile.id, tag); }}
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <div className="relative mt-2">
                                <input
                                    type="text"
                                    id="add-tag-input"
                                    placeholder="Magdagdag ng tag..."
                                    className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    value={addTagInput}
                                    onChange={handleAddTagInputChange}
                                    onKeyPress={(e) => { if (e.key === 'Enter' && addTagInput.trim()) addTagToFile(selectedFile.id, addTagInput.trim()); }}
                                />
                                {tagSuggestions.length > 0 && (
                                    <div id="tag-suggestions" className="absolute bg-white border border-gray-200 rounded-md shadow-lg mt-1 w-full z-20">
                                        {tagSuggestions.map(tag => (
                                            <div
                                                key={tag}
                                                className="px-3 py-2 cursor-pointer hover:bg-indigo-50 text-gray-700 text-sm"
                                                onClick={() => addTagToFile(selectedFile.id, tag)}
                                            >
                                                {tag}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-3">
                        <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-200">I-download</button>
                        <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200">Burahin</button>
                    </div>
                </aside>
            )}

            {/* Custom Message Box */}
            {messageBox.visible && (
                <div id="message-box" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
                        <h3 id="message-box-title" className="text-lg font-semibold mb-3 text-gray-800">{messageBox.title}</h3>
                        <p id="message-box-content" className="text-gray-600 mb-6">{messageBox.content}</p>
                        <div className="flex justify-center space-x-4">
                            <button id="message-box-ok-btn" onClick={messageBox.onConfirm || handleMessageBoxClose} className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200">OK</button>
                            {messageBox.showCancel && (
                                <button onClick={handleMessageBoxClose} className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors duration-200">Kanselahin</button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
