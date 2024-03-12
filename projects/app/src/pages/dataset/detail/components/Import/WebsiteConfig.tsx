import React from 'react';
import MyModal from '@/components/MyModal';
import { useTranslation } from 'next-i18next';
import { Box, Button, Input, Link, ModalBody, ModalFooter } from '@chakra-ui/react';
import { strIsLink } from '@fastgpt/global/common/string/tools';
import { useToast } from '@/web/common/hooks/useToast';
import { useForm } from 'react-hook-form';
import { useConfirm } from '@/web/common/hooks/useConfirm';
import { getDocPath } from '@/web/common/system/doc';
import { feConfigs } from '@/web/common/system/staticData';

type FormType = {
  url?: string | undefined;
  selector?: string | undefined;
};

const WebsiteConfigModal = ({
  onClose,
  onSuccess,
  defaultValue = {
    url: '',
    selector: ''
  }
}: {
  onClose: () => void;
  onSuccess: (data: FormType) => void;
  defaultValue?: FormType;
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { register, handleSubmit } = useForm({
    defaultValues: defaultValue
  });
  const isEdit = !!defaultValue.url;
  const confirmTip = isEdit
    ? t('core.dataset.website.Confirm Update Tips')
    : t('core.dataset.website.Confirm Create Tips');

  const { ConfirmModal, openConfirm } = useConfirm({
    type: 'common'
  });

  return (
    <MyModal
      isOpen
      iconSrc="core/dataset/websiteDataset"
      title={t('core.dataset.website.Config')}
      onClose={onClose}
      maxW={'500px'}
    >
      <ModalBody>
        <Box fontSize={'sm'} color={'myGray.600'}>
          {t('core.dataset.website.Config Description')}
          {feConfigs?.docUrl && (
            <Link
              href={getDocPath('/docs/course/websync')}
              target="_blank"
              textDecoration={'underline'}
              fontWeight={'bold'}
            >
              {t('common.course.Read Course')}
            </Link>
          )}
        </Box>
        <Box mt={2}>
          <Box>{t('core.dataset.website.Base Url')}</Box>
          <Input
            placeholder={t('core.dataset.collection.Website Link')}
            {...register('url', {
              required: true
            })}
          />
        </Box>
        <Box mt={3}>
          <Box>
            {t('core.dataset.website.Selector')}({t('common.choosable')})
          </Box>
          <Input {...register('selector')} placeholder="body .content #document" />
        </Box>
      </ModalBody>
      <ModalFooter>
        <Button variant={'whiteBase'} onClick={onClose}>
          {t('common.Close')}
        </Button>
        <Button
          ml={2}
          onClick={handleSubmit((data) => {
            if (!data.url) return;
            // check is link
            if (!strIsLink(data.url)) {
              return toast({
                status: 'warning',
                title: t('common.link.UnValid')
              });
            }
            openConfirm(
              () => {
                onSuccess(data);
              },
              undefined,
              confirmTip
            )();
          })}
        >
          {t('core.dataset.website.Start Sync')}
        </Button>
      </ModalFooter>
      <ConfirmModal />
    </MyModal>
  );
};

export default WebsiteConfigModal;
