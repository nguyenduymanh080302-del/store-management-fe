import { useIntl } from 'react-intl';

type UseLocaleResult = {
  formatMessage: (id: string, values?: Record<string, any>) => string;
  intl: ReturnType<typeof useIntl>;
};

export const useLocale = (): UseLocaleResult => {
  const intl = useIntl();

  return {
    formatMessage: (id: string, values?: Record<string, any>) =>
      intl.formatMessage({ id }, values),
    intl,
  };
};


