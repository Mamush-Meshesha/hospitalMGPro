import { Request, Response } from 'express';
import { globalSearch } from '../controller/patient.controller';
import { PatientDAL } from '../dal/patient.dal';

// Mock the PatientDAL
jest.mock('../dal/patient.dal');

describe('PatientController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {
      user: { userId: 1, username: 'admin', privileges: [] } as any,
      query: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('globalSearch', () => {
    it('should return 400 if query is missing or less than 3 characters', async () => {
      mockRequest.query = { q: 'ab' };
      
      await globalSearch(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: "Search query 'q' must be at least 3 characters long." });
    });

    it('should call PatientDAL.globalSearch and return results', async () => {
      mockRequest.query = { q: 'john' };
      const mockPatients = [{ uuid: '123', givenName: 'John', familyName: 'Doe' }];
      (PatientDAL.globalSearch as jest.Mock).mockResolvedValue(mockPatients);

      await globalSearch(mockRequest as Request, mockResponse as Response);

      expect(PatientDAL.globalSearch).toHaveBeenCalledWith('john');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ results: mockPatients });
    });

    it('should return 500 if an error occurs during search', async () => {
      mockRequest.query = { q: 'errorQuery' };
      (PatientDAL.globalSearch as jest.Mock).mockRejectedValue(new Error('Database error'));

      await globalSearch(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Internal Server Error during global search' });
    });
  });
});
