

import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
import { NextApiRequest, NextApiResponse } from "next";

import { Configuration, OpenAIApi } from 'openai'


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    return res.status(200).json({'summarized': 'Loading...'})
      const supabaseServerClient = createPagesServerClient({req, res});
      const {
          data: { user },
      } = await supabaseServerClient.auth.getUser();
  
      if (!user) {
        res.status(403).end('User not authenticated')
        return
      }

      const config = new Configuration({apiKey: process.env.REACT_APP_OPENAI_API_KEY})
      const openai = new OpenAIApi(config);
    
      openai
      .createCompletion({
        model: "text-davinci-003",
        prompt: `Please summarize the following text:\n${req.query.text}`,
        temperature: 0.5,
        max_tokens: 1024,
      })
      .then((openaires) => {
        if (openaires.status === 200) {
            res.status(200).json({'text': openaires?.data?.choices[0]?.text});;
        } else {
          console.log(openaires.data, openaires.status)
          res.status(openaires.status).json({'text': 'ERR0R'});
        }
      })
      .catch((err) => {
        console.log(err, "An error occured");
        res.status(500).json({'text': 'ERR0R'});
      });
    }