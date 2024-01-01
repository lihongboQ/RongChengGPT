import type { NextApiResponse } from 'next';
import { ChatContextFilter } from '@fastgpt/service/core/chat/utils';
import type { moduleDispatchResType, ChatItemType } from '@fastgpt/global/core/chat/type.d';
import { ChatRoleEnum } from '@fastgpt/global/core/chat/constants';
import { sseResponseEventEnum } from '@fastgpt/service/common/response/constant';
import { textAdaptGptResponse } from '@/utils/adapt';
import { getAIApi } from '@fastgpt/service/core/ai/config';
import type { ChatCompletion, StreamChatType } from '@fastgpt/global/core/ai/type.d';
import { countModelPrice } from '@/service/support/wallet/bill/utils';
import type { ChatModelItemType } from '@fastgpt/global/core/ai/model.d';
import { postTextCensor } from '@/service/common/censor';
import { ChatCompletionRequestMessageRoleEnum } from '@fastgpt/global/core/ai/constant';
import type { ModuleItemType } from '@fastgpt/global/core/module/type.d';
import { countMessagesTokens, sliceMessagesTB } from '@fastgpt/global/common/string/tiktoken';
import { adaptChat2GptMessages } from '@fastgpt/global/core/chat/adapt';
import { Prompt_QuotePromptList, Prompt_QuoteTemplateList } from '@/global/core/prompt/AIChat';
import type { AIChatModuleProps } from '@fastgpt/global/core/module/node/type.d';
import { replaceVariable } from '@fastgpt/global/common/string/tools';
import type { ModuleDispatchProps } from '@fastgpt/global/core/module/type.d';
import { responseWrite, responseWriteController } from '@fastgpt/service/common/response';
import { getChatModel, ModelTypeEnum } from '@/service/core/ai/model';
import type { SearchDataResponseItemType } from '@fastgpt/global/core/dataset/type';
import { formatStr2ChatContent } from '@fastgpt/service/core/chat/utils';
import { ModuleInputKeyEnum, ModuleOutputKeyEnum } from '@fastgpt/global/core/module/constants';
import { getHistories } from '../utils';
import axios from 'axios';

export type ChatProps = ModuleDispatchProps<
  AIChatModuleProps & {
    [ModuleInputKeyEnum.userChatInput]: string;
    [ModuleInputKeyEnum.history]?: ChatItemType[] | number;
    [ModuleInputKeyEnum.aiChatDatasetQuote]?: SearchDataResponseItemType[];
  }
>;
export type ChatResponse = {
  [ModuleOutputKeyEnum.answerText]: any;
  [ModuleOutputKeyEnum.responseData]: moduleDispatchResType;
  [ModuleOutputKeyEnum.history]: ChatItemType[];
};

