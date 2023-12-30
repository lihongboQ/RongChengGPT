import React from 'react';
import { ModalBody, Box, Flex, Input, ModalFooter, Button } from '@chakra-ui/react';
import MyModal from '@/components/MyModal';
import { useTranslation } from 'next-i18next';
import { useForm } from 'react-hook-form';
import { useRequest } from '@/web/common/hooks/useRequest';
import { updatePasswordByOld } from '@/web/support/user/api';

type FormType = {
  oldPsw: string;
  newPsw: string;
  confirmPsw: string;
};

const UpdatePswModal = ({ onClose }: { onClose: () => void }) => {
  const { t } = useTranslation();
  const { register, handleSubmit } = useForm<FormType>({
    defaultValues: {
      oldPsw: '',
      newPsw: '',
      confirmPsw: ''
    }
  });

  const { mutate: onSubmit, isLoading } = useRequest({
    mutationFn: (data: FormType) => {
      if (data.newPsw !== data.confirmPsw) {
        return Promise.reject(t('common.Password inconsistency'));
      }
      return updatePasswordByOld(data);
    },
    onSuccess() {
      onClose();
    },
    successToast: t('user.Update password successful'),
    errorToast: t('user.Update password failed')
  });

  return (
    <MyModal
      isOpen
      onClose={onClose}
      iconSrc="/imgs/modal/password.svg"
      title={t('user.Update Password')}
    >
      <ModalBody>
        <Flex alignItems={'center'}>
          <Box flex={'0 0 70px'}>旧密码:</Box>
          <Input flex={1} type={'password'} {...register('oldPsw', { required: true })}></Input>
        </Flex>
        <Flex alignItems={'center'} mt={5}>
          <Box flex={'0 0 70px'}>新密码:</Box>
          <Input
            flex={1}
            type={'password'}
            {...register('newPsw', {
              required: true,
              maxLength: {
                value: 20,
                message: '密码最少 4 位最多 20 位'
              }
            })}
          ></Input>
        </Flex>
        <Flex alignItems={'center'} mt={5}>
          <Box flex={'0 0 70px'}>确认密码:</Box>
          <Input
            flex={1}
            type={'password'}
            {...register('confirmPsw', {
              required: true,
              maxLength: {
                value: 20,
                message: '密码最少 4 位最多 20 位'
              }
            })}
          ></Input>
        </Flex>
      </ModalBody>
      <ModalFooter>
        <Button mr={3} variant={'whiteBase'} onClick={onClose}>
          取消
        </Button>
        <Button isLoading={isLoading} onClick={handleSubmit((data) => onSubmit(data))}>
          确认
        </Button>
      </ModalFooter>
    </MyModal>
  );
};

export default UpdatePswModal;
