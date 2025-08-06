import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useOnlineStatus } from './useOnlineStatus';

describe('useOnlineStatus', () => {
  let mockNavigator: any;

  beforeEach(() => {
    // Mock navigator.onLine
    mockNavigator = {
      onLine: true,
    };
    Object.defineProperty(window, 'navigator', {
      value: mockNavigator,
      writable: true,
    });

    // Mock window events
    const originalAddEventListener = window.addEventListener;
    const originalRemoveEventListener = window.removeEventListener;
    const originalDispatchEvent = window.dispatchEvent;

    vi.spyOn(window, 'addEventListener');
    vi.spyOn(window, 'removeEventListener');
    vi.spyOn(window, 'dispatchEvent');
  });

  it('should initialize with navigator.onLine value', () => {
    mockNavigator.onLine = true;
    const { result } = renderHook(() => useOnlineStatus());
    
    expect(result.current.isOnline).toBe(true);
    expect(result.current.wasOffline).toBe(false);
  });

  it('should initialize as offline when navigator.onLine is false', () => {
    mockNavigator.onLine = false;
    const { result } = renderHook(() => useOnlineStatus());
    
    expect(result.current.isOnline).toBe(false);
    expect(result.current.wasOffline).toBe(false);
  });

  it('should update isOnline when online event is fired', () => {
    mockNavigator.onLine = false;
    const { result } = renderHook(() => useOnlineStatus());
    
    expect(result.current.isOnline).toBe(false);
    
    act(() => {
      // Simulate going offline first
      const offlineEvent = new Event('offline');
      window.dispatchEvent(offlineEvent);
    });
    
    expect(result.current.isOnline).toBe(false);
    expect(result.current.wasOffline).toBe(true);
    
    act(() => {
      // Simulate coming back online
      const onlineEvent = new Event('online');
      window.dispatchEvent(onlineEvent);
    });
    
    expect(result.current.isOnline).toBe(true);
    expect(result.current.wasOffline).toBe(false);
  });

  it('should update isOnline when offline event is fired', () => {
    mockNavigator.onLine = true;
    const { result } = renderHook(() => useOnlineStatus());
    
    expect(result.current.isOnline).toBe(true);
    
    act(() => {
      const offlineEvent = new Event('offline');
      window.dispatchEvent(offlineEvent);
    });
    
    expect(result.current.isOnline).toBe(false);
    expect(result.current.wasOffline).toBe(true);
  });

  it('should dispatch connection-restored event when coming back online', () => {
    mockNavigator.onLine = true;
    const { result } = renderHook(() => useOnlineStatus());
    
    // Go offline first
    act(() => {
      const offlineEvent = new Event('offline');
      window.dispatchEvent(offlineEvent);
    });
    
    expect(result.current.wasOffline).toBe(true);
    
    // Come back online
    act(() => {
      const onlineEvent = new Event('online');
      window.dispatchEvent(onlineEvent);
    });
    
    expect(window.dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'connection-restored',
      })
    );
  });
}); 