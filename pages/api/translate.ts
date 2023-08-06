// taken from https://github.com/Rapptz/RoboDanny/blob/rewrite/cogs/utils/translator.py#L137

import type { NextApiRequest, NextApiResponse } from 'next'

import axios from "axios";
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

type Data = {
  translated: string,
//   error: string | null,
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
    const supabaseServerClient = createPagesServerClient({req, res});
    const {
        data: { user },
    } = await supabaseServerClient.auth.getUser();

    if (!user) {
        res.status(403).end('User not authenticated')
    }

    const query = {
        // 'dj': '1',
        // 'dt': ['sp', 't', 'ld', 'bd'],
        'client': 'gtx',
        'sl': req.query.src,
        'tl': req.query.dest,
        'q': req.query.text,
        'dt': 't',
    }

    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36'
    }

    let response;
    try {
        response = await axios.get('https://translate.googleapis.com/translate_a/single', {params: query, 'headers': headers})
    } catch (error: any) {
        console.error(error);
        res.status(error.status || 500).end(error.message);
        return;
    }
    
    if (response.status != 200) {
        console.error(response.statusText);
        res.status(response.status).json({'translated': 'ERROR - NON 200'});
        return;
    }

    
    const data = response.data;
    let translated = '';
    try {
        translated = data[0][0][0];
    } catch (error: any) {
        translated = 'ERROR - NO DATA';
    }

    res.status(200).json({'translated': translated});
    return;

    const sentences = data?.sentences;
    if (!sentences) {
        res.status(200).json({'translated': 'ERROR - NO DATA'});
        return;
    }
    // let translated = '';
    for (const sentence of sentences) {
        translated += sentence?.trans || '';
    }
    res.status(200).json({'translated': translated});
}
