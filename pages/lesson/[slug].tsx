import { useRouter } from 'next/router';
import type { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import { LessonData, getAudioById, getLessonById, saveLesson } from '../../util/lesson';
import { User, createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { useEffect, useState } from 'react';
import { userAgentFromString } from 'next/server';
import Head from 'next/head';
import styles from '@/styles/Lesson.module.css'
import { Inter } from 'next/font/google';
import Loading from '@/components/Loading';
import LessonNavbar from '@/components/LessonNavbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVolumeHigh, faVolumeMute } from '@fortawesome/free-solid-svg-icons';
import { useCookies } from 'react-cookie';
import { speechToTextLanguages, translationLanguages } from '@/util/languages';
import { config, dom } from '@fortawesome/fontawesome-svg-core';
import { createGlobalStyle } from 'styled-components';
import { Configuration, OpenAIApi } from 'openai';
import axios from 'axios';
import translate from '@/util/translator';

const inter = Inter({ subsets: ['latin']})

// add fontawesome css

config.autoAddCss = false;
const GlobalStyles = createGlobalStyle`
    ${dom.css()}
`;


export const getServerSideProps: GetServerSideProps<{lesson: LessonData, user: User, audio: string | null}> = async (ctx) => {
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

  const audioResponse = await getAudioById(supabase, slug);
  console.log(audioResponse.data, audioResponse.error)

  return { props: {
    lesson: data as unknown as LessonData,
    user: session.user,
    audio: audioResponse.data ? audioResponse.data.signedUrl : null
  }}
}

let voices: Map<string, SpeechSynthesisVoice> = new Map();

export default function Page({lesson, user, audio}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  // const [loading, setLoading] = useState(false);
  const [summarizedText, setSummarizedText] = useState('Loading...');
  useEffect(() => {
    if (!lesson.transcript) return;
    console.log('loading summary')
    if (lesson.summary) {
      setSummarizedText(lesson.summary);
      return;
    }
    axios.get('/api/summarize', { params: {text: lesson.transcript}})
      .then(async (res) => {
        if (res.status === 200) {
          setSummarizedText(res?.data.summarized || 'ERROR');
          await supabase
            .from('lessons')
            .update({'summary': res?.data.summarized})
            .eq('id', lesson.id);
        } else {
          console.log(res.data, res.status)
        }
      })
      .catch((err) => {
        console.log(err, "An error occured");
      });
  });

  const router = useRouter()
  const supabase = useSupabaseClient();
  // const user = useUser() as User;

  const [saved, setSaved] = useState(lesson.users.includes(user.id));
  const [saving, setSaving] = useState(false);
  // let saving = false;

  const date = new Date(lesson.created_at);
  const created_at = date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const title = `LessonLearned - ${lesson.name}`
  
  const [cookies, setCookie, removeCookie] = useCookies(['input-language', 'translation-language']);
  
  const [synth, setSynth] = useState<SpeechSynthesis>();
  useEffect(() => {
    setSynth(window.speechSynthesis)
    if (!window.speechSynthesis) {
      console.log("Browser doesn't support text to speech")
    } else {
      window.speechSynthesis.getVoices().forEach((voice, i) => {
        if (voices.has(voice.lang)) return;
        voices.set(voice.lang, voice);
      });
    }
  }, [])
  
  const [inputLanguage, setInputLanguage] = useState(cookies['input-language'] ?? 'en-US');
  useEffect(() => {
    if (inputLanguage != 'en-US') {
      console.log(inputLanguage)
      // @ts-ignore
      // SpeechRecognition.removePolyfill();
    }
  }, []);

  const [translationLanguage, setTranslationLanguage] = useState(cookies['translation-language'] ?? 'en');
  const [translated, setTranslated] = useState('');

  translate(inputLanguage, translationLanguage, lesson.transcript).then(
    translated => setTranslated(translated)
  )

  useEffect(() => {
    translate(inputLanguage, translationLanguage, lesson.transcript).then(
      translated => setTranslated(translated)
    )
  }, [translationLanguage])

  return (
      <>
        <GlobalStyles />
        <Head>
            <title>{title}</title>
            <meta name="description" content="Revolutionizing learning in the classroom" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link rel="icon" href="/favicon.ico" />
        </Head>
        <main className={`${styles.main} ${inter.className}`}>
          <LessonNavbar setSaving={setSaving} saving={saving} user={user} lesson={lesson} />
          <div style={{position: 'relative', top: '-73px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
            {/* <p>Lesson Name {lesson.name}, lesson id {lesson.id}</p> */}
            <div style={{fontSize: '140%'}}>
              <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', width: '100%'}}>
                <h1 className={styles.title}>{lesson.name}</h1>
              </div>
              <p className={styles.createdAt}>{created_at}</p>
              <p className={styles.description}><b>Description: </b>{lesson.description}</p>
            </div>
            <hr style={{width: '100%', marginTop: '2em'}}></hr>
            <div style={{marginTop: '1rem', display: 'flex', flexDirection: 'row', columnGap: '1em', justifyContent: 'center', alignItems: 'center'}}>
              <h2>Original Audio:</h2>
              {audio ? <audio src={audio} controls></audio> : <span>Not Available</span>}
            </div>
            <hr style={{width: '100%', marginTop: '1em'}}></hr>
            <div style={{marginTop: '2rem'}}>
              
            <div>
              <div>
                <h3>Transcript Play Speed: <input style={{position: 'relative', top: '2px'}}  type="range" min="0.5" max="2" defaultValue="1" step="0.1" id="rate" /></h3>
                <div style={{marginTop: '1em', display: 'flex', justifyContent: 'center', alignItems: 'center', columnGap: '.7em'}}>
                  <h3>Translation Language: </h3>
                  <select onChange={e => {
                    setTranslationLanguage(e.target.value);
                    setCookie('translation-language', e.target.value)
                  }}
                    defaultValue={translationLanguage}
                  >
                    {Object.entries(translationLanguages).map(([key, value]) => <option value={value} key={value}>{key}</option>)}
                  </select>
                </div>
              </div>
                <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1em', marginTop: '2em'}}>
                  <h2>Original Transcript:</h2>
                  <FontAwesomeIcon
                  onClick={() => {
                    const synth = window.speechSynthesis;
                    if (synth.speaking) {
                      synth.cancel();
                      return;
                    }
                    const utterance = new SpeechSynthesisUtterance(lesson.transcript);
                    let voice = voices.get(inputLanguage);
                    if (!voice) {
                      for (const value of Object.values(speechToTextLanguages)) {
                        if (value.startsWith(translationLanguage)) {
                          voice = voices.get(value);
                          break;
                        }
                      }

                      if (!voice) voice = voices.get('en-US') as SpeechSynthesisVoice;
                    }

                    utterance.voice = voice;
                    const rate = document.getElementById('rate') as any | undefined;
                    if (rate) utterance.rate = rate.value;
                    synth.speak(utterance)
                  }}
                  className='play-sound-button fa-fw'
                  icon={true ? faVolumeHigh : faVolumeMute}
                  color="red"
                  size="lg"
                  style={{ cursor: 'pointer' }}
                />
                </div>
                <p style={{marginTop: '0.6em', fontSize: '120%'}}>{lesson.transcript}</p> {/* captions? */}
              </div>
              <div style={{marginTop: '3em'}}>
                <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1em'}}>
                  <h2>Translated Transcript:</h2>
                <FontAwesomeIcon
                  onClick={() => {
                    const synth = window.speechSynthesis;
                    if (synth.speaking) {
                      synth.cancel();
                      return;
                    }
                    const utterance = new SpeechSynthesisUtterance(translated);
                    let voice = voices.get(translationLanguage);
                    if (!voice) {
                      for (const value of Object.values(speechToTextLanguages)) {
                        if (value.startsWith(translationLanguage)) {
                          voice = voices.get(value);
                          break;
                        }
                      }
                      
                      if (!voice) voice = voices.get('en-US') as SpeechSynthesisVoice;
                    }
                    utterance.voice = voice;
                    const rate = document.getElementById('rate') as any | undefined;
                    if (rate) utterance.rate = rate.value;
                    synth.speak(utterance)
                  }}
                  className='play-sound-button fa-fw'
                  icon={true ? faVolumeHigh : faVolumeMute}
                  color="red"
                  size="lg"
                  style={{ cursor: 'pointer' }}
                />
                </div>
                <p style={{marginTop: '0.6em', fontSize: '120%'}}>{translated}</p> {/* captions? */}
              </div>
              {/* <div>
                <button onClick={stopRecording} className='darken-button-hover'>Stop and save recording: </button>
              </div> */}
              {/* <p>Interim: {interimTranscript}</p> */}
              {/* <h2>Transcript:</h2>
              <p style={{marginTop: '1em'}}>{lesson.transcript}</p> */}
              <div style={{marginTop: '3em'}}>
                <h1>Summarized:</h1>
                <p style={{ fontSize: '120%', marginTop: '0.6em'}}>{summarizedText}</p>
              </div>
            </div>
            <Loading active={saving} />
          </div>
        </main>
      </>
  )
}
