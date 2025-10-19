// src/api/folder.js
import api from './index';

// 새 폴더 생성 API
export const createFolder = async (folderData) => {
  try {
    const response = await api.post('/api/workspace/folders', folderData);
    return response.data;
  } catch (error) {
    console.error('폴더 생성 실패:', error);
    throw error;
  }
};

// 폴더 삭제 API
export const deleteFolder = async (folderId) => {
  try {
    await api.delete(`/workspace/folders/${folderId}`);
  } catch (error) {
    console.error('폴더 삭제 실패:', error);
    throw error;
  }
};

// 폴더 이름 수정 API
export const updateFolderName = async (folderId, name) => {
  try {
    const response = await api.put(`/workspace/folders/${folderId}`, { name });
    return response.data;
  } catch (error) {
    console.error('폴더 이름 수정 실패:', error);
    throw error;
  }
};