import { Lesson, saveLesson, saveLessonRecording } from "@/util/lesson";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router"
import styles from '@/styles/NewLessonNavbar.module.css'

export default function NewLessonNavbar(props: {setSaving: (value: boolean) => void}) {
    const router = useRouter();
    const supabaseClient = useSupabaseClient()
    return <div className={"flex row " + styles.container}>
        <button onClick={() => router.push('/dashboard')}>Back</button>
        <button onClick={() => {
            props.setSaving(true);
            
            // // @ts-expect-error
            // const lesson: Lesson = {};
            // const { data, error } = await saveLesson(supabaseClient, lesson);
            // // await saveLessonRecording()
        }}>Save and Quit</button>
    </div>
}