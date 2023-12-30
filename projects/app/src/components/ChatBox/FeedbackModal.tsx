import React, { useRef } from 'react';
import { ModalBody, Textarea, ModalFooter, Button } from '@chakra-ui/react';
import MyModal from '../MyModal';
import { useRequest } from '@/web/common/hooks/useRequest';
import { useTranslation } from 'next-i18next';
import { updateChatUserFeedback } from '@/web/core/chat/api';

const FeedbackModal = ({
  appId,
  chatId,
  chatItemId,
  onSuccess,
  onClose
}: {
  appId: string;
  chatId: string;
  chatItemId: string;
  onSuccess: (e: string) => void;
  onClose: () => void;
}) => {
  const ref = useRef<HTMLTextAreaElement>(null);
  const { t } = useTranslation();

  const { mutate, isLoading } = useRequest({
    mutationFn: async () => {
      const val = ref.current?.value || t('core.chat.feedback.No Content');
      return updateChatUserFeedback({
        appId,
        chatId,
        chatItemId,
        userBadFeedback: val
      });
    },
    onSuccess() {
      onSuccess(ref.current?.value || t('core.chat.feedback.No Content'));
    },
    successToast: t('chat.Feedback Success'),
    errorToast: t('chat.Feedback Failed')
  });

  return (
    <MyModal
      isOpen={true}
      onClose={onClose}
      iconSrc="/imgs/modal/badAnswer.svg"
      title={t('chat.Feedback Modal')}
    >
      <ModalBody>
        <Textarea ref={ref} rows={10} placeholder={t('chat.Feedback Modal Tip')} />
      </ModalBody>
      <ModalFooter>
        <Button variant={'whiteBase'} mr={2} onClick={onClose}>
          {t('Cancel')}
        </Button>
        <Button isLoading={isLoading} onClick={mutate}>
          {t('chat.Feedback Submit')}
        </Button>
      </ModalFooter>
    </MyModal>
  );
};

export default FeedbackModal;
