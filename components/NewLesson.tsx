import { faMicrophone, faMicrophoneSlash, faSpinner, faVolumeHigh, faVolumeMute } from '@fortawesome/free-solid-svg-icons'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

import { useAudioRecorder } from 'react-audio-voice-recorder';

import { useEffect, useState } from 'react'
import translate from '../util/translator'
import { useCookies } from 'react-cookie'
import { speechToTextLanguages, translationLanguages } from '../util/languages'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { createSpeechlySpeechRecognition } from '@speechly/speech-recognition-polyfill';

import styles from '@/styles/NewLesson.module.css'
import { Inter } from 'next/font/google';
import NewLessonNavbar from './NewLessonNavbar';
import { Lesson, saveLesson, saveLessonRecording } from '@/util/lesson';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import Loading from './Loading';

const inter = Inter({ subsets: ['latin'] })

// TODO: figure out how to use env for this to not expose to web
// const appId = process.env.SPEECHLY_APP_ID as string;
const appId = process.env.NEXT_PUBLIC_SPEECHLY_APP_ID as string;
const SpeechlySpeechRecognition = createSpeechlySpeechRecognition(appId);
SpeechRecognition.applyPolyfill(SpeechlySpeechRecognition);

let voices: Map<string, SpeechSynthesisVoice> = new Map();

const convertToDownloadFileExtension = async (
  webmBlob: Blob
) => {
  // const FFmpeg = await import("@ffmpeg/ffmpeg");
  // const ffmpeg = FFmpeg.createFFmpeg({ log: false });
  // await ffmpeg.load();

  // const inputName = "input.webm";

  // ffmpeg.FS(
  //   "writeFile",
  //   inputName,
  //   new Uint8Array(await webmBlob.arrayBuffer())
  // );

  const file = new File([webmBlob], 'lesson.webm');
};

