import type { NextApiRequest, NextApiResponse } from 'next';
import type { HttpBodyType } from '@fastgpt/global/core/module/api.d';
import { getErrText } from '@fastgpt/global/common/error/utils';
import { replaceVariable } from '@fastgpt/global/common/string/tools';
import { authRequestFromLocal } from '@fastgpt/service/support/permission/auth/common';

type Props = HttpBodyType<{
  text: string;
  [key: string]: any;
}>;

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const {
      data: { text, ...obj }
    } = req.body as Props;

    await authRequestFromLocal({ req });

    const textResult = replaceVariable(text, obj);

    res.json({
      text: textResult
    });
  } catch (err) {
    console.log(err);
    res.status(500).send(getErrText(err));
  }
}
