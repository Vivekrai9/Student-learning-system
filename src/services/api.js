import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const mockUsers = [
  { id: 1, username: 'kid1', email: 'kid1@example.com', name: 'Alex' },
  { id: 2, username: 'kid2', email: 'kid2@example.com', name: 'Emma' }
];

const mockProgress = {
  alphabet: {},
  numbers: {},
  hindi: {}
};

const initializeMockProgress = () => {
  // Initialize alphabet progress to 0%
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  letters.forEach(letter => {
    mockProgress.alphabet[letter] = {
      attempts: 0,
      correct: 0,
      accuracy: 0,
      lastAttempt: null
    };
  });

  // Initialize numbers progress to 0%
  const numbers = '0123456789'.split('');
  numbers.forEach(number => {
    mockProgress.numbers[number] = {
      attempts: 0,
      correct: 0,
      accuracy: 0,
      lastAttempt: null
    };
  });

  // Initialize Hindi letters progress to 0%
  const hindiLetters = 'अआइईउऊऋएऐओऔकखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसह'.split('');
  hindiLetters.forEach(letter => {
    mockProgress.hindi[letter] = {
      attempts: 0,
      correct: 0,
      accuracy: 0,
      lastAttempt: null
    };
  });
};

initializeMockProgress();

const authAPI = {
  login: async (credentials) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const user = mockUsers.find(u => u.username === credentials.username);
    
    if (user && credentials.password === 'password') {
      const token = 'mock-jwt-token-' + Date.now();
      return {
        data: { user, token }
      };
    }
    
    throw new Error('Invalid credentials');
  },

  signup: async (userData) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const existingUser = mockUsers.find(u => u.username === userData.username);
    if (existingUser) {
      throw new Error('Username already exists');
    }
    
    const newUser = {
      id: mockUsers.length + 1,
      username: userData.username,
      email: userData.email,
      name: userData.name || userData.username
    };
    
    mockUsers.push(newUser);
    const token = 'mock-jwt-token-' + Date.now();
    
    return {
      data: { user: newUser, token }
    };
  },

  getUser: async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return {
      data: mockUsers[0]
    };
  }
};

const progressAPI = {
  getProgress: async (type = 'alphabet') => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Return progress for specific type
    const progressData = mockProgress[type] || {};
    
    // Calculate overall progress for this type
    const values = Object.values(progressData);
    let totalCorrect = 0;
    let totalAttempts = 0;
    
    values.forEach(item => {
      totalCorrect += item.correct || 0;
      totalAttempts += item.attempts || 0;
    });
    
    const overallProgress = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
    
    return {
      data: {
        progress: progressData,
        overallProgress,
        type
      }
    };
  },

  getAllProgress: async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const allProgress = {
      alphabet: mockProgress.alphabet,
      numbers: mockProgress.numbers,
      hindi: mockProgress.hindi
    };
    
    // Calculate overall progress across all types
    let totalCorrect = 0;
    let totalAttempts = 0;
    
    Object.values(allProgress).forEach(typeProgress => {
      Object.values(typeProgress).forEach(item => {
        totalCorrect += item.correct || 0;
        totalAttempts += item.attempts || 0;
      });
    });
    
    const overallProgress = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
    
    return {
      data: {
        progress: allProgress,
        overallProgress
      }
    };
  },

  updateProgress: async (item, isCorrect, type = 'alphabet') => {
    await new Promise(resolve => setTimeout(resolve, 150));
    
    if (!mockProgress[type]) {
      mockProgress[type] = {};
    }
    
    if (!mockProgress[type][item]) {
      mockProgress[type][item] = {
        attempts: 0,
        correct: 0,
        accuracy: 0,
        lastAttempt: null
      };
    }
    
    mockProgress[type][item].attempts += 1;
    if (isCorrect) {
      mockProgress[type][item].correct += 1;
    }
    
    mockProgress[type][item].accuracy = Math.round((mockProgress[type][item].correct / mockProgress[type][item].attempts) * 100);
    mockProgress[type][item].lastAttempt = new Date().toISOString();
    
    // Calculate overall progress for this type
    const typeProgress = Object.values(mockProgress[type]);
    let totalCorrect = 0;
    let totalAttempts = 0;
    
    typeProgress.forEach(p => {
      totalCorrect += p.correct || 0;
      totalAttempts += p.attempts || 0;
    });
    
    const overallProgress = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
    
    return {
      data: {
        itemProgress: mockProgress[type][item],
        overallProgress,
        type
      }
    };
  }
};

const evaluationAPI = {
  evaluateDrawing: async (item, imageData, type = 'alphabet') => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const isCorrect = Math.random() > 0.3;
    const confidence = Math.floor(Math.random() * 30) + 70;
    const itemType = type === 'alphabet' ? 'letter' : type === 'numbers' ? 'number' : 'character';
    
    return {
      data: {
        isCorrect,
        confidence,
        feedback: isCorrect 
          ? `Great job! That looks like the ${itemType} ${item}!` 
          : `Not quite! Try drawing the ${itemType} ${item} again.`,
        item,
        type
      }
    };
  }
};

export { authAPI, progressAPI, evaluationAPI };
export default api;
