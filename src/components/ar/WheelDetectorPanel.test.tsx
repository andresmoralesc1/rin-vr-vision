import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import type { RefObject } from 'react';
import { CalibrationProvider } from '@/lib/calibration/context';
import WheelDetectorPanel from './WheelDetectorPanel';

vi.mock('@/lib/detect/useWheelDetector', () => ({
  useWheelDetector: vi.fn(),
}));

import { useWheelDetector } from '@/lib/detect/useWheelDetector';
import type { DetectionStatus } from '@/lib/detect/useWheelDetector';

const useWheelDetectorMock = vi.mocked(useWheelDetector);

function makeVideoRef(): RefObject<HTMLVideoElement | null> {
  return { current: null };
}

function mockDetector(status: DetectionStatus) {
  useWheelDetectorMock.mockReturnValue({
    anchor: null,
    status,
    start: vi.fn(),
    stop: vi.fn(),
  });
}

function renderPanel(ui: React.ReactElement) {
  return render(<CalibrationProvider>{ui}</CalibrationProvider>);
}

describe('WheelDetectorPanel', () => {
  it('renders a "Buscando rueda…" banner while loading', () => {
    mockDetector('loading');
    const { getByRole, getByLabelText } = renderPanel(
      <WheelDetectorPanel videoRef={makeVideoRef()} />,
    );
    expect(getByRole('status')).toHaveTextContent('Buscando rueda');
    expect(getByLabelText('Cancelar detección')).toBeInTheDocument();
  });

  it('renders the banner while detecting (after load)', () => {
    mockDetector('detecting');
    const { getByRole } = renderPanel(
      <WheelDetectorPanel videoRef={makeVideoRef()} />,
    );
    expect(getByRole('status')).toHaveTextContent('Buscando rueda');
  });

  it('does not render the banner once detection completes', () => {
    mockDetector('detected');
    const { queryByRole } = renderPanel(
      <WheelDetectorPanel videoRef={makeVideoRef()} />,
    );
    expect(queryByRole('status')).not.toBeInTheDocument();
  });

  it('does not render the banner when idle', () => {
    mockDetector('idle');
    const { queryByRole } = renderPanel(
      <WheelDetectorPanel videoRef={makeVideoRef()} />,
    );
    expect(queryByRole('status')).not.toBeInTheDocument();
  });

  it('fires onDone when the banner cancel button is clicked', () => {
    mockDetector('detecting');
    const onDone = vi.fn();
    const { getByLabelText } = renderPanel(
      <WheelDetectorPanel videoRef={makeVideoRef()} onDone={onDone} />,
    );
    getByLabelText('Cancelar detección').click();
    expect(onDone).toHaveBeenCalledTimes(1);
  });
});