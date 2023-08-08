import { Lesson, LessonData, saveLesson, saveLessonRecording } from "@/util/lesson";
import { User, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router"
import styles from '@/styles/NewLessonNavbar.module.css'

import {useState} from 'react';

export default function LessonNavbar(props: {setSaving: (value: boolean) => void, lesson: LessonData, user: User, saving: boolean}) {
    const router = useRouter();
    const supabase = useSupabaseClient();

    const { setSaving, saving, lesson, user } = props;
  
    const [saved, setSaved] = useState(lesson.users.includes(user.id));

    return (
        <div className={"flex row " + styles.container}>
            <button onClick={() => router.push('/dashboard')}>Back</button>
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
        </div>
    )
}