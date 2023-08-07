import NewLesson from "@/components/NewLesson";
import { config, dom } from "@fortawesome/fontawesome-svg-core";
import Head from "next/head";
import { createGlobalStyle } from "styled-components";

// add fontawesome css

config.autoAddCss = false;
const GlobalStyles = createGlobalStyle`
    ${dom.css()}
`;

export default function Page() {
    return (
        <>
            <GlobalStyles />
            <Head>
                <title>LessonLearned - New Lesson</title>
                <meta name="description" content="Revolutionizing learning in the classroom" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <NewLesson />
        </>
    )
}