import { Request, Response } from 'express';
import AuthController from '../../controllers/api/authController';
import AuthService from '../../services/authService';
import redisClient from '../../config/redis';
import * as AuthServiceModule from '../../services/authService';

jest.mock('../../services/authService');

describe('AuthController', () => {
  let authController: AuthController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockAuthService: jest.Mocked<AuthService>;

  beforeEach(() => {
    authController = new AuthController();
    mockAuthService = new AuthService() as jest.Mocked<AuthService>;
    
    mockRequest = {
      body: {}
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
      redirect: jest.fn().mockReturnThis()
    };

    jest.spyOn(AuthServiceModule, 'default').mockImplementation(() => mockAuthService);
  });

  describe('loginUser', () => {
    it('should return 400 for missing credentials', async () => {
      mockRequest.body = { email: 'test@example.com' }; // missing password

      await authController.loginUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.send).toHaveBeenCalledWith('Please enter all login credentials');
    });

    it('should redirect to feed on successful login', async () => {
      const mockUser = {
        _id: '123',
        name: 'John',
        email: 'john@example.com',
        avatarURL: 'avatar.jpg',
        isAdmin: false,
        isEmailVerified: false,
        isEmailPublic: false
      };

      mockRequest.body = { email: 'john@example.com', password: 'password123' };
      mockAuthService.loginUser.mockResolvedValue(mockUser);

      await authController.loginUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.cookie).toHaveBeenCalledTimes(2); // access + refresh tokens
      expect(mockResponse.redirect).toHaveBeenCalledWith('/feed?page=1');
    });
  });
});

afterAll(async () => {
  await redisClient.quit();
});