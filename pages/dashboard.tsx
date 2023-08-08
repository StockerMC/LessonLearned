import { User } from "@supabase/supabase-js";
import { LessonData, getLessonsForUser } from "../util/lesson";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
import LessonPreviewCard, { NewCard } from "@/components/LessonPreviewCard";
import Head from "next/head";
import { Inter } from "next/font/google";
import HomeNavbar from "@/components/HomeNavbar";
import { useRouter } from "next/router";
import styles from '@/styles/Dashboard.module.css';
import { config, dom } from "@fortawesome/fontawesome-svg-core";
import { createGlobalStyle } from "styled-components";

// // add fontawesome css

config.autoAddCss = false;
const GlobalStyles = createGlobalStyle`
    ${dom.css()}
`;
 
export const getServerSideProps: GetServerSideProps<{lessons: LessonData[], user: User}> = async (ctx) => {
    // await saveLesson({name: 'Quadratic Formula', description: 'A', transcript: 'A', summary: 'A', owner: 'Aayan'})
    const supabase = createPagesServerClient(ctx)
  
    const {
      data: { session },
    } = await supabase.auth.getSession()
  
    if (!session){
        console.log('no session')
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      }
  }
  
    const { data, error } = await getLessonsForUser(supabase, session.user.id);
    console.log(data, error);
    if (!data || error != null) return {notFound: true}
  
    return { props: {
      lessons: data as LessonData[],
      user: session.user
    }}
  }

const inter = Inter({ subsets: ['latin'] })

export default function Dashboard({lessons, user}: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const router = useRouter();
    return (
        <>
        <GlobalStyles />
        <Head>
            <title>LessonLearned - Dashboard</title>
            <meta name="description" content="Revolutionizing learning in the classroom" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link rel="icon" href="/favicon.ico" />
        </Head>
        <main className={`${styles.main} ${inter.className}`}>
            <div className='content-container'>
            {/* {user ? <Navbar /> : <></>} */}
            <HomeNavbar />
            <div style={{position: 'relative', top: '-60px', zIndex: '-1'}}>
              <p className='title'>LessonLearned</p>
              <p className='subtitle'>Accessible learning in the classroom</p>
              </div>
              <div>
                  {/* <div className={styles.lessonMenuButtons}>
                      <button className={styles.button}>Sort</button>
                      <button onClick={() => router.push('/lesson/new')}>New +</button>
                  </div> */}
                  <div className={styles.cardContainer}>
                    <NewCard />
                      {lessons.map(lesson => <LessonPreviewCard lesson={lesson} key={lesson.id} />)}
                  </div>
              </div>
            </div>
        </main>
        </>
    )

    return <div>
        <div className="flex row wrap">
            <button>Sort</button>
            {/* or just fontawesome plus icon */}
            <button>New +</button>
        </div>
        <div className="flex row wrap">
            {lessons.map(lesson => <LessonPreviewCard lesson={lesson} key={lesson.id} />)}
        </div>
    </div>
}