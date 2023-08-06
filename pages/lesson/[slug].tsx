import { useRouter } from 'next/router';
import type { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import { LessonData, getLessonById, saveLesson } from '../util/lesson';

 
export const getServerSideProps: GetServerSideProps<{lesson: LessonData}> = async (ctx) => {
  // await saveLesson({name: 'Quadratic Formula', description: 'A', transcript: 'A', summary: 'A', owner: 'Aayan'})
  const slug = ctx.params?.slug as string;
  const { data, error } = await getLessonById(slug);
  console.log(data, error);
  if (!data || error != null) return {notFound: true}

  return { props: {
    lesson: data as unknown as LessonData
  }}
}

export default function Page({lesson}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter()
  return <>
    <p>Lesson Name {lesson.name}</p>
    {/* <button}></button> */}
  </>
}
