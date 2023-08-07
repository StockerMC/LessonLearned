import { User } from "@supabase/supabase-js";
import { LessonData, getLessonsForUser } from "../util/lesson";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
import LessonPreviewCard from "@/components/LessonPreviewCard";
import Head from "next/head";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";

// // add fontawesome css

// config.autoAddCss = false;
// const GlobalStyles = createGlobalStyle`
//     ${dom.css()}
// `;
 
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
    return (
        <>
        {/* <GlobalStyles /> */}
        <Head>
            <title>LessonLearned - Dashboard</title>
            <meta name="description" content="Revolutionizing learning in the classroom" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link rel="icon" href="/favicon.ico" />
        </Head>
        <main className={`${inter.className}`}>
            <div className='content-container'>
            {/* {user ? <Navbar /> : <></>} */}
            <Navbar />
            <p className='title'>LessonLearned</p>
            <p className='subtitle'>Accessible learning in the classroom</p>
            </div>
            <div>
                <div className="flex row wrap">
                    <button>Sort</button>
                    {/* or just fontawesome plus icon */}
                    <button>New +</button>
                </div>
                <div className="flex row wrap">
                    {lessons.map(lesson => <LessonPreviewCard lesson={lesson} key={lesson.id} />)}
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