/* request openai chat */
export const dispatchChatCompletion = async (props: ChatProps): Promise<ChatResponse> => {
  let {
    res,
    stream = false,
    detail = false,
    user,
    histories,
    outputs,
    inputs: {
      model,
      temperature = 0,
      maxToken = 4000,
      history = 6,
      quoteQA = [],
      userChatInput,
      isResponseAnswerText = true,
      systemPrompt = '',
      quoteTemplate,
      quotePrompt
    }
  } = props;
  if (!userChatInput) {
    return Promise.reject('Question is empty');
  }

  stream = stream && isResponseAnswerText;

  const chatHistories = getHistories(history, histories);

  // temperature adapt
  const modelConstantsData = getChatModel(model);

  if (!modelConstantsData) {
    return Promise.reject('The chat model is undefined, you need to select a chat model.');
  }

  const { filterQuoteQA, quoteText } = filterQuote({
    quoteQA,
    model: modelConstantsData,
    quoteTemplate
  });

  // censor model and system key
  if (modelConstantsData.censor && !user.openaiAccount?.key) {
    await postTextCensor({
      text: `${systemPrompt}
      ${quoteText}
      ${userChatInput}
      `
    });
  }

  const { messages, filterMessages } = getChatMessages({
    model: modelConstantsData,
    histories: chatHistories,
    quoteText,
    quotePrompt,
    userChatInput,
    systemPrompt
  });
  const { max_tokens } = getMaxTokens({
    model: modelConstantsData,
    maxToken,
    filterMessages
  });

  // FastGPT temperature range: 1~10
  temperature = +(modelConstantsData.maxTemperature * (temperature / 10)).toFixed(2);
  temperature = Math.max(temperature, 0.01);
  const ai = getAIApi(user.openaiAccount, 480000);
  const concatMessages = [
    ...(modelConstantsData.defaultSystemChatPrompt
      ? [
          {
            role: ChatCompletionRequestMessageRoleEnum.System,
            content: modelConstantsData.defaultSystemChatPrompt
          }
        ]
      : []),
    ...(await Promise.all(
      messages.map(async (item) => ({
        ...item,
        content: modelConstantsData.vision
          ? await formatStr2ChatContent(item.content)
          : item.content
      }))
    ))
  ];

  if (concatMessages.length === 0) {
    return Promise.reject('core.chat.error.Messages empty');
  }
  // const RongChengGPTres: any = await axios.get(`http://18.221.12.198:5003/chatgpt?content=${concatMessages[concatMessages.length - 1].content}`)
  const response: any = '';
  // const response = await ai.chat.completions.create(
  //   {
  //     model,
  //     temperature,
  //     max_tokens,
  //     stream,
  //     presence_penalty: 0,
  //     frequency_penalty: 0,
  //     top_p: 1,
  //     // seed: temperature < 0.3 ? 1 : undefined,
  //     messages: concatMessages
  //   },
  //   {
  //     headers: {
  //       Accept: 'application/json, text/plain, */*'
  //     }
  //   }
  // );
  const { answerText, totalTokens, completeMessages } = await (async () => {
    if (stream) {
      // sse response
      // const { answer } = await streamResponse({
      //   res,
      //   detail,
      //   stream: response
      // });
      const RongChengGPTres = await axios.get(
        `http://18.221.12.198:5003/chatgpt?content=${
          concatMessages[concatMessages.length - 1].content
        }`
      );
      const data = RongChengGPTres.data;
      const answer = await streamResponse({ res, detail, stream: data });
      const completeMessages = filterMessages.concat({
        obj: ChatRoleEnum.AI,
        value: data
      });

      const totalTokens = countMessagesTokens({
        messages: completeMessages
      });

      targetResponse({ res, detail, outputs });

      return {
        answerText: data,
        totalTokens,
        completeMessages
      };
    } else {
      const unStreamResponse = response as ChatCompletion;
      const answer = unStreamResponse.choices?.[0]?.message?.content || '';
      const totalTokens = unStreamResponse.usage?.total_tokens || 0;
      const completeMessages = filterMessages.concat({
        obj: ChatRoleEnum.AI,
        value: answer
      });
      return {
        answerText: answer,
        totalTokens,
        completeMessages
      };
    }
  })();

  return {
    answerText,
    responseData: {
      price: user.openaiAccount?.key
        ? 0
        : countModelPrice({ model, tokens: totalTokens, type: ModelTypeEnum.chat }),
      model: modelConstantsData.name,
      tokens: totalTokens,
      query: userChatInput,
      maxToken: max_tokens,
      quoteList: filterQuoteQA,
      historyPreview: getHistoryPreview(completeMessages),
      contextTotalLen: completeMessages.length
    },
    history: completeMessages
  };
};

