declare module 'react-plaid-link' {
  import { ReactNode } from 'react';

  interface PlaidLinkProps {
    token: string | null;
    onSuccess: (public_token: string) => void;
    onExit?: () => void;
    onLoad?: () => void;
    onEvent?: (eventName: string, metadata: any) => void;
    language?: string;
    countryCodes?: string[];
    children?: ReactNode;
  }

  export function usePlaidLink(props: PlaidLinkProps): {
    open: () => void;
    ready: boolean;
  };
} 