import { useRouter } from "next/router";
import { LessonData } from "../util/lesson";

import styles from '@/styles/LessonPreviewCard.module.css'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faPlusCircle } from "@fortawesome/free-solid-svg-icons";

export default function LessonPreviewCard(props: {lesson: LessonData}) {
    const lesson = props.lesson;
    const router = useRouter();
    const date = new Date(lesson.created_at);
    const created_at = date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return <div className={styles.card} onClick={() => router.push(`/lesson/${lesson.id}`)}>
        <p className={styles.title}>{lesson.name}</p>
        <p className={styles.createdAt}><i>{created_at}</i></p>
        <p className={styles.description}>{lesson.description.length >= 100 ? lesson.description.slice(0, 98) + '...' : lesson.description}</p>
    </div>
}

export function NewCard() {
    const router = useRouter();
    return <div style={{backgroundColor: '#39db82', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}} className={styles.card} onClick={() => router.push(`/lesson/new`)}>
        <p className={styles.title}>New Lesson</p>
        <FontAwesomeIcon icon={faPlusCircle} size='4x' />
    </div>
}