import React, { useEffect, useState } from 'react';
import useFileStore from './store/fileStore';

function FileUpload() {
  const { uploadFile, loading, uploadProgress, error, clearError } = useFileStore();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await uploadFile(file);
    } catch {}
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => clearError(), 3000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  return (
    <div className="mb-4">
      <label className="block mb-2 text-sm font-medium text-gray-700">Upload a file (.txt, .jpg, .png, .json):</label>
      <input
        type="file"
        accept=".txt,.jpg,.jpeg,.png,.json"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
        disabled={loading}
      />
      {uploadProgress > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
        </div>
      )}
      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
    </div>
  );
}

function FilePreview({ file, onClose }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setContent(null);
    fetch(`/files/${file.id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to fetch file');
        if (file.mimetype.startsWith('image/')) {
          const blob = await res.blob();
          setContent(URL.createObjectURL(blob));
        } else {
          const text = await res.text();
          setContent(text);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError('Could not preview file');
        setLoading(false);
      });
    // Cleanup for image blob
    return () => {
      if (file.mimetype.startsWith('image/') && content) {
        URL.revokeObjectURL(content);
      }
    };
    // eslint-disable-next-line
  }, [file]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">✖</button>
        <h3 className="text-lg font-semibold mb-4">Preview: {file.originalName}</h3>
        {loading && <div>Loading preview...</div>}
        {error && <div className="text-red-500">{error}</div>}
        {!loading && !error && (
          <div className="max-h-96 overflow-auto">
            {file.mimetype.startsWith('image/') ? (
              <img src={content} alt={file.originalName} className="max-w-full max-h-80 mx-auto" />
            ) : (
              <pre className="bg-gray-100 p-2 rounded text-sm whitespace-pre-wrap break-words">{content}</pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function FileList() {
  const { files, fetchFiles, downloadFile, loading, formatFileSize, getFileIcon, error, clearError } = useFileStore();
  const [previewFile, setPreviewFile] = useState(null);

  useEffect(() => {
    fetchFiles();
    // eslint-disable-next-line
  }, []);

  const handleDownload = (file) => {
    downloadFile(file.id, file.originalName);
  };

  const handlePreview = (file) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'text/plain' || file.mimetype === 'application/json') {
      setPreviewFile(file);
    } else {
      handleDownload(file);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Uploaded Files</h2>
      {loading && <div>Loading files...</div>}
      {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
      <ul className="divide-y divide-gray-200">
        {files.length === 0 && !loading && <li className="text-gray-500">No files uploaded yet.</li>}
        {files.map((file) => (
          <li key={file.id} className="py-2 flex items-center justify-between">
            <div className="flex items-center">
              <span className="mr-2 text-xl">{getFileIcon(file.mimetype)}</span>
              <span className="font-medium mr-2 cursor-pointer hover:underline" onClick={() => handlePreview(file)}>{file.originalName}</span>
              <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
            </div>
            <button
              onClick={() => handleDownload(file)}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            >
              Download
            </button>
          </li>
        ))}
      </ul>
      {previewFile && <FilePreview file={previewFile} onClose={() => setPreviewFile(null)} />}
    </div>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8 px-2">
      <div className="w-full max-w-xl bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Dropbox Clone</h1>
        <FileUpload />
        <FileList />
      </div>
    </div>
  );
}

export default App; 