import { User, AgentLog } from '../types';

// Mock In-Memory Database
const USERS_TABLE: User[] = [
  {
    id: '1',
    name: 'Demo User',
    email: 'user@example.com',
    passwordHash: 'password123', // In real app, this is hashed
    role: 'user'
  }
];

export const logSQL = (
  query: string, 
  params: any[], 
  logCallback?: (log: AgentLog) => void
) => {
  const log: AgentLog = {
    id: Date.now().toString(),
    agentName: 'SQL Database',
    status: 'success',
    message: 'Executed SQL Query',
    details: `QUERY: ${query}\nPARAMS: ${JSON.stringify(params)}`,
    timestamp: Date.now()
  };
  
  console.log(`[SQL] ${query}`, params);
  if (logCallback) logCallback(log);
  return log;
};

export const registerUser = async (
  name: string, 
  email: string, 
  password: string,
  logCallback?: (log: AgentLog) => void
): Promise<User> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  logSQL('SELECT * FROM users WHERE email = ?', [email], logCallback);
  
  const existing = USERS_TABLE.find(u => u.email === email);
  if (existing) {
    if (logCallback) {
        logCallback({
            id: Date.now().toString(),
            agentName: 'Auth Service',
            status: 'failure',
            message: 'Registration failed: Email already exists',
            timestamp: Date.now()
        });
    }
    throw new Error("User already exists");
  }

  const newUser: User = {
    id: Math.random().toString(36).substr(2, 9),
    name,
    email,
    passwordHash: password, // Simulated hash
    role: 'user'
  };

  logSQL(
    'INSERT INTO users (id, name, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    [newUser.id, newUser.name, newUser.email, '********', 'user', new Date().toISOString()],
    logCallback
  );

  USERS_TABLE.push(newUser);
  
  if (logCallback) {
    logCallback({
        id: Date.now().toString(),
        agentName: 'Auth Service',
        status: 'success',
        message: 'User registered successfully',
        timestamp: Date.now()
    });
  }

  return newUser;
};

export const loginUser = async (
    email: string, 
    password: string,
    logCallback?: (log: AgentLog) => void
): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 600));

    logSQL(
        'SELECT id, name, email, role FROM users WHERE email = ? AND password_hash = ?', 
        [email, '********'], 
        logCallback
    );

    const user = USERS_TABLE.find(u => u.email === email && u.passwordHash === password);
    
    if (!user) {
        if (logCallback) {
            logCallback({
                id: Date.now().toString(),
                agentName: 'Auth Service',
                status: 'failure',
                message: 'Invalid credentials',
                timestamp: Date.now()
            });
        }
        throw new Error("Invalid credentials");
    }

    if (logCallback) {
        logCallback({
            id: Date.now().toString(),
            agentName: 'Auth Service',
            status: 'success',
            message: 'User authenticated successfully',
            timestamp: Date.now()
        });
    }

    return user;
};
