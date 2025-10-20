// src/api/folder.js
import axios from 'axios';

// API 기본 설정
const api = axios.create({
  baseURL: 'http://ec2-52-78-83-137.ap-northeast-2.compute.amazonaws.com:8080',
  timeout: 10000,
  withCredentials: true, 
});

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
    await api.delete(`/api/workspace/folders/${folderId}`);
  } catch (error) {
    console.error('폴더 삭제 실패:', error);
    throw error;
  }
};

// 폴더 이름 수정 API
export const updateFolderName = async (folderId, name) => {
  try {
    const response = await api.put(`/api/workspace/folders/${folderId}`, { name });
    return response.data;
  } catch (error) {
    console.error('폴더 이름 수정 실패:', error);
    throw error;
  }
};