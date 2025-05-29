import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../database';

// Mock mongoose
jest.mock('mongoose');

const mockMongoose = mongoose as jest.Mocked<typeof mongoose>;

describe('Database Connection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the connection state
    (connectDB as any).connection = {};
  });

  it('connects to MongoDB successfully', async () => {
    process.env.MONGODB_URI = 'mongodb://localhost:27017/test';

    mockMongoose.connect.mockResolvedValue({
      connections: [{ readyState: 1 }],
    } as any);

    await connectDB();

    expect(mockMongoose.connect).toHaveBeenCalledWith(
      'mongodb://localhost:27017/test',
      expect.objectContaining({
        bufferCommands: false,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      })
    );
  });

  it('throws error when MONGODB_URI is not defined', async () => {
    delete process.env.MONGODB_URI;

    await expect(connectDB()).rejects.toThrow('MONGODB_URI environment variable is not defined');
  });

  it('reuses existing connection', async () => {
    process.env.MONGODB_URI = 'mongodb://localhost:27017/test';

    // Mock existing connection
    mockMongoose.connections = [{ readyState: 1 }] as any;

    await connectDB();

    expect(mockMongoose.connect).not.toHaveBeenCalled();
  });

  it('handles connection errors', async () => {
    process.env.MONGODB_URI = 'mongodb://localhost:27017/test';

    mockMongoose.connect.mockRejectedValue(new Error('Connection failed'));

    await expect(connectDB()).rejects.toThrow('Connection failed');
  });
});
