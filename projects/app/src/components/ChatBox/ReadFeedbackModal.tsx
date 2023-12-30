import React from 'react';
import { ModalBody, ModalFooter, Button } from '@chakra-ui/react';
import MyModal from '../MyModal';
import { useTranslation } from 'next-i18next';

const ReadFeedbackModal = ({
  content,
  onCloseFeedback,
  onClose
}: {
  content: string;
  onCloseFeedback: () => void;
  onClose: () => void;
}) => {
  const { t } = useTranslation();

  return (
    <MyModal
      isOpen={true}
      onClose={onClose}
      iconSrc="/imgs/modal/readFeedback.svg"
      title={t('chat.Feedback Modal')}
    >
      <ModalBody>{content}</ModalBody>
      <ModalFooter>
        <Button mr={2} onClick={onCloseFeedback}>
          {t('core.chat.feedback.Feedback Close')}
        </Button>
      </ModalFooter>
    </MyModal>
  );
};

export default React.memo(ReadFeedbackModal);
