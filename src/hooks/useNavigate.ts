import { useCallback } from 'react';

export const useNavigate = () => {
  const navigate = useCallback((page: string) => {
    // App.tsxのcurrentPageステートを更新するためのイベントを発行
    const event = new CustomEvent('navigate', { detail: { page } });
    window.dispatchEvent(event);
  }, []);

  return navigate;
};