import React, { useState } from 'react';
import MyModal from '../MyModal';
import { Box, Button, Flex, Grid, useTheme } from '@chakra-ui/react';
import { PromptTemplateItem } from '@fastgpt/global/core/ai/type.d';
import { ModalBody, ModalFooter } from '@chakra-ui/react';

const PromptTemplate = ({
  title,
  templates,
  onClose,
  onSuccess
}: {
  title: string;
  templates: PromptTemplateItem[];
  onClose: () => void;
  onSuccess: (e: PromptTemplateItem) => void;
}) => {
  const theme = useTheme();
  const [selectTemplateTitle, setSelectTemplateTitle] = useState<PromptTemplateItem>();

  return (
    <MyModal isOpen title={title} onClose={onClose} iconSrc="/imgs/modal/prompt.svg">
      <ModalBody h="100%" w={'600px'} maxW={'90vw'} overflowY={'auto'}>
        <Grid gridTemplateColumns={['1fr', '1fr 1fr']} gridGap={4}>
          {templates.map((item) => (
            <Box
              key={item.title}
              border={theme.borders.base}
              py={2}
              px={2}
              borderRadius={'md'}
              cursor={'pointer'}
              {...(item.title === selectTemplateTitle?.title
                ? {
                    bg: 'primary.50'
                  }
                : {})}
              onClick={() => setSelectTemplateTitle(item)}
            >
              <Box>{item.title}</Box>

              <Box color={'myGray.600'} fontSize={'sm'} whiteSpace={'pre-wrap'}>
                {item.desc}
              </Box>
            </Box>
          ))}
        </Grid>
      </ModalBody>
      <ModalFooter>
        <Button
          disabled={!selectTemplateTitle}
          onClick={() => {
            if (!selectTemplateTitle) return;
            onSuccess(selectTemplateTitle);
            onClose();
          }}
        >
          确认选择
        </Button>
      </ModalFooter>
    </MyModal>
  );
};

export default PromptTemplate;
