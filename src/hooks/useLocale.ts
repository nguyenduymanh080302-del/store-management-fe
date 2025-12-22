import { useCallback } from 'react';
import { useIntl } from 'react-intl';

import { useAppDispatch, useAppSelector } from 'hooks';
import { appSelector, setLanguage } from 'store/slice/app.slice';

type UseLocaleResult = {
  locale: string;
  changeLocale: (newLocale: string) => void;
  formatMessage: (id: string, values?: Record<string, any>) => string;
  intl: ReturnType<typeof useIntl>;
};

export const useLocale = (): UseLocaleResult => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { locale } = useAppSelector(appSelector);

  const changeLocale = useCallback(
    (newLocale: string) => {
      if (newLocale !== locale) {
        dispatch(setLanguage(newLocale));
        // Lưu ngôn ngữ vào localStorage để persist
        localStorage.setItem('locale', newLocale);
      }
    },
    [dispatch, locale]
  );

  const formatMessage = useCallback(
    (id: string, values?: Record<string, any>) => {
      return intl.formatMessage({ id }, values);
    },
    [intl]
  );

  return {
    locale,
    changeLocale,
    formatMessage,
    intl
  };
};
