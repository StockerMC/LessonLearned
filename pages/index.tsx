import Head from 'next/head'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import SpeechRecognition from 'react-speech-recognition';
import { createSpeechlySpeechRecognition } from '@speechly/speech-recognition-polyfill';
import { createGlobalStyle } from "styled-components";
import { config, dom } from "@fortawesome/fontawesome-svg-core";
// import NewLesson from './components/NewLesson';
import { Auth } from '@supabase/auth-ui-react';
import { supabase } from './util/supabaseClient';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import NewLesson from './components/NewLesson';

// add fontawesome css

config.autoAddCss = false;
const GlobalStyles = createGlobalStyle`
    ${dom.css()}
`;

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const supabaseClient = useSupabaseClient()
  const user = useUser()
  // const [data, setData] = useState()

  return (
    <>
      <GlobalStyles />
      <Head>
        <title>LearnEasy</title>
        <meta name="description" content="Revolutionizing learning in the classroom" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <div className='content-container'>
          {user ? <div className="navbar-container">

          </div>: <></>}
          <p className='title'>LearnEasy</p>
          <p className='subtitle'>Accessible learning in the classroom</p>
          {/* <NewLesson /> */}
          {user ? <NewLesson /> : <Auth 
            appearance={{ theme: ThemeSupa }}
            supabaseClient={supabaseClient}
            providers={[]}
            redirectTo="http://localhost:3000/"
          />}
        </div>
      </main>
    </>
  )
}
