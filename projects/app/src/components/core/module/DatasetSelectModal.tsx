import React, { useMemo, useState } from 'react';
import {
  Card,
  Flex,
  Box,
  Button,
  ModalBody,
  ModalFooter,
  useTheme,
  Grid,
  Divider
} from '@chakra-ui/react';
import Avatar from '@/components/Avatar';
import type { SelectedDatasetType } from '@fastgpt/global/core/module/api.d';
import { useToast } from '@/web/common/hooks/useToast';
import MyTooltip from '@/components/MyTooltip';
import MyIcon from '@/components/Icon';
import { DatasetTypeEnum } from '@fastgpt/global/core/dataset/constant';
import { useTranslation } from 'next-i18next';
import { useDatasetStore } from '@/web/core/dataset/store/dataset';
import DatasetSelectContainer, { useDatasetSelect } from '@/components/core/dataset/SelectModal';
import { useLoading } from '@/web/common/hooks/useLoading';
import EmptyTip from '@/components/EmptyTip';

export const DatasetSelectModal = ({
  isOpen,
  defaultSelectedDatasets = [],
  onChange,
  onClose
}: {
  isOpen: boolean;
  defaultSelectedDatasets: SelectedDatasetType;
  onChange: (e: SelectedDatasetType) => void;
  onClose: () => void;
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { allDatasets } = useDatasetStore();
  const [selectedDatasets, setSelectedDatasets] = useState<SelectedDatasetType>(
    defaultSelectedDatasets.filter((dataset) => {
      return allDatasets.find((item) => item._id === dataset.datasetId);
    })
  );
  const { toast } = useToast();
  const { paths, setParentId, datasets, isFetching } = useDatasetSelect();
  const { Loading } = useLoading();

  const filterDatasets = useMemo(() => {
    return {
      selected: allDatasets.filter((item) =>
        selectedDatasets.find((dataset) => dataset.datasetId === item._id)
      ),
      unSelected: datasets.filter(
        (item) => !selectedDatasets.find((dataset) => dataset.datasetId === item._id)
      )
    };
  }, [datasets, allDatasets, selectedDatasets]);

  return (
    <DatasetSelectContainer
      isOpen={isOpen}
      paths={paths}
      setParentId={setParentId}
      tips={t('dataset.Select Dataset Tips')}
      onClose={onClose}
    >
      <Flex h={'100%'} flexDirection={'column'} flex={'1 0 0'}>
        <ModalBody flex={'1 0 0'} overflowY={'auto'} userSelect={'none'}>
          <Grid
            gridTemplateColumns={[
              'repeat(1, minmax(0, 1fr))',
              'repeat(2, minmax(0, 1fr))',
              'repeat(3, minmax(0, 1fr))'
            ]}
            gridGap={3}
          >
            {filterDatasets.selected.map((item) =>
              (() => {
                return (
                  <Card
                    key={item._id}
                    p={3}
                    border={theme.borders.base}
                    boxShadow={'sm'}
                    bg={'primary.200'}
                  >
                    <Flex alignItems={'center'} h={'38px'}>
                      <Avatar src={item.avatar} w={['24px', '28px']}></Avatar>
                      <Box flex={'1 0 0'} w={0} className="textEllipsis" mx={3}>
                        {item.name}
                      </Box>
                      <MyIcon
                        name={'delete'}
                        w={'14px'}
                        cursor={'pointer'}
                        _hover={{ color: 'red.500' }}
                        onClick={() => {
                          setSelectedDatasets((state) =>
                            state.filter((kb) => kb.datasetId !== item._id)
                          );
                        }}
                      />
                    </Flex>
                  </Card>
                );
              })()
            )}
          </Grid>

          {filterDatasets.selected.length > 0 && <Divider my={3} />}

          <Grid
            gridTemplateColumns={[
              'repeat(1, minmax(0, 1fr))',
              'repeat(2, minmax(0, 1fr))',
              'repeat(3, minmax(0, 1fr))'
            ]}
            gridGap={3}
          >
            {filterDatasets.unSelected.map((item) =>
              (() => {
                return (
                  <MyTooltip
                    key={item._id}
                    label={
                      item.type === DatasetTypeEnum.folder
                        ? t('dataset.Select Folder')
                        : t('dataset.Select Dataset')
                    }
                  >
                    <Card
                      p={3}
                      border={theme.borders.base}
                      boxShadow={'sm'}
                      h={'80px'}
                      cursor={'pointer'}
                      _hover={{
                        boxShadow: 'md'
                      }}
                      onClick={() => {
                        if (item.type === DatasetTypeEnum.folder) {
                          setParentId(item._id);
                        } else {
                          const vectorModel = selectedDatasets[0]?.vectorModel?.model;

                          if (vectorModel && vectorModel !== item.vectorModel.model) {
                            return toast({
                              status: 'warning',
                              title: t('dataset.Select Dataset Tips')
                            });
                          }
                          setSelectedDatasets((state) => [
                            ...state,
                            { datasetId: item._id, vectorModel: item.vectorModel }
                          ]);
                        }
                      }}
                    >
                      <Flex alignItems={'center'} h={'38px'}>
                        <Avatar src={item.avatar} w={['24px', '28px']}></Avatar>
                        <Box
                          flex={'1 0 0'}
                          w={0}
                          className="textEllipsis"
                          ml={3}
                          fontWeight={'bold'}
                          fontSize={['md', 'lg', 'xl']}
                        >
                          {item.name}
                        </Box>
                      </Flex>
                      <Flex justifyContent={'flex-end'} alignItems={'center'} fontSize={'sm'}>
                        {item.type === DatasetTypeEnum.folder ? (
                          <Box color={'myGray.500'}>{t('Folder')}</Box>
                        ) : (
                          <>
                            <MyIcon mr={1} name="kbTest" w={'12px'} />
                            <Box color={'myGray.500'}>{item.vectorModel.name}</Box>
                          </>
                        )}
                      </Flex>
                    </Card>
                  </MyTooltip>
                );
              })()
            )}
          </Grid>
          {filterDatasets.unSelected.length === 0 && <EmptyTip text={t('common.folder.empty')} />}
        </ModalBody>

        <ModalFooter>
          <Button
            onClick={() => {
              // filter out the dataset that is not in the kList
              const filterDatasets = selectedDatasets.filter((dataset) => {
                return allDatasets.find((item) => item._id === dataset.datasetId);
              });

              onClose();
              onChange(filterDatasets);
            }}
          >
            {t('common.Done')}
          </Button>
        </ModalFooter>

        <Loading fixed={false} loading={isFetching} />
      </Flex>
    </DatasetSelectContainer>
  );
};

export default DatasetSelectModal;
