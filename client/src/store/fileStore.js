import { create } from 'zustand';
import axios from 'axios';

const useFileStore = create((set, get) => ({
  files: [],
  loading: false,
  error: null,
  uploadProgress: 0,

  // Fetch all files
  fetchFiles: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get('/files');
      set({ files: response.data, loading: false });
    } catch (error) {
      set({ 
        error: error.response?.data?.error || 'Failed to fetch files', 
        loading: false 
      });
    }
  },

  // Upload a file
  uploadFile: async (file) => {
    set({ loading: true, error: null, uploadProgress: 0 });
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          set({ uploadProgress: progress });
        },
      });

      // Add the new file to the list
      const newFile = response.data.file;
      set(state => ({
        files: [newFile, ...state.files],
        loading: false,
        uploadProgress: 0
      }));

      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.error || 'Failed to upload file', 
        loading: false,
        uploadProgress: 0
      });
      throw error;
    }
  },

  // Download a file
  downloadFile: async (fileId, filename) => {
    try {
      const response = await axios.get(`/files/${fileId}`, {
        responseType: 'blob',
      });

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      set({ 
        error: error.response?.data?.error || 'Failed to download file'
      });
      throw error;
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Format file size
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Get file icon based on type
  getFileIcon: (mimetype) => {
    if (mimetype.startsWith('image/')) {
      return '🖼️';
    } else if (mimetype === 'text/plain') {
      return '📄';
    } else if (mimetype === 'application/json') {
      return '📋';
    }
    return '📁';
  }
}));

export default useFileStore; 