export default function NewLesson() {
    const supabaseClient = useSupabaseClient();
    const user = useUser();
    const [cookies, setCookie, removeCookie] = useCookies(['input-language', 'translation-language']);
    const [saving, setSaving] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [lessonId, setLessonId] = useState('ERROR')

    const {
      transcript,
      interimTranscript,
      finalTranscript,
      listening,
      resetTranscript,
      browserSupportsSpeechRecognition,
      isMicrophoneAvailable,
    } = useSpeechRecognition();
  
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
        SpeechRecognition.removePolyfill();
      }
    }, []);

    const [translationLanguage, setTranslationLanguage] = useState(cookies['translation-language'] ?? 'en');
    const [translated, setTranslated] = useState('');

    const {
      startRecording,
      stopRecording,
      togglePauseResume,
      recordingBlob,
      isRecording,
      isPaused,
      recordingTime,
      mediaRecorder
    } = useAudioRecorder(
      { noiseSuppression: true, echoCancellation: true},
      (exception) => { console.error(exception) }
    );
  
    useEffect(() => {
      if (listening) {
        if (!isRecording) startRecording();
        else if (isPaused) togglePauseResume();
      } else {
        if (!isPaused) togglePauseResume();
      }
      // if (!isRecording) startRecording();
      // else togglePauseResume();
      // else stopRecording();
    }, [listening]);
  
    useEffect(() => {
      if (!recordingBlob) return setSaving(false);
      if (!saving) return;
      async function callback() {
        const { data, error } = await saveLessonRecording(supabaseClient, recordingBlob, lessonId)
        console.log(data, error)
        setSaving(false);
      }
      callback();
      // recordingBlob will be present at this point after 'stopRecording' has been called
      // const url = URL.createObjectURL(recordingBlob);
      // const audio = document.createElement("audio");
      // audio.src = url;
      // audio.controls = true;
      // document.body.appendChild(audio);

    }, [recordingBlob])
  
    // useEffect(() => setInputLanguage(navigator.language), [])
  
    // TODO: check for microphone not available and continous listening not available
    // TODO: recording audio/saving
    if (!browserSupportsSpeechRecognition) {
      console.log("Browser doesn't support speech recognition");
      // TODO: error handling
    }
  
    if (!isMicrophoneAvailable) console.log('microphone not available')
  
    const [captions, setCaptions] = useState(transcript);
  
    const MAX_CAPTIONS_LENGTH = 100;
    useEffect(() => {
      let length = transcript.length;
      let words = transcript.split(' ');
      while (length >= MAX_CAPTIONS_LENGTH && words.length > 0) {
        length -= words.shift()?.length || 0;
        if (length < MAX_CAPTIONS_LENGTH) {
          break;
        }
      }
  
      setCaptions(transcript.slice(transcript.length - length));
    }, [transcript])

    useEffect(() => {
      async function callback() {
        if (!user) return;
        const lesson: Lesson = {
          'name': title,
          'description': description,
          'owner': user.email ?? '',
          'summary': '',
          'transcript': transcript,
          'users': [user.id]
        }
        const { data, error } = await saveLesson(supabaseClient, lesson);
        console.log(data, error)
        setLessonId(data.id)
        stopRecording()
        // setSaving(false);
      }
      if (saving) callback();
    }, [saving])

    return (
    <main className={`${styles.main} ${inter.className}`}>
      <div className="body-container">
        <NewLessonNavbar setSaving={setSaving}/>
        <div>
          <div className={styles.lessonInputs}>
            <input type='text' required placeholder='Title' className={styles.lessonTitle} onChange={e => setTitle(e.target.value)}></input>
            <input type='text' placeholder='Description' className={styles.lessonDescription} onChange={e => setDescription(e.target.value)}></input>
          </div>
          <div className={styles.topContainer}>
            <div className='options-container' style={{ flex: '1' }}>
              <div className="option">
                <p>Select input language: </p>
                <select onChange={e => {
                  setInputLanguage(e.target.value);
                  setCookie('input-language', e.target.value);
                  // @ts-ignore
                  if (e.target.value != 'en-US') SpeechRecognition.removePolyfill();
                  else SpeechRecognition.applyPolyfill(SpeechlySpeechRecognition);
                }}
                  disabled={listening}
                  defaultValue={inputLanguage}
                >
                  {Object.entries(speechToTextLanguages).map(([key, value]) => <option value={value} key={value}>{key}</option>)}
                </select>
                <p>Select translation language: </p>
                <select onChange={e => {
                  setTranslationLanguage(e.target.value);
                  setCookie('translation-language', e.target.value)
                }}
                  disabled={listening}
                  defaultValue={translationLanguage}
                >
                  {Object.entries(translationLanguages).map(([key, value]) => <option value={value} key={value}>{key}</option>)}
                </select>
              </div>
            </div>
            {/* <p className='start-recording-message'>Click here to start recording:</p> */}
            <div className="microphone-container">
              <FontAwesomeIcon
                className='start-recording-button fa-fw'
                icon={listening ? faMicrophone : faMicrophoneSlash}
                color="red"
                size="7x"
                style={{ cursor: 'pointer', flex: '1' }}
                onClick={() => listening ? SpeechRecognition.stopListening() : SpeechRecognition.startListening({ continuous: true, language: inputLanguage })}
              // widths={}
              />
            </div>
            <div className='transcription-container' style={{ flex: '1' }}>
              {/* <p>Microphone: {listening ? 'on' : 'off'}</p> */}
              {/* @ts-ignore */}
              {/* <button onClick={() => SpeechRecognition.startListening({continuous: true})}>Start</button>
              <button onClick={SpeechRecognition.stopListening}>Stop</button> */}
              <button onClick={() => {
                resetTranscript()
                stopRecording()
              }} className='darken-button-hover'>Reset Lesson</button>
              {/* <button onClick={() => null} className='darken-button-hover'>Show Full Transcript</button> */}
              <button onClick={() => {
                translate(inputLanguage, translationLanguage, transcript).then(
                  translated => setTranslated(translated)
                )
              }} className='darken-button-hover'>Translate Text</button>
            </div>
          </div>
          <div className='captions-container'>
            <div>
              <p>Transcript: {transcript}</p> {/* captions? */}
              <span>Play: </span>
              <FontAwesomeIcon
                onClick={() => {
                  const synth = window.speechSynthesis;
                  if (synth.speaking) {
                    synth.cancel();
                    return;
                  }
                  const utterance = new SpeechSynthesisUtterance(transcript);
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
                icon={synth?.speaking ? faVolumeHigh : faVolumeMute}
                color="red"
                size="lg"
                style={{ cursor: 'pointer' }}
              />
            </div>
            <br></br>
            <div>
              <p>Translated: {translated}</p>
              <span>Play: </span>
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
                icon={synth?.speaking ? faVolumeHigh : faVolumeMute}
                color="red"
                size="lg"
                style={{ cursor: 'pointer' }}
              />
            </div>
            <br></br>
            <div>
              <span>Rate: </span>
              <input type="range" min="0.5" max="2" defaultValue="1" step="0.1" id="rate" />
            </div>
            {/* <div>
              <button onClick={stopRecording} className='darken-button-hover'>Stop and save recording: </button>
            </div> */}
            {/* <p>Interim: {interimTranscript}</p> */}
          </div>
        </div>
        <Loading active={saving} />
      </div>
    </main>
  )
}