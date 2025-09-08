import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HostGameButton } from '@/components/HostGameButton';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('colyseus', () => ({
  Client: jest.fn(),
}));

describe('HostGameButton', () => {
  const mockPush = jest.fn();
  const mockCreate = jest.fn();
  const mockClientInstance = { create: mockCreate };

  beforeEach(() => {
    jest.clearAllMocks();
    require('colyseus').Client.mockReturnValue(mockClientInstance);
    require('next/navigation').useRouter.mockReturnValue({ push: mockPush });
  });

  it('should create room and navigate to lobby on success', async () => {
    mockCreate.mockResolvedValue({ id: 'mockRoomId' });
    render(<HostGameButton />);

    const button = screen.getByRole('button', { name: /host game/i });
    await userEvent.click(button);

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith('maze_race');
      expect(mockPush).toHaveBeenCalledWith('/lobby/mockRoomId');
    });
  });

  it('should log error on room creation failure', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockCreate.mockRejectedValue(new Error('Connection failed'));

    render(<HostGameButton />);

    const button = screen.getByRole('button', { name: /host game/i });
    await userEvent.click(button);

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith('maze_race');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to create room', expect.any(Error));
    });

    consoleErrorSpy.mockRestore();
  });
});
