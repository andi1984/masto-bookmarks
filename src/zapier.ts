import axios from "axios";

export const notifyWebhook = async (url: string, body: Object) => {
  const res = await axios.post(url, body, {
    //@ts-ignore No idea....
    "Content-Type": "application/json",
  });
};
