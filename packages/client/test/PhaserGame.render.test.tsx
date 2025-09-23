import React from 'react';
import { render, screen } from '@testing-library/react';
import PhaserGame from '@/app/components/PhaserGame';
import '@/test/mocks/phaser'; // Import to activate Phaser mock

describe('PhaserGame Rendering', () => {
  it('renders PhaserGame component', () => {
    const mockRoom = { state: { roundState: 'playing' } };
    render(<PhaserGame room={mockRoom} sessionId="test-session" />);
    expect(screen.getByTestId('phaser-game')).toBeInTheDocument();
  });
});