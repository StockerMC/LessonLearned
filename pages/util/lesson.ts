import { randomUUID } from "crypto";
import { supabase } from './supabaseClient'

interface Lesson {
    name: string;
    description: string;
    owner: string;
    summary: string;
    transcript: string;
}

export interface LessonData extends Lesson {
    uuid: string;
    created_at: string;
}

export async function saveLesson(lesson: Lesson) {
    const { data, error } = await supabase
        .from('lessons')
        .insert(lesson)
        .select()
        .single();
    return { data, error }
}

export async function getLessonById(id: string) {
    const { data, error } = await supabase
        .from('lessons')
        .select('*')
        // .eq('id', id)
        .single();
    return { data, error };
}