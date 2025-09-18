import { MockScene } from '@/test/mocks/phaser';

describe('Angle Interpolation and Update Loop', () => {
  let mockScene: any;

  beforeEach(() => {
    mockScene = new MockScene({});
    mockScene.targetAngle = Math.PI;
    mockScene.currentAngle = 0;
    mockScene.rotationSpeed = 8;
    mockScene.updateVisibility = jest.fn();
  });

  it('interpolates currentAngle towards target in update', () => {
    mockScene.update(0, 500); // delta 500ms, step 4 rad/s

    expect(mockScene.currentAngle).toBeGreaterThan(0);
    expect(mockScene.currentAngle).toBeCloseTo(Math.PI, 10);
    expect(mockScene.updateVisibility).toHaveBeenCalled();
  });
});