import { SupabaseClient, User, createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { randomUUID } from "crypto";

interface Lesson {
    name: string;
    description: string;
    owner: string;
    summary: string;
    transcript: string;
    users: string[];
}

export interface LessonData extends Lesson {
    id: string;
    created_at: string;
}

export async function saveLesson(supabase: SupabaseClient, lesson: Lesson) {
    // const supabase = createClientComponentClient()
    const { data, error } = await supabase
        .from('lessons')
        .insert(lesson)
        .select()
        .single();
    return { data, error }
}

export async function saveLessonRecording(supabase: SupabaseClient, blob: Blob) {
    const file = new File([blob], 'lesson.webm');
    return ;

}

export async function getLessonById(supabase: SupabaseClient, id: string) {
    // const supabase = createClientComponentClient()
    const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', id)
        .single();
    return { data, error };
}

export async function getLessonsForUser(supabase: SupabaseClient, user_id: string) {
    const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .contains('users', [user_id])
    return { data, error }
}