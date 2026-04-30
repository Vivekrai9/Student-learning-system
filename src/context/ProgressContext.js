import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { progressAPI } from '../services/api';

const ProgressContext = createContext();

const initialState = {
  progress: {
    alphabet: {},
    numbers: {},
    hindi: {}
  },
  currentType: 'alphabet',
  overallProgress: 0,
  loading: false,
  error: null
};

const progressReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'FETCH_PROGRESS_SUCCESS':
      return {
        ...state,
        progress: action.payload.type 
          ? { ...state.progress, [action.payload.type]: action.payload.progress }
          : action.payload.progress,
        overallProgress: action.payload.overallProgress,
        loading: false,
        error: null
      };
    case 'SET_CURRENT_TYPE':
      return {
        ...state,
        currentType: action.payload
      };
    case 'UPDATE_ITEM_PROGRESS':
      return {
        ...state,
        progress: {
          ...state.progress,
          [action.payload.type]: {
            ...state.progress[action.payload.type],
            [action.payload.item]: action.payload.data
          }
        },
        overallProgress: action.payload.overallProgress
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

export const ProgressProvider = ({ children }) => {
  const [state, dispatch] = useReducer(progressReducer, initialState);

  const fetchProgress = useCallback(async (type = 'alphabet') => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await progressAPI.getProgress(type);
      dispatch({
        type: 'FETCH_PROGRESS_SUCCESS',
        payload: response.data
      });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.response?.data?.message || 'Failed to fetch progress'
      });
    }
  }, []);

  const fetchAllProgress = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await progressAPI.getAllProgress();
      dispatch({
        type: 'FETCH_PROGRESS_SUCCESS',
        payload: response.data
      });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.response?.data?.message || 'Failed to fetch progress'
      });
    }
  }, []);

  const updateItemProgress = useCallback(async (item, isCorrect, type = 'alphabet') => {
    try {
      const response = await progressAPI.updateProgress(item, isCorrect, type);
      dispatch({
        type: 'UPDATE_ITEM_PROGRESS',
        payload: {
          item,
          type,
          data: response.data.itemProgress,
          overallProgress: response.data.overallProgress
        }
      });
      return { success: true };
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.response?.data?.message || 'Failed to update progress'
      });
      return { success: false };
    }
  }, []);

  const setCurrentType = useCallback((type) => {
    dispatch({ type: 'SET_CURRENT_TYPE', payload: type });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  return (
    <ProgressContext.Provider
      value={{
        ...state,
        fetchProgress,
        fetchAllProgress,
        updateItemProgress,
        setCurrentType,
        clearError
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};
