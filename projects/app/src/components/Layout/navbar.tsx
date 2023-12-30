import React, { useMemo } from 'react';
import { Box, BoxProps, Flex, Link, LinkProps } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useUserStore } from '@/web/support/user/useUserStore';
import { useChatStore } from '@/web/core/chat/storeChat';
import { HUMAN_ICON } from '@fastgpt/global/common/system/constants';
import { feConfigs } from '@/web/common/system/staticData';
import NextLink from 'next/link';
import Badge from '../Badge';
import Avatar from '../Avatar';
import MyIcon from '../Icon';
import { useTranslation } from 'next-i18next';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import MyTooltip from '../MyTooltip';
import { getDocPath } from '@/web/common/system/doc';

export enum NavbarTypeEnum {
  normal = 'normal',
  small = 'small'
}

const Navbar = ({ unread }: { unread: number }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { userInfo } = useUserStore();
  const { gitStar } = useSystemStore();
  const { lastChatAppId, lastChatId } = useChatStore();
  const navbarList = useMemo(
    () => [
      {
        label: t('navbar.Chat'),
        icon: 'chat',
        activeIcon: 'chatFill',
        link: `/chat?appId=${lastChatAppId}&chatId=${lastChatId}`,
        activeLink: ['/chat']
      },
      {
        label: t('navbar.Apps'),
        icon: 'core/app/aiLight',
        activeIcon: 'core/app/aiFill',
        link: `/app/list`,
        activeLink: ['/app/list', '/app/detail']
      },
      // {
      //   label: t('navbar.Plugin'),
      //   icon: 'common/navbar/pluginLight',
      //   activeIcon: 'common/navbar/pluginFill',
      //   link: `/plugin/list`,
      //   activeLink: ['/plugin/list', '/plugin/edit']
      // },
      {
        label: t('navbar.Datasets'),
        icon: 'dbLight',
        activeIcon: 'dbFill',
        link: `/dataset/list`,
        activeLink: ['/dataset/list', '/dataset/detail']
      },
      ...(feConfigs?.show_appStore
        ? [
          {
            label: t('navbar.Store'),
            icon: 'appStoreLight',
            activeIcon: 'appStoreFill',
            link: '/appStore',
            activeLink: ['/appStore']
          }
        ]
        : []),
      {
        label: t('navbar.Account'),
        icon: 'meLight',
        activeIcon: 'meFill',
        link: '/account',
        activeLink: ['/account']
      }
    ],
    [lastChatAppId, lastChatId, t]
  );

  const itemStyles: BoxProps & LinkProps = {
    my: 3,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    w: '48px',
    h: '58px',
    borderRadius: 'md'
  };

  return (
    <Flex
      flexDirection={'column'}
      alignItems={'center'}
      pt={6}
      h={'100%'}
      w={'100%'}
      userSelect={'none'}
    >
      {/* logo */}
      <Box
        flex={'0 0 auto'}
        mb={5}
        border={'2px solid #fff'}
        borderRadius={'50%'}
        overflow={'hidden'}
        cursor={'pointer'}
        onClick={() => router.push('/account')}
      >
        <Avatar w={'36px'} h={'36px'} src={userInfo?.avatar} fallbackSrc={HUMAN_ICON} />
      </Box>
      {/* 导航列表 */}
      <Box flex={1}>
        {navbarList.map((item) => (
          <Box
            key={item.link}
            {...itemStyles}
            {...(item.activeLink.includes(router.pathname)
              ? {
                color: 'primary.600',
                bg: 'white',
                boxShadow:
                  '0px 0px 1px 0px rgba(19, 51, 107, 0.08), 0px 4px 4px 0px rgba(19, 51, 107, 0.05)'
              }
              : {
                color: 'myGray.500',
                bg: 'transparent',
                _hover: {
                  bg: 'rgba(255,255,255,0.9)'
                }
              })}
            {...(item.link !== router.asPath
              ? {
                onClick: () => router.push(item.link)
              }
              : {})}
          >
            <MyIcon
              name={
                item.activeLink.includes(router.pathname)
                  ? (item.activeIcon as any)
                  : (item.icon as any)
              }
              width={'20px'}
              height={'20px'}
            />
            <Box fontSize={'12px'} transform={'scale(0.9)'} mt={'5px'} lineHeight={1}>
              {item.label}
            </Box>
          </Box>
        ))}
      </Box>

      {unread > 0 && (
        <Box>
          <Link
            as={NextLink}
            {...itemStyles}
            prefetch
            href={`/account?currentTab=inform`}
            mb={0}
            color={'#9096a5'}
          >
            <Badge count={unread}>
              <MyIcon name={'inform'} width={'22px'} height={'22px'} />
            </Badge>
          </Link>
        </Box>
      )}
      {(feConfigs?.docUrl || feConfigs?.chatbotUrl) && (
        <MyTooltip label={t('common.system.Use Helper')} placement={'right-end'}>
          <Link
            {...itemStyles}
            href={feConfigs?.chatbotUrl || getDocPath('/docs/intro')}
            target="_blank"
            mb={0}
            color={'#9096a5'}
          >
            <MyIcon name={'common/courseLight'} width={'26px'} height={'26px'} />
          </Link>
        </MyTooltip>
      )}
      {/* {feConfigs?.show_git && (
        <MyTooltip label={`Git Star: ${gitStar}`} placement={'right-end'}>
          <Link
            as={NextLink}
            href="https://github.com/labring/FastGPT"
            target={'_blank'}
            {...itemStyles}
            mt={0}
            color={'#9096a5'}
          >
            <MyIcon name={'git'} width={'22px'} height={'22px'} />
          </Link>
        </MyTooltip>
      )} */}
    </Flex>
  );
};

export default Navbar;
