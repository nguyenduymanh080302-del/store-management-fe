import { useCallback } from 'react';
import { useIntl } from 'react-intl';

type UseLocaleResult = {
  formatMessage: (id: string, values?: Record<string, any>) => string;
  intl: ReturnType<typeof useIntl>;
};

export const useLocale = (): UseLocaleResult => {
  const intl = useIntl();



  const formatMessage = useCallback(
    (id: string, values?: Record<string, any>) => {
      return intl.formatMessage({ id }, values);
    },
    [intl]
  );

  return {
    formatMessage,
    intl
  };
};
