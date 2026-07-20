import { FormattedMessage as IntlFormattedMessage, MessageDescriptor, useIntl } from 'react-intl';

type FormattedMessageProps = MessageDescriptor;

const FormattedMessage = ({ id, ...props }: FormattedMessageProps) => {
  const intl = useIntl();

  const isMessageIdDefined = Object.prototype.hasOwnProperty.call(intl.messages, id as PropertyKey);

  return isMessageIdDefined ? <IntlFormattedMessage id={id} {...props} /> : id;
};

export default FormattedMessage;
