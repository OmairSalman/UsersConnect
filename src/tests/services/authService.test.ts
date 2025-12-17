import AuthService from '../../services/authService';
import { User } from '../../entities/userEntity';
import bcrypt from 'bcrypt';

// Mock dependencies
jest.mock('../../models/userEntity');
jest.mock('bcrypt');

describe('AuthService', () => {
  let authService: AuthService;
  const mockUser = {
    _id: '123',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'hashedpassword',
    avatarURL: 'avatar.jpg',
    isAdmin: false
  };

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();
  });

  describe('loginUser', () => {
    it('should return user data for valid credentials', async () => {
      // Arrange
      (User.findOneBy as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await authService.loginUser({
        email: 'john@example.com',
        password: 'password123'
      });

      // Assert
      expect(result).toEqual({
        _id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        avatarURL: 'avatar.jpg',
        isAdmin: false
      });
      expect(User.findOneBy).toHaveBeenCalledWith({ email: 'john@example.com' });
    });

    it('should return "DNE" for non-existent user', async () => {
      (User.findOneBy as jest.Mock).mockResolvedValue(null);

      const result = await authService.loginUser({
        email: 'nonexistent@example.com',
        password: 'password123'
      });

      expect(result).toBe('DNE');
    });

    it('should return "ICR" for invalid password', async () => {
      (User.findOneBy as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await authService.loginUser({
        email: 'john@example.com',
        password: 'wrongpassword'
      });

      expect(result).toBe('ICR');
    });
  });
});