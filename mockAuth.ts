// Mock authentication for development without backend
const mockUsers = [
  {
    id: 1,
    email: 'user@demo.com',
    password: 'user123',
    role: 'User',
    token: 'mock-user-token'
  },
  {
    id: 2,
    email: 'vendor@demo.com', 
    password: 'vendor123',
    role: 'vendor',
    token: 'mock-vendor-token'
  },
  {
    id: 3,
    email: 'admin@demo.com',
    password: 'admin123',
    role: 'admin',
    token: 'mock-admin-token'
  }
];

export async function mockLogin(email: string, password: string) {
  const user = mockUsers.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return { 
      data: null, 
      error: 'Invalid email or password' 
    };
  }

  return {
    data: {
      token: user.token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    }
  };
}

export async function mockRegister(email: string, password: string, role: string) {
  // Check if user already exists
  const existingUser = mockUsers.find(u => u.email === email);
  if (existingUser) {
    return {
      data: null,
      error: 'User with this email already exists'
    };
  }

  // Create new user
  const newUser = {
    id: mockUsers.length + 1,
    email,
    password,
    role,
    token: `mock-${role}-token-${Date.now()}`
  };

  mockUsers.push(newUser);

  return {
    data: {
      token: newUser.token,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role
      }
    }
  };
}
