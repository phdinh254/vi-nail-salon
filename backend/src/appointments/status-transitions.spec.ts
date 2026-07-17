import { isValidStatusTransition } from './status-transitions';

describe('isValidStatusTransition', () => {
  it('allows the normal forward-progressing lifecycle', () => {
    expect(isValidStatusTransition('PENDING_CONFIRMATION', 'CONFIRMED')).toBe(true);
    expect(isValidStatusTransition('CONFIRMED', 'CHECKED_IN')).toBe(true);
    expect(isValidStatusTransition('CHECKED_IN', 'IN_SERVICE')).toBe(true);
    expect(isValidStatusTransition('IN_SERVICE', 'COMPLETED')).toBe(true);
  });

  it('allows cancelling from any cancellable state', () => {
    expect(isValidStatusTransition('PENDING_CONFIRMATION', 'CANCELLED')).toBe(true);
    expect(isValidStatusTransition('CONFIRMED', 'CANCELLED')).toBe(true);
    expect(isValidStatusTransition('CHECKED_IN', 'CANCELLED')).toBe(true);
  });

  it('allows marking a confirmed appointment as a no-show', () => {
    expect(isValidStatusTransition('CONFIRMED', 'NO_SHOW')).toBe(true);
  });

  it('rejects skipping a stage (e.g. PENDING_CONFIRMATION -> IN_SERVICE)', () => {
    expect(isValidStatusTransition('PENDING_CONFIRMATION', 'IN_SERVICE')).toBe(false);
    expect(isValidStatusTransition('PENDING_CONFIRMATION', 'COMPLETED')).toBe(false);
  });

  it('rejects moving backwards in the lifecycle', () => {
    expect(isValidStatusTransition('CONFIRMED', 'PENDING_CONFIRMATION')).toBe(false);
    expect(isValidStatusTransition('COMPLETED', 'IN_SERVICE')).toBe(false);
  });

  it('rejects any transition out of a terminal state', () => {
    expect(isValidStatusTransition('COMPLETED', 'CANCELLED')).toBe(false);
    expect(isValidStatusTransition('CANCELLED', 'CONFIRMED')).toBe(false);
    expect(isValidStatusTransition('NO_SHOW', 'CONFIRMED')).toBe(false);
  });

  it('treats a same-state "transition" as a no-op that is always allowed', () => {
    expect(isValidStatusTransition('CONFIRMED', 'CONFIRMED')).toBe(true);
    expect(isValidStatusTransition('COMPLETED', 'COMPLETED')).toBe(true);
  });
});
