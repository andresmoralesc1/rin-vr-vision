import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { Slider } from './Slider';

describe('Slider', () => {
  it('renders label and current value', () => {
    const { getByLabelText } = render(<Slider label="X" value={0.5} min={-1} max={1} step={0.01} onChange={() => {}} />);
    const input = getByLabelText('X') as HTMLInputElement;
    expect(input.value).toBe('0.5');
  });

  it('fires onChange with numeric value', () => {
    const onChange = vi.fn();
    const { getByLabelText } = render(<Slider label="X" value={0} min={-1} max={1} step={0.1} onChange={onChange} />);
    fireEvent.change(getByLabelText('X'), { target: { value: '0.5' } });
    expect(onChange).toHaveBeenCalledWith(0.5);
  });

  it('displays integer-step values without decimals (e.g. degrees)', () => {
    const { getByText, queryByText } = render(
      <Slider label="Yaw" value={-90} min={-180} max={180} step={1} onChange={() => {}} />,
    );
    expect(getByText('-90')).toBeInTheDocument();
    expect(queryByText('-90.00')).not.toBeInTheDocument();
  });

  it('displays fractional-step values with 2 decimals', () => {
    const { getByText } = render(
      <Slider label="X" value={0.5} min={-1} max={1} step={0.01} onChange={() => {}} />,
    );
    expect(getByText('0.50')).toBeInTheDocument();
  });
});
