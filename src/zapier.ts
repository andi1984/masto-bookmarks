const axios = require('axios');

export const notifyWebhook = async (url:string, body:Object) => {
	const res = await axios
    .post(url, body, {
      "Content-Type": "application/json"
      })
}