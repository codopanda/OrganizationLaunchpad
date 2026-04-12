import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cleanup, render, fireEvent, screen } from '@testing-library/svelte';
import FeedbackWidget from './FeedbackWidget.svelte';
import { isSupabaseConfigured } from '@/lib/supabase';

vi.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: false,
  supabase: null,
}));

describe('FeedbackWidget', () => {
  beforeEach(() => {
    cleanup();
  });

  it('renders feedback form with textarea and submit button', () => {
    render(FeedbackWidget);
    expect(screen.getByRole('textbox')).toBeTruthy();
    expect(screen.getByRole('button', { name: /submit feedback/i })).toBeTruthy();
  });

  it('displays character count', () => {
    render(FeedbackWidget);
    expect(screen.getByText('0/500')).toBeTruthy();
  });

  it('shows demo mode notice when Supabase is not configured', () => {
    render(FeedbackWidget);
    expect(screen.getByText(/demo mode/i)).toBeTruthy();
  });

  it('disables submit button when message is empty', () => {
    render(FeedbackWidget);
    const button = screen.getByRole('button', { name: /submit feedback/i }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('disables submit button when message is too short', async () => {
    render(FeedbackWidget);
    const textarea = screen.getByRole('textbox');
    await fireEvent.input(textarea, { target: { value: 'Short' } });
    const button = screen.getByRole('button', { name: /submit feedback/i }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('enables submit button when message meets minimum length', async () => {
    render(FeedbackWidget);
    const textarea = screen.getByRole('textbox');
    await fireEvent.input(textarea, { target: { value: 'This is valid feedback with enough characters.' } });
    const button = screen.getByRole('button', { name: /submit feedback/i }) as HTMLButtonElement;
    expect(button.disabled).toBe(false);
  });

  it('disables submit button when message exceeds character limit', async () => {
    render(FeedbackWidget);
    const textarea = screen.getByRole('textbox');
    const longMessage = 'a'.repeat(501);
    await fireEvent.input(textarea, { target: { value: longMessage } });
    const button = screen.getByRole('button', { name: /submit feedback/i }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('updates character count as user types', async () => {
    render(FeedbackWidget);
    const textarea = screen.getByRole('textbox');
    await fireEvent.input(textarea, { target: { value: 'Hello' } });
    expect(screen.getByText('5/500')).toBeTruthy();
  });

  it('shows over limit styling when exceeding character limit', async () => {
    render(FeedbackWidget);
    const textarea = screen.getByRole('textbox');
    await fireEvent.input(textarea, { target: { value: 'a'.repeat(501) } });
    const charCount = screen.getByText('501/500');
    expect(charCount.classList.contains('over-limit')).toBe(true);
  });

  it('submits successfully in demo mode', async () => {
    vi.useFakeTimers();
    render(FeedbackWidget);
    const textarea = screen.getByRole('textbox');
    await fireEvent.input(textarea, { target: { value: 'Great product, love the design!' } });
    const button = screen.getByRole('button', { name: /submit feedback/i });
    await fireEvent.click(button);
    vi.advanceTimersByTime(1000);
    vi.useRealTimers();
    expect(screen.getByText(/thank you for your feedback/i)).toBeTruthy();
  });

  it('allows sending another feedback after success', async () => {
    vi.useFakeTimers();
    render(FeedbackWidget);
    const textarea = screen.getByRole('textbox');
    await fireEvent.input(textarea, { target: { value: 'First feedback message here.' } });
    const submitButton = screen.getByRole('button', { name: /submit feedback/i });
    await fireEvent.click(submitButton);
    vi.advanceTimersByTime(1000);
    const sendAnotherButton = screen.getByRole('button', { name: /send another/i });
    await fireEvent.click(sendAnotherButton);
    vi.useRealTimers();
    expect(screen.getByRole('textbox')).toBeTruthy();
    expect(screen.queryByText(/thank you for your feedback/i)).toBeNull();
  });
});
