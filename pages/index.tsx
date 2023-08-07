import Head from 'next/head'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import { createGlobalStyle } from "styled-components";
import { config, dom } from "@fortawesome/fontawesome-svg-core";
// import NewLesson from '@/components/NewLesson';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import NewLesson from '@/components/NewLesson';
import HomeNavbar from '@/components/HomeNavbar';
import { redirect } from 'next/dist/server/api-utils';
import { useRouter } from 'next/router';

// add fontawesome css

config.autoAddCss = false;
const GlobalStyles = createGlobalStyle`
    ${dom.css()}
`;

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const supabaseClient = useSupabaseClient();
  const user = useUser();
  const router = useRouter();

  if (user) {
    router.push('/dashboard');
    return <></>;
  }

  // const [data, setData] = useState()

  return (
    <>
      <GlobalStyles />
      <Head>
        <title>LessonLearned</title>
        <meta name="description" content="Revolutionizing learning in the classroom" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <div className='content-container'>
          {/* {user ? <Navbar /> : <></>} */}
          <p className='title'>LessonLearned</p>
          <p className='subtitle'>Accessible learning in the classroom</p>
          {/* <NewLesson /> */}
          {/* {user ? <Dashboard /> : <Auth  */}
          <Auth
            appearance={{ theme: ThemeSupa }}
            supabaseClient={supabaseClient}
            providers={[]}
            redirectTo="/api/auth/callback"
          />
        </div>
      </main>
    </>
  )
}
