import { useRouter } from 'next/router';
import type { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import { LessonData, getLessonById, saveLesson } from '../util/lesson';
import { User, createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';

 
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

  let saved = false;

  return <>
    <p>Lesson Name {lesson.name}, lesson id {lesson.id}</p>
    <button onClick={() => {
      if (saved) {
        supabase.rpc('remove_user_from_lesson', { lesson_id: lesson.id, user_id: user.id}).then(({ data, error }) => {
          alert('Post unsaved!')
          console.log(data, error)
        });
      } else {
        supabase.rpc('add_user_to_lesson', { lesson_id: lesson.id, user_id: user.id}).then(({ data, error }) => {
          alert('Post saved!')
          console.log(data, error)
        });
      }
    }}>{saved ? 'Unsave' : 'Save'} lesson</button>

  </>
}
