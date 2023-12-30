import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import 'katex/dist/katex.min.css';
import RemarkMath from 'remark-math';
import RemarkBreaks from 'remark-breaks';
import RehypeKatex from 'rehype-katex';
import RemarkGfm from 'remark-gfm';

import styles from './index.module.scss';
import dynamic from 'next/dynamic';

import { Link, Button } from '@chakra-ui/react';
import MyTooltip from '../MyTooltip';
import { useTranslation } from 'next-i18next';
import { EventNameEnum, eventBus } from '@/web/common/utils/eventbus';
import MyIcon from '../Icon';
import { getFileAndOpen } from '@/web/core/dataset/utils';
import { MARKDOWN_QUOTE_SIGN } from '@fastgpt/global/core/chat/constants';

const CodeLight = dynamic(() => import('./CodeLight'));
const MermaidCodeBlock = dynamic(() => import('./img/MermaidCodeBlock'));
const MdImage = dynamic(() => import('./img/Image'));
const EChartsCodeBlock = dynamic(() => import('./img/EChartsCodeBlock'));

const ChatGuide = dynamic(() => import('./chat/Guide'));
const QuestionGuide = dynamic(() => import('./chat/QuestionGuide'));
const ImageBlock = dynamic(() => import('./chat/Image'));

export enum CodeClassName {
  guide = 'guide',
  questionGuide = 'questionGuide',
  mermaid = 'mermaid',
  echarts = 'echarts',
  quote = 'quote',
  img = 'img'
}

function Code({ inline, className, children }: any) {
  const match = /language-(\w+)/.exec(className || '');
  const codeType = match?.[1];

  if (codeType === CodeClassName.mermaid) {
    return <MermaidCodeBlock code={String(children)} />;
  }

  if (codeType === CodeClassName.guide) {
    return <ChatGuide text={String(children)} />;
  }
  if (codeType === CodeClassName.questionGuide) {
    return <QuestionGuide text={String(children)} />;
  }
  if (codeType === CodeClassName.echarts) {
    return <EChartsCodeBlock code={String(children)} />;
  }
  if (codeType === CodeClassName.img) {
    return <ImageBlock images={String(children)} />;
  }
  return (
    <CodeLight className={className} inline={inline} match={match}>
      {children}
    </CodeLight>
  );
}
function Image({ src }: { src?: string }) {
  return <MdImage src={src} />;
}
function A({ children, ...props }: any) {
  const { t } = useTranslation();

  // empty href link
  if (!props.href && typeof children?.[0] === 'string') {
    const text = useMemo(() => String(children), [children]);

    return (
      <MyTooltip label={t('core.chat.markdown.Quick Question')}>
        <Button
          variant={'whitePrimary'}
          size={'xs'}
          borderRadius={'md'}
          my={1}
          onClick={() => eventBus.emit(EventNameEnum.sendQuestion, { text })}
        >
          {text}
        </Button>
      </MyTooltip>
    );
  }

  // quote link
  if (children?.length === 1 && typeof children?.[0] === 'string') {
    const text = String(children);
    if (text === MARKDOWN_QUOTE_SIGN && props.href) {
      return (
        <MyTooltip label={props.href}>
          <MyIcon
            name={'core/chat/quoteSign'}
            transform={'translateY(-2px)'}
            w={'18px'}
            color={'primary.500'}
            cursor={'pointer'}
            _hover={{
              color: 'primary.700'
            }}
            onClick={() => getFileAndOpen(props.href)}
          />
        </MyTooltip>
      );
    }
  }

  return <Link {...props}>{children}</Link>;
}

const Markdown = ({ source, isChatting = false }: { source: string; isChatting?: boolean }) => {
  const formatSource = source
    .replace(/\\n/g, '\n&nbsp;')
    .replace(/(http[s]?:\/\/[^\s，。]+)([。，])/g, '$1 $2')
    .replace(/\n*(\[QUOTE SIGN\]\(.*\))/g, '$1');

  return (
    <ReactMarkdown
      className={`markdown ${styles.markdown}
      ${isChatting ? `${formatSource ? styles.waitingAnimation : styles.animation}` : ''}
    `}
      remarkPlugins={[RemarkMath, RemarkGfm, RemarkBreaks]}
      rehypePlugins={[RehypeKatex]}
      components={{
        img: Image,
        pre: 'div',
        p: (pProps) => <p {...pProps} dir="auto" />,
        code: Code,
        a: A
      }}
      linkTarget={'_blank'}
    >
      {formatSource}
    </ReactMarkdown>
  );
};

export default React.memo(Markdown);
