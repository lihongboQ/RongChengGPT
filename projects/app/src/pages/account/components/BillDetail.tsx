import React, { useMemo } from 'react';
import {
  ModalBody,
  Flex,
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer
} from '@chakra-ui/react';
import { BillItemType } from '@fastgpt/global/support/wallet/bill/type.d';
import dayjs from 'dayjs';
import { BillSourceMap } from '@fastgpt/global/support/wallet/bill/constants';
import { formatPrice } from '@fastgpt/global/support/wallet/bill/tools';
import MyModal from '@/components/MyModal';
import { useTranslation } from 'next-i18next';

const BillDetail = ({ bill, onClose }: { bill: BillItemType; onClose: () => void }) => {
  const { t } = useTranslation();
  const filterBillList = useMemo(
    () => bill.list.filter((item) => item && item.moduleName),
    [bill.list]
  );

  return (
    <MyModal
      isOpen={true}
      onClose={onClose}
      iconSrc="/imgs/modal/bill.svg"
      title={t('user.Bill Detail')}
    >
      <ModalBody>
        <Flex alignItems={'center'} pb={4}>
          <Box flex={'0 0 80px'}>用户:</Box>
          <Box>{t(bill.memberName)}</Box>
        </Flex>
        <Flex alignItems={'center'} pb={4}>
          <Box flex={'0 0 80px'}>订单号:</Box>
          <Box>{bill.id}</Box>
        </Flex>
        <Flex alignItems={'center'} pb={4}>
          <Box flex={'0 0 80px'}>生成时间:</Box>
          <Box>{dayjs(bill.time).format('YYYY/MM/DD HH:mm:ss')}</Box>
        </Flex>
        <Flex alignItems={'center'} pb={4}>
          <Box flex={'0 0 80px'}>应用名:</Box>
          <Box>{t(bill.appName) || '-'}</Box>
        </Flex>
        <Flex alignItems={'center'} pb={4}>
          <Box flex={'0 0 80px'}>来源:</Box>
          <Box>{BillSourceMap[bill.source]}</Box>
        </Flex>
        <Flex alignItems={'center'} pb={4}>
          <Box flex={'0 0 80px'}>总金额:</Box>
          <Box fontWeight={'bold'}>{bill.total}元</Box>
        </Flex>
        <Box pb={4}>
          <Box flex={'0 0 80px'} mb={1}>
            扣费模块
          </Box>
          <TableContainer>
            <Table>
              <Thead>
                <Tr>
                  <Th>模块名</Th>
                  <Th>AI模型</Th>
                  <Th>Token长度</Th>
                  <Th>费用(￥)</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filterBillList.map((item, i) => (
                  <Tr key={i}>
                    <Td>{t(item.moduleName)}</Td>
                    <Td>{item.model || '-'}</Td>
                    <Td>{item.tokenLen || '-'}</Td>
                    <Td>{formatPrice(item.amount)}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
      </ModalBody>
    </MyModal>
  );
};

export default BillDetail;
