import React, { useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import type { ResLogin } from '@/global/support/api/userRes.d';
import { useChatStore } from '@/web/core/chat/storeChat';
import { useUserStore } from '@/web/support/user/useUserStore';
import { clearToken, setToken } from '@/web/support/user/auth';
import { postFastLogin } from '@/web/support/user/api';
import { useToast } from '@/web/common/hooks/useToast';
import Loading from '@/components/Loading';
import { serviceSideProps } from '@/web/common/utils/i18n';
import { useQuery } from '@tanstack/react-query';
import { getErrText } from '@fastgpt/global/common/error/utils';

const FastLogin = ({
  code,
  token,
  callbackUrl
}: {
  code: string;
  token: string;
  callbackUrl: string;
}) => {
  const { setLastChatId, setLastChatAppId } = useChatStore();
  const { setUserInfo } = useUserStore();
  const router = useRouter();
  const { toast } = useToast();

  const loginSuccess = useCallback(
    (res: ResLogin) => {
      setToken(res.token);
      setUserInfo(res.user);

      // init store
      setLastChatId('');
      setLastChatAppId('');

      setTimeout(() => {
        router.push(decodeURIComponent(callbackUrl));
      }, 100);
    },
    [setLastChatId, setLastChatAppId, setUserInfo, router, callbackUrl]
  );

  const authCode = useCallback(
    async (code: string, token: string) => {
      try {
        const res = await postFastLogin({
          code,
          token
        });
        if (!res) {
          toast({
            status: 'warning',
            title: '登录异常'
          });
          return setTimeout(() => {
            router.replace('/login');
          }, 1000);
        }
        loginSuccess(res);
      } catch (error) {
        toast({
          status: 'warning',
          title: getErrText(error, '登录异常')
        });
        setTimeout(() => {
          router.replace('/login');
        }, 1000);
      }
    },
    [loginSuccess, router, toast]
  );

  useEffect(() => {
    clearToken();
    router.prefetch(callbackUrl);
    authCode(code, token);
  }, []);

  return <Loading />;
};

export async function getServerSideProps(content: any) {
  return {
    props: {
      code: content?.query?.code || '',
      token: content?.query?.token || '',
      callbackUrl: content?.query?.callbackUrl || '/app/list',
      ...(await serviceSideProps(content))
    }
  };
}

export default FastLogin;
