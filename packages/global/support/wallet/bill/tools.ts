/* bill common  */
import { PRICE_SCALE } from './constants';
import { BillSourceEnum } from './constants';
import { AuthUserTypeEnum } from '../../permission/constant';

/**
 * dataset price / PRICE_SCALE = real price
 */
export const formatPrice = (val = 0, multiple = 1) => {
  return Number(((val / PRICE_SCALE) * multiple).toFixed(10));
};

export const getBillSourceByAuthType = ({
  shareId,
  authType
}: {
  shareId?: string;
  authType?: `${AuthUserTypeEnum}`;
}) => {
  if (shareId) return BillSourceEnum.shareLink;
  if (authType === AuthUserTypeEnum.apikey) return BillSourceEnum.api;
  return BillSourceEnum.fastgpt;
};