function filterQuote({
  quoteQA = [],
  model,
  quoteTemplate
}: {
  quoteQA: ChatProps['inputs']['quoteQA'];
  model: ChatModelItemType;
  quoteTemplate?: string;
}) {
  function getValue(item: SearchDataResponseItemType, index: number) {
    return replaceVariable(quoteTemplate || Prompt_QuoteTemplateList[0].value, {
      q: item.q,
      a: item.a,
      source: item.sourceName,
      sourceId: String(item.sourceId || 'UnKnow'),
      index: index + 1,
      score: item.score?.toFixed(4)
    });
  }

  const sliceResult = sliceMessagesTB({
    maxTokens: model.quoteMaxToken,
    messages: quoteQA.map((item, index) => ({
      obj: ChatRoleEnum.System,
      value: getValue(item, index)
    }))
  });

  // slice filterSearch
  const filterQuoteQA = quoteQA.slice(0, sliceResult.length);

  // filterQuoteQA按collectionId聚合在一起后，再按chunkIndex从小到大排序
  const sortQuoteQAMap: Record<string, SearchDataResponseItemType[]> = {};
  filterQuoteQA.forEach((item) => {
    if (sortQuoteQAMap[item.collectionId]) {
      sortQuoteQAMap[item.collectionId].push(item);
    } else {
      sortQuoteQAMap[item.collectionId] = [item];
    }
  });
  const sortQuoteQAList = Object.values(sortQuoteQAMap).flat();
  sortQuoteQAList.sort((a, b) => {
    if (a.collectionId === b.collectionId) {
      return a.chunkIndex - b.chunkIndex;
    }
    return 0;
  });

  const quoteText =
    filterQuoteQA.length > 0
      ? `${filterQuoteQA.map((item, index) => getValue(item, index)).join('\n')}`
      : '';

  return {
    filterQuoteQA: sortQuoteQAList,
    quoteText
  };
}
function getChatMessages({
  quotePrompt,
  quoteText,
  histories = [],
  systemPrompt,
  userChatInput,
  model
}: {
  quotePrompt?: string;
  quoteText: string;
  histories: ChatItemType[];
  systemPrompt: string;
  userChatInput: string;
  model: ChatModelItemType;
}) {
  const question = quoteText
    ? replaceVariable(quotePrompt || Prompt_QuotePromptList[0].value, {
        quote: quoteText,
        question: userChatInput
      })
    : userChatInput;

  const messages: ChatItemType[] = [
    ...(systemPrompt
      ? [
          {
            obj: ChatRoleEnum.System,
            value: systemPrompt
          }
        ]
      : []),
    ...histories,
    {
      obj: ChatRoleEnum.Human,
      value: question
    }
  ];

  const filterMessages = ChatContextFilter({
    messages,
    maxTokens: Math.ceil(model.maxContext - 300) // filter token. not response maxToken
  });

  const adaptMessages = adaptChat2GptMessages({ messages: filterMessages, reserveId: false });

  return {
    messages: adaptMessages,
    filterMessages
  };
}
function getMaxTokens({
  maxToken,
  model,
  filterMessages = []
}: {
  maxToken: number;
  model: ChatModelItemType;
  filterMessages: ChatItemType[];
}) {
  const tokensLimit = model.maxContext;

  /* count response max token */
  const promptsToken = countMessagesTokens({
    messages: filterMessages
  });
  maxToken = promptsToken + maxToken > tokensLimit ? tokensLimit - promptsToken : maxToken;

  return {
    max_tokens: maxToken
  };
}

function targetResponse({
  res,
  outputs,
  detail
}: {
  res: NextApiResponse;
  outputs: ModuleItemType['outputs'];
  detail: boolean;
}) {
  const targets =
    outputs.find((output) => output.key === ModuleOutputKeyEnum.answerText)?.targets || [];

  if (targets.length === 0) return;
  responseWrite({
    res,
    event: detail ? sseResponseEventEnum.answer : undefined,
    data: textAdaptGptResponse({
      text: '\n'
    })
  });
}

async function streamResponse({
  res,
  detail,
  stream
}: {
  res: any;
  detail: boolean;
  stream: string;
}) {
  // const write = responseWriteController({
  //   res,
  //   readStream: stream
  // });
  let answer: string = '';
  await stream.split('').forEach((el: any, index: number) => {
    answer += el;
    responseWrite({
      res,
      event: detail ? sseResponseEventEnum.answer : undefined,
      data: textAdaptGptResponse({
        text: el
      })
    });
  });
  // for await (const part of RongChengGPTres) {
  // if (res.closed) {
  //   stream.controller?.abort();
  //   break;
  // }
  // const content = part.choices?.[0]?.delta?.content || '';
  // answer += content;
  // }

  if (!answer) {
    return Promise.reject('Chat API is error or undefined');
  }

  return answer;
}

function getHistoryPreview(completeMessages: ChatItemType[]) {
  return completeMessages.map((item, i) => {
    if (item.obj === ChatRoleEnum.System) return item;
    if (i >= completeMessages.length - 2) return item;
    return {
      ...item,
      value: item.value.length > 15 ? `${item.value.slice(0, 15)}...` : item.value
    };
  });
}
