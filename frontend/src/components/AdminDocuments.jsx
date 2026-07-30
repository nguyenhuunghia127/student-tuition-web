import React, { useState, useEffect } from 'react';
import { API_URL } from '../config.js';
import Swal from 'sweetalert2';
import { FileText, Plus, Trash2, Search, Link as LinkIcon, Folder, Filter, Edit2, ChevronRight, LayoutGrid, List, FileSpreadsheet, File, Video, MoreVertical } from 'lucide-react';

const getDocumentIcon = (url) => {
  if (!url) return <FileText className="w-full h-full text-purple-500" />;
  const lurl = url.toLowerCase();
  if (lurl.includes('youtube.com') || lurl.includes('youtu.be')) return <Video className="w-full h-full text-red-500" />;
  if (lurl.includes('docs.google.com/spreadsheets')) return <FileSpreadsheet className="w-full h-full text-emerald-500" />;
  if (lurl.includes('docs.google.com/document')) return <FileText className="w-full h-full text-blue-500" />;
  if (lurl.includes('.pdf')) return <File className="w-full h-full text-rose-500" />;
  return <FileText className="w-full h-full text-purple-500" />;
};

export default function AdminDocuments({ adminUser, fetchStats }) {
  const [documents, setDocuments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [classFilter, setClassFilter] = useState('');
  
  const [folderPath, setFolderPath] = useState([]); // Array of category objects
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [sortBy, setSortBy] = useState('dateDesc'); // 'dateDesc' | 'dateAsc' | 'nameAsc' | 'nameDesc'

  // Modal state
  const [showDocModal, setShowDocModal] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false);
  
  const [docForm, setDocForm] = useState({ id: '', title: '', description: '', drive_link: '', category_id: '', class_name: '' });
  const [catForm, setCatForm] = useState({ id: '', name: '', class_name: '', parent_id: '' });

  const currentFolderId = folderPath.length > 0 ? folderPath[folderPath.length - 1].category_id : null;

  useEffect(() => {
    fetchDocuments();
    fetchCategories();
  }, [classFilter]); 

  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token') || '';
    return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
  };

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      let url = `${API_URL}/api/documents?`;
      if (classFilter) url += `class_name=${classFilter}&`;

      const res = await fetch(url, { headers: getAuthHeaders() });
      const data = await res.json();
      setDocuments(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      let url = `${API_URL}/api/documents/categories?`;
      if (classFilter) url += `class_name=${classFilter}&`;
      
      const res = await fetch(url, { headers: getAuthHeaders() });
      const data = await res.json();
      setCategories(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveDocument = async (e) => {
    e.preventDefault();
    try {
      const isEdit = !!docForm.id;
      const url = isEdit ? `${API_URL}/api/documents/${docForm.id}` : `${API_URL}/api/documents`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(docForm)
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Lỗi lưu tài liệu');
      }
      setShowDocModal(false);
      setDocForm({ id: '', title: '', description: '', drive_link: '', category_id: '', class_name: '' });
      await fetchDocuments();
      if(fetchStats) await fetchStats();
    } catch (err) {
      Swal.fire('Lỗi', String(err.message), 'error');
    }
  };

  const handleDeleteDocument = async (id) => {
    const confirmResult = await Swal.fire({
      title: 'Xác nhận',
      text: 'Bạn có chắc muốn xóa tài liệu này?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy'
    });
    if (!confirmResult.isConfirmed) return;
    try {
      const res = await fetch(`${API_URL}/api/documents/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Lỗi xóa tài liệu');
      await fetchDocuments();
      if(fetchStats) await fetchStats();
    } catch (err) {
      Swal.fire('Lỗi', String(err.message), 'error');
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      const isEdit = !!catForm.id;
      const url = isEdit ? `${API_URL}/api/documents/categories/${catForm.id}` : `${API_URL}/api/documents/categories`;
      const method = isEdit ? 'PUT' : 'POST';
      
      const payload = { 
        name: catForm.name, 
        class_name: catForm.class_name,
        parent_id: catForm.parent_id || null
      };

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Lỗi lưu thư mục');
      }
      
      setShowCatModal(false);
      setCatForm({ id: '', name: '', class_name: '', parent_id: '' });
      await fetchCategories();
    } catch (err) {
      Swal.fire('Lỗi', String(err.message), 'error');
    }
  };

  const handleDeleteCategory = async (id) => {
    const confirmResult = await Swal.fire({
      title: 'Xác nhận',
      text: 'Bạn có chắc muốn xóa thư mục này? Các tài liệu bên trong sẽ bị mất thư mục (thành tài liệu chung ngoài cùng).',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy'
    });
    if (!confirmResult.isConfirmed) return;
    try {
      const res = await fetch(`${API_URL}/api/documents/categories/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Lỗi xóa thư mục');
      
      // Nếu đang mở thư mục bị xóa thì thoát ra ngoài 1 cấp hoặc về root
      const folderIndex = folderPath.findIndex(f => f.category_id === id);
      if (folderIndex !== -1) {
        setFolderPath(folderPath.slice(0, folderIndex));
      }
      
      await fetchCategories();
      await fetchDocuments(); 
    } catch (err) {
      Swal.fire('Lỗi', String(err.message), 'error');
    }
  };

  const filteredCategories = categories.filter(c => {
    if (searchTerm) {
      return c.name?.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return c.parent_id === currentFolderId;
  }).sort((a, b) => {
    if (sortBy === 'nameAsc') return a.name.localeCompare(b.name);
    if (sortBy === 'nameDesc') return b.name.localeCompare(a.name);
    return a.name.localeCompare(b.name); 
  });

  const filteredDocs = documents.filter(d => {
    const matchesSearch = d.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          d.description?.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    if (searchTerm) return true;
    return d.category_id === currentFolderId;
  }).sort((a, b) => {
    if (sortBy === 'nameAsc') return a.title.localeCompare(b.title);
    if (sortBy === 'nameDesc') return b.title.localeCompare(a.title);
    if (sortBy === 'dateAsc') return new Date(a.created_at || 0) - new Date(b.created_at || 0);
    return new Date(b.created_at || 0) - new Date(a.created_at || 0);
  });

  const isGlobalSearch = !!searchTerm;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        
        {/* Breadcrumb / Title */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-3">
          <button 
            onClick={() => setFolderPath([])}
            className={`text-lg sm:text-xl font-black font-sans flex items-center gap-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors ${folderPath.length === 0 ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}
          >
            <Folder className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500 fill-purple-500/20" />
            Drive
          </button>
          {folderPath.map((folder, index) => (
            <React.Fragment key={folder.category_id}>
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 shrink-0" />
              <button 
                onClick={() => setFolderPath(folderPath.slice(0, index + 1))}
                className={`text-lg sm:text-xl font-black font-sans truncate max-w-[120px] sm:max-w-[200px] hover:text-purple-600 dark:hover:text-purple-400 transition-colors ${index === folderPath.length - 1 ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}
              >
                {folder.name}
              </button>
            </React.Fragment>
          ))}
        </div>
        
        <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-900/60 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-slate-800 shadow-sm text-purple-600' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`} title="Dạng Lưới">
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-slate-800 shadow-sm text-purple-600' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`} title="Dạng Danh sách">
              <List className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>

          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select 
              value={classFilter} 
              onChange={e => {
                setClassFilter(e.target.value);
                setFolderPath([]); // Reset folder khi đổi lớp
              }}
              className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-300 outline-none w-24 cursor-pointer"
            >
              <option value="">Mọi Lớp</option>
              <option value="6">Lớp 6</option>
              <option value="7">Lớp 7</option>
              <option value="8">Lớp 8</option>
              <option value="9">Lớp 9</option>
              <option value="10">Lớp 10</option>
              <option value="11">Lớp 11</option>
              <option value="12">Lớp 12</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <select 
              value={sortBy} 
              onChange={e => setSortBy(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
            >
              <option value="dateDesc">Mới nhất</option>
              <option value="dateAsc">Cũ nhất</option>
              <option value="nameAsc">Tên A-Z</option>
              <option value="nameDesc">Tên Z-A</option>
            </select>
          </div>

          <div className="relative flex-1 min-w-[150px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm tài liệu..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none w-full"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              setCatForm({ id: '', name: '', class_name: classFilter, parent_id: currentFolderId || '' });
              setShowCatModal(true);
            }} 
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold rounded-xl transition-colors shrink-0"
          >
            <Folder className="w-4 h-4" />
            <span className="hidden sm:inline">+ Thư Mục</span>
          </button>
          
          <button 
            onClick={() => {
              setDocForm({ 
                id: '', 
                title: '', 
                description: '', 
                drive_link: '', 
                category_id: currentFolderId || '', 
                class_name: classFilter 
              });
              setShowDocModal(true);
            }} 
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-purple-500/20 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tài Liệu</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500 flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold">Đang tải...</p>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* FOLDERS SECTION */}
          {filteredCategories.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wider">Thư mục</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredCategories.map(cat => (
                  <div 
                    key={cat.category_id} 
                    className="group flex flex-col bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-purple-300 dark:hover:border-purple-500/50 hover:shadow-lg dark:hover:bg-slate-800/60 transition-all cursor-pointer relative"
                    onClick={() => {
                      if (!isGlobalSearch) {
                        setFolderPath([...folderPath, cat]);
                      } else {
                        // If searching globally, clicking folder goes to that folder directly
                        // We need to build the path. For simplicity, just set it as root child for now 
                        // (or clear search and go to folder)
                        setSearchTerm('');
                        // Try to find full path (simple version)
                        let path = [cat];
                        let curr = cat;
                        while(curr.parent_id) {
                           let parent = categories.find(c => c.category_id === curr.parent_id);
                           if(parent) {
                             path.unshift(parent);
                             curr = parent;
                           } else break;
                        }
                        setFolderPath(path);
                      }
                    }}
                  >
                    <div className="p-4 flex items-center gap-3">
                      <Folder className="w-10 h-10 text-slate-400 group-hover:text-purple-500 fill-slate-100 group-hover:fill-purple-500/20 transition-colors shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{cat.name}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{cat.class_name ? `Lớp ${cat.class_name}` : 'Dùng chung'}</p>
                      </div>
                    </div>

                    {/* Actions Menu */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setCatForm({ id: cat.category_id, name: cat.name, class_name: cat.class_name || '', parent_id: cat.parent_id || '' }); setShowCatModal(true); }}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/20 transition-colors"
                        title="Sửa"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.category_id); }}
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/20 transition-colors"
                        title="Xóa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FILES SECTION */}
          <div>
            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wider">
              {isGlobalSearch ? 'Tài liệu tìm thấy' : 'Tài liệu'}
            </h3>
            
            {filteredDocs.length === 0 && !loading && (
              <div className="text-center py-16 bg-white/50 dark:bg-slate-900/30 border border-slate-200 border-dashed dark:border-slate-800 rounded-2xl">
                <FileText className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                <p className="font-bold text-slate-700 dark:text-slate-300">Không có tài liệu nào</p>
                <p className="text-xs mt-1 text-slate-500">Hãy bấm "+ Tài Liệu" để thêm mới.</p>
              </div>
            )}

            {filteredDocs.length > 0 && viewMode === 'grid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredDocs.map(doc => (
                  <div key={doc.document_id} className="group bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col overflow-hidden relative">
                    <div className="p-6 bg-slate-50/50 dark:bg-slate-800/20 flex items-center justify-center border-b border-slate-100 dark:border-slate-800 h-32">
                       <div className="w-12 h-12 transform group-hover:scale-110 transition-transform duration-300">
                         {getDocumentIcon(doc.drive_link)}
                       </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <h4 className="font-bold text-slate-900 dark:text-white line-clamp-2 mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" title={doc.title}>{doc.title}</h4>
                      {doc.description && <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mb-2">{doc.description}</p>}
                      <div className="mt-auto pt-2 flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${doc.class_name ? 'bg-cyan-500/10 text-cyan-600' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                          {doc.class_name ? `Lớp ${doc.class_name}` : 'Chung'}
                        </span>
                      </div>
                    </div>

                    {/* Actions Overlay for Grid */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex bg-white/90 dark:bg-slate-800/90 backdrop-blur shadow-sm rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                      <a href={doc.drive_link} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors" title="Mở liên kết">
                        <LinkIcon className="w-3.5 h-3.5" />
                      </a>
                      <button onClick={() => {
                        setDocForm({
                          id: doc.document_id, title: doc.title || '', description: doc.description || '', drive_link: doc.drive_link || '', category_id: doc.category_id || '', class_name: doc.class_name || ''
                        }); setShowDocModal(true);
                      }} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/20 transition-colors" title="Sửa">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDeleteDocument(doc.document_id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/20 transition-colors" title="Xóa">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filteredDocs.length > 0 && viewMode === 'list' && (
              <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 uppercase text-xs font-bold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="px-6 py-4">Tên Tài Liệu</th>
                        <th className="px-6 py-4 hidden md:table-cell">Mô tả</th>
                        {isGlobalSearch && <th className="px-6 py-4">Thư mục</th>}
                        <th className="px-6 py-4">Lớp/Khối</th>
                        <th className="px-6 py-4 text-center">Liên kết</th>
                        <th className="px-6 py-4 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {filteredDocs.map((doc) => (
                        <tr key={doc.document_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-900 dark:text-white flex items-center gap-3">
                            <div className="w-5 h-5 shrink-0">
                              {getDocumentIcon(doc.drive_link)}
                            </div>
                            <span className="truncate max-w-[200px] sm:max-w-[300px]">{doc.title}</span>
                          </td>
                          <td className="px-6 py-4 text-slate-500 truncate max-w-[200px] hidden md:table-cell">{doc.description || '-'}</td>
                          
                          {isGlobalSearch && (
                            <td className="px-6 py-4 text-slate-500 font-medium">
                              {doc.document_categories?.name ? (
                                <span className="flex items-center gap-1 text-xs bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2 py-1 rounded-md">
                                  <Folder className="w-3 h-3" /> {doc.document_categories.name}
                                </span>
                              ) : (
                                <span className="text-xs text-slate-400">Gốc</span>
                              )}
                            </td>
                          )}

                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${doc.class_name ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
                              {doc.class_name || 'Chung'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <a href={doc.drive_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center p-2 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" title="Mở liên kết">
                              <LinkIcon className="w-4 h-4" />
                            </a>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => {
                              setDocForm({
                                id: doc.document_id, title: doc.title || '', description: doc.description || '', drive_link: doc.drive_link || '', category_id: doc.category_id || '', class_name: doc.class_name || ''
                              }); setShowDocModal(true);
                            }} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/20 rounded-lg transition-colors mr-1" title="Sửa tài liệu">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteDocument(doc.document_id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/20 rounded-lg transition-colors" title="Xóa tài liệu">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL THÊM/SỬA TÀI LIỆU */}
      {showDocModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1f2833] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 animate-slide-up">
            <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-500" />
                {docForm.id ? 'Sửa Tài Liệu' : 'Thêm Tài Liệu Mới'}
              </h3>
              <button onClick={() => setShowDocModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">✕</button>
            </div>
            <form onSubmit={handleSaveDocument} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tên tài liệu *</label>
                <input required value={docForm.title} onChange={e => setDocForm({...docForm, title: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all" placeholder="VD: Sách bài tập Toán 10" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Link Google Drive / Youtube *</label>
                <input required type="url" value={docForm.drive_link} onChange={e => setDocForm({...docForm, drive_link: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all" placeholder="https://..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Lưu vào Thư mục</label>
                  <select value={docForm.category_id} onChange={e => setDocForm({...docForm, category_id: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all cursor-pointer">
                    <option value="">-- Gốc ngoài cùng --</option>
                    {categories.map(cat => (
                      <option key={cat.category_id} value={cat.category_id}>{cat.name} {cat.class_name ? `(Lớp ${cat.class_name})` : ''}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Lớp/Khối (Tùy chọn)</label>
                  <input type="text" value={docForm.class_name} onChange={e => setDocForm({...docForm, class_name: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all" placeholder="VD: 6, 7, 10..." />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Mô tả thêm</label>
                <textarea value={docForm.description} onChange={e => setDocForm({...docForm, description: e.target.value})} rows="2" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all" placeholder="Mô tả ngắn về tài liệu..."></textarea>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowDocModal(false)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors">Hủy</button>
                <button type="submit" className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-purple-500/20">
                  {docForm.id ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL THÊM/SỬA THƯ MỤC */}
      {showCatModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1f2833] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 animate-slide-up">
            <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Folder className="w-5 h-5 text-purple-500" />
                {catForm.id ? 'Sửa Thư Mục' : 'Thư Mục Mới'}
              </h3>
              <button onClick={() => setShowCatModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">✕</button>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleSaveCategory} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tên thư mục *</label>
                  <input required value={catForm.name} onChange={e => setCatForm({...catForm, name: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all" placeholder="VD: Sách Giáo Khoa" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nằm trong (Thư mục cha)</label>
                  <select value={catForm.parent_id || ''} onChange={e => setCatForm({...catForm, parent_id: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all cursor-pointer">
                    <option value="">-- Gốc ngoài cùng --</option>
                    {categories.filter(c => c.category_id !== catForm.id).map(cat => (
                      <option key={cat.category_id} value={cat.category_id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Dành cho lớp (Tùy chọn)</label>
                  <input value={catForm.class_name} onChange={e => setCatForm({...catForm, class_name: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all" placeholder="VD: 6, 12 (Để trống = Chung)" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowCatModal(false)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors">Hủy</button>
                  <button type="submit" className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-purple-500/20">
                    {catForm.id ? 'Cập nhật' : 'Tạo mới'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
