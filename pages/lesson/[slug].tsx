import { useRouter } from 'next/router';
import type { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import { LessonData, getLessonById, saveLesson } from '../../util/lesson';
import { User, createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { useState } from 'react';
import { userAgentFromString } from 'next/server';
import Head from 'next/head';
import styles from '@/styles/Lesson.module.css'
import { Inter } from 'next/font/google';
import Loading from '@/components/Loading';

const inter = Inter({ subsets: ['latin']})

export const getServerSideProps: GetServerSideProps<{lesson: LessonData, user: User}> = async (ctx) => {
  // await saveLesson({name: 'Quadratic Formula', description: 'A', transcript: 'A', summary: 'A', owner: 'Aayan'})
  const slug = ctx.params?.slug as string;
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

  const { data, error } = await getLessonById(supabase, slug);
  console.log(data, error);
  if (!data || error != null) return {notFound: true}

  return { props: {
    lesson: data as unknown as LessonData,
    user: session.user
  }}
}

export default function Page({lesson, user}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter()
  const supabase = useSupabaseClient();
  // const user = useUser() as User;

  const [saved, setSaved] = useState(lesson.users.includes(user.id));
  const [saving, setSaving] = useState(false);
  // let saving = false;

  return (
      <>
        {/* <GlobalStyles /> */}
        <Head>
            <title>LessonLearned - {lesson.name}</title>
            <meta name="description" content="Revolutionizing learning in the classroom" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link rel="icon" href="/favicon.ico" />
        </Head>
        <main className={`${styles.main} ${inter.className}`}>
          <p>Lesson Name {lesson.name}, lesson id {lesson.id}</p>
          <button onClick={() => {
            if (saving) return;
            setSaving(true);
            if (saved) {
              supabase.rpc('remove_user_from_lesson', { lesson_id: lesson.id, user_id: user.id}).then(({ data, error }) => {
                alert('Post unsaved!')
                console.log(data, error)
                if (!error) setSaved(false)
              });
            } else {
              supabase.rpc('add_user_to_lesson', { lesson_id: lesson.id, user_id: user.id}).then(({ data, error }) => {
                alert('Post saved!')
                console.log(data, error)
                if (!error) setSaved(true)
              });
            }
            setSaving(false);
          }}>{saved ? 'Unsave' : 'Save'} lesson</button>
          <Loading active={saving} />
        </main>
      </>
  )
}
