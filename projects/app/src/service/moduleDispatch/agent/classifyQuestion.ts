import { adaptChat2GptMessages } from '@fastgpt/global/core/chat/adapt';
import { ChatContextFilter } from '@fastgpt/service/core/chat/utils';
import type { moduleDispatchResType, ChatItemType } from '@fastgpt/global/core/chat/type.d';
import { ChatRoleEnum } from '@fastgpt/global/core/chat/constants';
import { getAIApi } from '@fastgpt/service/core/ai/config';
import type { ClassifyQuestionAgentItemType } from '@fastgpt/global/core/module/type.d';
import { ModuleInputKeyEnum, ModuleOutputKeyEnum } from '@fastgpt/global/core/module/constants';
import type { ModuleDispatchProps } from '@fastgpt/global/core/module/type.d';
import { replaceVariable } from '@fastgpt/global/common/string/tools';
import { Prompt_CQJson } from '@/global/core/prompt/agent';
import { FunctionModelItemType } from '@fastgpt/global/core/ai/model.d';
import { getCQModel } from '@/service/core/ai/model';
import { getHistories } from '../utils';

type Props = ModuleDispatchProps<{
  [ModuleInputKeyEnum.aiModel]: string;
  [ModuleInputKeyEnum.aiSystemPrompt]?: string;
  [ModuleInputKeyEnum.history]?: ChatItemType[] | number;
  [ModuleInputKeyEnum.userChatInput]: string;
  [ModuleInputKeyEnum.agents]: ClassifyQuestionAgentItemType[];
}>;
type CQResponse = {
  [ModuleOutputKeyEnum.responseData]: moduleDispatchResType;
  [key: string]: any;
};

const agentFunName = 'classify_question';

/* request openai chat */
export const dispatchClassifyQuestion = async (props: Props): Promise<CQResponse> => {
  const {
    user,
    histories,
    inputs: { model, history = 6, agents, userChatInput }
  } = props as Props;

  if (!userChatInput) {
    return Promise.reject('Input is empty');
  }

  const cqModel = getCQModel(model);

  const chatHistories = getHistories(history, histories);

  const { arg, tokens } = await (async () => {
    if (cqModel.toolChoice) {
      return toolChoice({
        ...props,
        histories: chatHistories,
        cqModel
      });
    }
    return completions({
      ...props,
      histories: chatHistories,
      cqModel
    });
  })();

  const result = agents.find((item) => item.key === arg?.type) || agents[agents.length - 1];

  return {
    [result.key]: result.value,
    [ModuleOutputKeyEnum.responseData]: {
      price: user.openaiAccount?.key ? 0 : cqModel.price * tokens,
      model: cqModel.name || '',
      query: userChatInput,
      tokens,
      cqList: agents,
      cqResult: result.value,
      contextTotalLen: chatHistories.length + 2
    }
  };
};

async function toolChoice({
  user,
  cqModel,
  histories,
  inputs: { agents, systemPrompt, userChatInput }
}: Props & { cqModel: FunctionModelItemType }) {
  const messages: ChatItemType[] = [
    ...histories,
    {
      obj: ChatRoleEnum.Human,
      value: systemPrompt
        ? `<背景知识>
${systemPrompt}
</背景知识>

问题: "${userChatInput}"
      `
        : userChatInput
    }
  ];

  const filterMessages = ChatContextFilter({
    messages,
    maxTokens: cqModel.maxContext
  });
  const adaptMessages = adaptChat2GptMessages({ messages: filterMessages, reserveId: false });

  // function body
  const agentFunction = {
    name: agentFunName,
    description: '根据对话记录及补充的背景知识，对问题进行分类，并返回对应的类型字段',
    parameters: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          description: `问题类型。下面是几种可选的问题类型: ${agents
            .map((item) => `${item.value}，返回：'${item.key}'`)
            .join('；')}`,
          enum: agents.map((item) => item.key)
        }
      },
      required: ['type']
    }
  };
  const ai = getAIApi(user.openaiAccount, 480000);

  const response = await ai.chat.completions.create({
    model: cqModel.model,
    temperature: 0,
    messages: [...adaptMessages],
    tools: [
      {
        type: 'function',
        function: agentFunction
      }
    ],
    tool_choice: { type: 'function', function: { name: agentFunName } }
  });
  console.log('🚀 ~ file: classifyQuestion.ts:135 ~ response:', response);
  console.log('🚀 ~ file: classifyQuestion.ts:135 ~ response:', response);

  try {
    const arg = JSON.parse(
      response?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments || ''
    );

    return {
      arg,
      tokens: response.usage?.total_tokens || 0
    };
  } catch (error) {
    console.log(agentFunction.parameters);
    console.log(response.choices?.[0]?.message);

    console.log('Your model may not support toll_call', error);

    return {
      arg: {},
      tokens: 0
    };
  }
}

async function completions({
  cqModel,
  user,
  histories,
  inputs: { agents, systemPrompt = '', userChatInput }
}: Props & { cqModel: FunctionModelItemType }) {
  const messages: ChatItemType[] = [
    {
      obj: ChatRoleEnum.Human,
      value: replaceVariable(cqModel.functionPrompt || Prompt_CQJson, {
        systemPrompt,
        typeList: agents.map((item) => `{"${item.value}": ${item.key}}`).join('\n'),
        text: `${histories.map((item) => `${item.obj}:${item.value}`).join('\n')}
Human:${userChatInput}`
      })
    }
  ];

  const ai = getAIApi(user.openaiAccount, 480000);

  const data = await ai.chat.completions.create({
    model: cqModel.model,
    temperature: 0.01,
    messages: adaptChat2GptMessages({ messages, reserveId: false }),
    stream: false
  });
  console.log('🚀 ~ file: classifyQuestion.ts:186 ~ data:', data);
  console.log('🚀 ~ file: classifyQuestion.ts:186 ~ data:', data);
  console.log('🚀 ~ file: classifyQuestion.ts:186 ~ data:', data);
  const answer = data.choices?.[0].message?.content || '';
  const totalTokens = data.usage?.total_tokens || 0;

  const id = agents.find((item) => answer.includes(item.key))?.key || '';

  return {
    tokens: totalTokens,
    arg: { type: id }
  };
}
