import React, { useRef } from 'react';

import {
  Box,
  Button,
  ModalBody,
  ModalFooter,
  Textarea,
  TextareaProps,
  useDisclosure
} from '@chakra-ui/react';
import MyTooltip from '@/components/MyTooltip';
import { useTranslation } from 'next-i18next';
import MyIcon from '@/components/Icon';
import MyModal from '@/components/MyModal';

type Props = TextareaProps & {
  title?: string;
  // variables: string[];
};

const PromptTextarea = React.forwardRef<HTMLTextAreaElement, Props>(
  function PromptTextarea(props, ref) {
    const ModalTextareaRef = useRef<HTMLTextAreaElement>(null);
    const TextareaRef = useRef<HTMLTextAreaElement>(null);

    const { t } = useTranslation();
    const { title = t('core.app.edit.Prompt Editor'), ...childProps } = props;

    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
      <>
        <Editor textareaRef={TextareaRef} {...childProps} onOpenModal={onOpen} />
        {isOpen && (
          <MyModal iconSrc="/imgs/modal/edit.svg" title={title} isOpen onClose={onClose}>
            <ModalBody>
              <Editor
                textareaRef={ModalTextareaRef}
                {...childProps}
                minH={'300px'}
                maxH={'auto'}
                minW={['100%', '512px']}
              />
            </ModalBody>
            <ModalFooter>
              <Button
                onClick={() => {
                  if (ModalTextareaRef.current && TextareaRef.current) {
                    TextareaRef.current.value = ModalTextareaRef.current.value;
                  }

                  onClose();
                }}
              >
                {t('common.Confirm')}
              </Button>
            </ModalFooter>
          </MyModal>
        )}
      </>
    );
  }
);

export default React.memo(PromptTextarea);

const Editor = React.memo(function Editor({
  onOpenModal,
  textareaRef,
  ...props
}: Props & {
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  onOpenModal?: () => void;
}) {
  const { t } = useTranslation();

  return (
    <Box h={'100%'} w={'100%'} position={'relative'}>
      <Textarea ref={textareaRef} textAlign={'justify'} maxW={'100%'} {...props} />
      {onOpenModal && (
        <Box
          zIndex={1}
          position={'absolute'}
          bottom={1}
          right={2}
          cursor={'pointer'}
          onClick={onOpenModal}
        >
          <MyTooltip label={t('common.ui.textarea.Magnifying')}>
            <MyIcon name={'fullScreenLight'} w={'14px'} color={'myGray.600'} />
          </MyTooltip>
        </Box>
      )}
    </Box>
  );
});
