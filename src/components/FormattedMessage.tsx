import React from 'react';
import { FormattedMessage as IntlFormattedMessage, MessageDescriptor, useIntl } from 'react-intl';

const FormattedMessage: React.FC<MessageDescriptor> = ({ id, ...props }) => {
  const intl = useIntl();

  const isMessageIdDefined = Object.prototype.hasOwnProperty.call(intl.messages, id as PropertyKey);

  return isMessageIdDefined ? <IntlFormattedMessage id={id} {...props} /> : id;
};

export default FormattedMessage;
