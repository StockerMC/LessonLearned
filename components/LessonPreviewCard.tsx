import { LessonData } from "../util/lesson";

export default function LessonPreviewCard(props: {lesson: LessonData}) {
    const lesson = props.lesson;
    return <div>
        <p>{lesson.name}</p>
    </div>
}