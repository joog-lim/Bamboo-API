import axios from "axios";

import {
  AlgorithmStatusType,
  BaseAlgorithmDTO,
  GeneratedAlgorithmDTO,
} from "../DTO/algorithm.dto";
import {
  DiscordEmbed,
  DiscordEmbedFooter,
  DiscordEmbedType,
  GenerateMessage,
  SendDiscordWebhookMessage,
} from "../DTO/discord.dto";

const generateWebhookMessage: Function = ({
  form,
  coment,
  description,
  color,
}: GenerateMessage): SendDiscordWebhookMessage => {
  const footerData: DiscordEmbedFooter = {
    text: form.tag,
    icon_url:
      "https://cdn.discordapp.com/avatars/826647881800351765/0493a57e7c5a21dd4e434a153d44938e.webp?size=128",
  };
  return {
    embeds: [
      {
        type: DiscordEmbedType.rich,
        title: coment,
        description: description,
        fields: [
          {
            name: form.title,
            value: form.content,
            inline: false,
          },
        ],
        footer: footerData,
        color: color,
      },
    ],
  };
};

export const sendAlgorithmMessageOfStatus: {
  [key in AlgorithmStatusType]: Function;
} = {
  PENDING: async (data: BaseAlgorithmDTO): Promise<void> => {
    const message: SendDiscordWebhookMessage = generateWebhookMessage({
      form: data,
      coment: "알고리즘 갱신!",
      description: "새로운 알고리즘이 기다리고있습니다!",
      color: 1752220,
    });
    await sendMessage(process.env.DISCORD_MANAGEMENT_WEBHOOK, message);
  },

  ACCEPTED: async (data: BaseAlgorithmDTO): Promise<void> => {
    const message: SendDiscordWebhookMessage = generateWebhookMessage({
      form: data,
      coment: "알고리즘 갱신!",
      description: "새로운 알고리즘이 기다리고있습니다!",
      color: 1752220,
    });
    await sendMessage(process.env.DISCORD_ACCEPTED_WEBHOOK, message);
  },

  REJECTED: async (data: BaseAlgorithmDTO, reason: string): Promise<void> => {
    const changeReason = reason ? `\n**거절 사유** : ${reason}` : "";
    const message: SendDiscordWebhookMessage = generateWebhookMessage({
      form: { title: data.title, content: " ", tag: data.tag },
      coment: "거절된 알고리즘",
      description: `해당 알고리즘이 거절되었습니다.${changeReason}`,
      color: 16711680,
    });
    await sendMessage(process.env.DISCORD_RECJECTED_WEBHOOK, message);
  },

  REPORTED: async (data: BaseAlgorithmDTO, reason: string): Promise<void> => {
    const changeReason = reason ? `\n**신고 사유** : ${reason}` : "";
    const message: SendDiscordWebhookMessage = generateWebhookMessage({
      form: data,
      coment: "알고리즘 신고",
      description: `해당 알고리즘이 신고되었습니다.${changeReason}`,
      color: 16711680,
    });
    await sendMessage(process.env.DISCORD_REPORT_WEBHOOK, message);
  },
};

export const algorithemDeleteEvenetMessage: Function = async (
  post: GeneratedAlgorithmDTO,
  reason: string
): Promise<void> => {
  const deletedReason: string = reason ? `\n**삭제 사유** : ${reason}` : "";
  const message: SendDiscordWebhookMessage = generateWebhookMessage({
    form: {
      title: post.title,
      tag: post.tag,
    },
    coment: "알고리즘이 삭제됨",
    description: `${post.number}번째 알고리즘이 삭제되었습니다.${deletedReason}`,
    color: 16711680,
  });
  await sendMessage(process.env.DISCORD_ABOUT_DELETE_WEBHOOK, message);
};

const sendMessage: Function = async (
  url: string,
  data: DiscordEmbed
): Promise<void> => {
  const _res = await axios({
    method: "POST",
    url: url,
    data: data,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
