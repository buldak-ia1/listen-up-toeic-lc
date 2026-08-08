import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import {
  Activity, ArrowLeft, ArrowRight, BarChart3, BookOpen, Bookmark, Check,
  CheckCircle2, ChevronDown, ChevronRight, CircleAlert, Clock3, Flame,
  Gauge, Headphones, Home, Lightbulb, ListChecks, Lock, Menu, MessageSquareText,
  Mic2, NotebookTabs, Pause, Play, RotateCcw, Settings, Shuffle, SkipBack,
  Sparkles, Star, Target, Timer, Trophy, Volume2, Waves, X, Zap, Eye, EyeOff,
  Repeat2, Flag, FileText, TrendingUp,
} from 'lucide-react'
import { initialWrongNotes, lcQuestions, partMeta, testMeta, weeklyData } from './data'

const LETTERS = ['A', 'B', 'C', 'D']

const defaultConfig = {
  test: 'all',
  part: 1,
  count: 6,
  difficulty: '전체',
  feedback: 'instant',
  speed: 1,
  repeat: 3,
  script: 'after',
  type: '전체 유형',
  shuffle: true,
  autoNext: true,
  targetScore: 495,
}

function shuffleQuestions(items) {
  const shuffled = [...items]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }
  return shuffled
}

function useStoredState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : initialValue
    } catch {
      return initialValue
    }
  })
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])
  return [value, setValue]
}

function Logo({ compact = false }) {
  return (
    <div className={`logo ${compact ? 'compact' : ''}`}>
      <div className="logo-mark"><Waves size={21} strokeWidth={2.5} /></div>
      {!compact && <div><strong>ListenUp</strong><span>TOEIC LC LAB</span></div>}
    </div>
  )
}

const navItems = [
  { id: 'home', label: '홈', icon: Home },
  { id: 'practice', label: '문제 풀기', icon: Headphones },
  { id: 'notes', label: '오답 노트', icon: NotebookTabs, badge: 4 },
  { id: 'review', label: '리스닝 랩', icon: Mic2 },
  { id: 'stats', label: '학습 통계', icon: BarChart3 },
]

function Sidebar({ page, onNavigate, open, onClose }) {
  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-head">
        <Logo />
        <button className="icon-button mobile-only" onClick={onClose} aria-label="메뉴 닫기"><X size={20} /></button>
      </div>
      <nav>
        <p className="nav-caption">LEARN</p>
        {navItems.map(({ id, label, icon: Icon, badge }) => (
          <button key={id} className={`nav-item ${page === id ? 'active' : ''}`} onClick={() => { onNavigate(id); onClose() }}>
            <Icon size={19} />
            <span>{label}</span>
            {badge && <em>{badge}</em>}
          </button>
        ))}
      </nav>
      <div className="sidebar-streak">
        <div className="streak-icon"><Flame size={20} fill="currentColor" /></div>
        <div><strong>7일 연속 학습 중</strong><span>오늘 12분만 더 들으면 달성!</span></div>
      </div>
      <button className="profile-card" onClick={() => onNavigate('settings')}>
        <span className="avatar">JS</span>
        <span><strong>재승님</strong><small>목표 495점</small></span>
        <Settings size={17} />
      </button>
    </aside>
  )
}

function Header({ title, onMenu, onNavigate }) {
  return (
    <header className="app-header">
      <button className="icon-button mobile-only" onClick={onMenu} aria-label="메뉴 열기"><Menu size={21} /></button>
      <div>
        <p className="eyebrow">SATURDAY · AUG 1</p>
        <h1>{title}</h1>
      </div>
      <div className="header-actions">
        <div className="today-chip"><Target size={17} /><span>오늘 목표</span><strong>28 / 40분</strong></div>
        <button className="icon-button" onClick={() => onNavigate('settings')} aria-label="설정"><Settings size={20} /></button>
      </div>
    </header>
  )
}

function Ring({ value, label, color = '#ff6b35', size = 78 }) {
  const style = { '--value': `${value * 3.6}deg`, '--ring-color': color, width: size, height: size }
  return <div className="ring" style={style}><strong>{value}%</strong>{label && <span>{label}</span>}</div>
}

function HomeScreen({ startPractice, onNavigate, setConfig }) {
  const [selectedPart, setSelectedPart] = useState(2)
  const activePart = partMeta.find((item) => item.part === selectedPart)

  return (
    <div className="screen home-screen">
      <section className="hero-grid">
        <div className="hero-card">
          <div className="hero-copy">
            <span className="pill dark"><Sparkles size={14} /> 오늘의 추천</span>
            <h2>간접 응답,<br /><em>소리에 속지 않는 법.</em></h2>
            <p>지난 학습에서 Part 2 간접 응답을 3번 놓쳤어요. 정답 근거가 들리는 순간만 모아 연습해요.</p>
            <button className="primary-button light" onClick={() => startPractice({ part: 2, count: 10 })}>
              10문제 바로 풀기 <ArrowRight size={18} />
            </button>
          </div>
          <div className="hero-visual" aria-hidden="true">
            <div className="sound-orbit orbit-one" />
            <div className="sound-orbit orbit-two" />
            <div className="headphone-disc"><Headphones size={54} strokeWidth={1.7} /></div>
            <div className="floating-score"><span>이번 주</span><strong>+14%</strong></div>
          </div>
        </div>

        <div className="goal-card">
          <div className="card-title-row"><div><span className="section-kicker">WEEKLY GOAL</span><h3>이번 주 리듬</h3></div><button className="text-button" onClick={() => onNavigate('stats')}>자세히 <ChevronRight size={15} /></button></div>
          <div className="goal-main"><Ring value={72} label="완료" color="#2e7d6f" size={118} /><div><strong>214<small> / 300분</small></strong><p>이번 주 5일 학습했어요.<br />86분 남았습니다.</p></div></div>
          <div className="week-dots">{['월', '화', '수', '목', '금', '토', '일'].map((day, i) => <div key={day} className={i < 6 ? 'done' : ''}><span>{i < 6 ? <Check size={13} /> : ''}</span><small>{day}</small></div>)}</div>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div><span className="section-kicker">FOCUS PRACTICE</span><h2>파트를 골라 집중해요</h2></div>
          <button className="outline-button" onClick={() => startPractice({ random: true, count: 20 })}><Shuffle size={17} /> 유형별 랜덤</button>
        </div>
        <div className="part-grid">
          {partMeta.map((item) => (
            <button key={item.part} className={`part-card ${selectedPart === item.part ? 'selected' : ''}`} onClick={() => setSelectedPart(item.part)} style={{ '--accent': item.accent }}>
              <div className="part-top"><span className="part-number">0{item.part}</span><span className="question-count">{item.count}문제</span></div>
              <h3>Part {item.part}</h3><h4>{item.title}</h4><p>{item.description}</p>
              <div className="tag-row">{item.types.map((type) => <span key={type}>{type}</span>)}</div>
              <span className="part-arrow"><ArrowRight size={19} /></span>
            </button>
          ))}
        </div>
        <div className="quick-config">
          <div><span className="quick-icon" style={{ background: activePart.accent }}><Headphones size={19} /></span><div><strong>Part {activePart.part} · {activePart.title}</strong><small>{activePart.types.join(' · ')}</small></div></div>
          <div className="config-chips">
            <button onClick={() => setConfig((c) => ({ ...c, count: c.count === 10 ? 20 : 10 }))}>10문제 <ChevronDown size={14} /></button>
            <button onClick={() => setConfig((c) => ({ ...c, difficulty: c.difficulty === '전체' ? '중' : '전체' }))}>난이도 전체 <ChevronDown size={14} /></button>
            <button onClick={() => setConfig((c) => ({ ...c, feedback: c.feedback === 'instant' ? 'end' : 'instant' }))}><Zap size={14} /> 즉시 피드백</button>
          </div>
          <button className="primary-button" onClick={() => startPractice({ part: selectedPart, count: 10 })}>학습 시작 <ArrowRight size={17} /></button>
        </div>
      </section>

      <section className="bottom-grid">
        <div className="mock-card">
          <div className="mock-icon"><Timer size={25} /></div>
          <div><span className="section-kicker">REAL TEST</span><h3>45분, 100문제. 실전처럼.</h3><p>정지·되감기 없이 실제 시험 흐름으로 진행됩니다.</p></div>
          <div className="mock-parts"><span>P1 <b>6</b></span><span>P2 <b>25</b></span><span>P3 <b>39</b></span><span>P4 <b>30</b></span></div>
          <button className="primary-button dark" onClick={() => startPractice({ exam: true })}>모의고사 시작 <ArrowRight size={17} /></button>
        </div>
        <div className="weak-card">
          <div className="card-title-row"><div><span className="section-kicker">WEAK POINT</span><h3>이번 주 취약 신호</h3></div><button className="text-button" onClick={() => onNavigate('notes')}>오답 노트 <ChevronRight size={15} /></button></div>
          <div className="weak-row"><span className="weak-rank">1</span><div><strong>간접 응답</strong><small>정답률 58% · 12문제</small></div><div className="mini-bar"><i style={{ width: '58%' }} /></div><em>58%</em></div>
          <div className="weak-row"><span className="weak-rank">2</span><div><strong>다음 행동 예측</strong><small>정답률 64% · 8문제</small></div><div className="mini-bar"><i style={{ width: '64%' }} /></div><em>64%</em></div>
          <div className="coach-tip"><Lightbulb size={18} /><p><strong>코치 팁</strong> 질문 끝부분보다 응답의 첫 3단어에 집중해 보세요.</p></div>
        </div>
      </section>
    </div>
  )
}

function PracticeLanding({ startPractice, config, setConfig }) {
  const selectedMeta = partMeta.find((item) => item.part === config.part) || partMeta[0]
  const selectedTest = config.test ?? 'all'
  const availableTypes = ['전체 유형', ...Array.from(new Set(lcQuestions.filter((question) => question.part === config.part && (selectedTest === 'all' || question.test === Number(selectedTest))).map((question) => question.type)))]
  return (
    <div className="screen practice-landing">
      <section className="page-intro"><span className="section-kicker">CHOOSE YOUR SESSION</span><h2>오늘은 어떻게 들을까요?</h2><p>목표에 맞는 학습 방식을 고르면 나머지는 ListenUp이 준비해요.</p></section>
      <div className="mode-grid">
        <button className="mode-card featured" onClick={() => startPractice({ part: config.part, count: config.count })}>
          <div className="mode-icon"><Target size={25} /></div><span>집중 학습</span><h3>파트별로 깊게</h3><p>재생 속도와 스크립트를 자유롭게 조절하며 정답 근거까지 확인합니다.</p><em>추천</em><ArrowRight size={20} />
        </button>
        <button className="mode-card" onClick={() => startPractice({ random: true, count: 20 })}>
          <div className="mode-icon mint"><Shuffle size={25} /></div><span>랜덤 학습</span><h3>취약 유형 섞어서</h3><p>최근에 틀린 유형을 우선으로 중복 없이 20문제를 출제합니다.</p><ArrowRight size={20} />
        </button>
        <button className="mode-card" onClick={() => startPractice({ exam: true })}>
          <div className="mode-icon ink"><Clock3 size={25} /></div><span>실전 모드</span><h3>45분, 100문제</h3><p>한 번만 재생되는 실제 시험의 속도와 전환에 적응합니다.</p><ArrowRight size={20} />
        </button>
      </div>
      <section className="setup-panel">
        <div className="setup-copy"><span className="section-kicker">QUICK SETUP</span><h3>세션 설정</h3><p>선택한 설정은 다음 학습에도 기억됩니다.</p></div>
        <div className="setup-controls">
          <label>문제 세트<select value={selectedTest} onChange={(e) => setConfig({ ...config, test: e.target.value === 'all' ? 'all' : Number(e.target.value), type: '전체 유형' })}><option value="all">전체 TEST 1–10</option>{testMeta.map((item) => <option key={item.test} value={item.test}>{item.title}</option>)}</select></label>
          <label>파트<select value={config.part} onChange={(e) => setConfig({ ...config, part: Number(e.target.value), type: '전체 유형' })}>{partMeta.map((p) => <option key={p.part} value={p.part}>Part {p.part} · {p.title}</option>)}</select></label>
          <label>문제 수<select value={config.count} onChange={(e) => setConfig({ ...config, count: Number(e.target.value) })}>{[6, 10, 20, 25, 30, 39].filter((count) => count <= selectedMeta.count || count === 10).map((count) => <option key={count}>{count}</option>)}</select></label>
          <label>난이도<select value={config.difficulty} onChange={(e) => setConfig({ ...config, difficulty: e.target.value })}><option>전체</option><option>하</option><option>중</option><option>상</option></select></label>
          <label>채점<select value={config.feedback} onChange={(e) => setConfig({ ...config, feedback: e.target.value })}><option value="instant">즉시 피드백</option><option value="end">종료 후 채점</option></select></label>
        </div>
        <div className="type-picker"><span>세부 유형</span><div>{availableTypes.map((type) => <button key={type} className={config.type === type ? 'active' : ''} onClick={() => setConfig({ ...config, type })}>{type}</button>)}</div></div>
        <div className="advanced-setup"><label><Repeat2 size={15} /><span>재생 횟수</span><select value={config.repeat} onChange={(event) => setConfig({ ...config, repeat: Number(event.target.value) })}><option value="1">1회</option><option value="2">2회</option><option value="3">3회</option><option value="99">무제한</option></select></label><label><Eye size={15} /><span>스크립트</span><select value={config.script} onChange={(event) => setConfig({ ...config, script: event.target.value })}><option value="after">답한 뒤 공개</option><option value="always">항상 표시</option><option value="never">항상 숨김</option></select></label><label><Shuffle size={15} /><span>문제 순서</span><select aria-label="문제 순서" value={config.shuffle === false ? 'ordered' : 'random'} onChange={(event) => setConfig({ ...config, shuffle: event.target.value === 'random' })}><option value="random">랜덤으로 섞기</option><option value="ordered">기본 순서</option></select></label><label><Zap size={15} /><span>채점 방식</span><strong>{config.feedback === 'instant' ? '즉시 피드백' : '종료 후 채점'}</strong></label></div>
        <button className="primary-button" onClick={() => startPractice({ part: config.part, count: config.count })}>이 설정으로 시작 <ArrowRight size={17} /></button>
      </section>
    </div>
  )
}

const AudioPlayer = forwardRef(function AudioPlayer({ src, speed, setSpeed, locked, onEnded, onPlayStat, maxPlays = Infinity, evidenceMode = false }, ref) {
  const audioRef = useRef(null)
  const segmentEndRef = useRef(null)
  const autoStartedRef = useRef(false)
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playCount, setPlayCount] = useState(0)

  useEffect(() => {
    setPlaying(false); setCurrent(0); setDuration(0); setPlayCount(0); segmentEndRef.current = null; autoStartedRef.current = false
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.load() }
  }, [src])

  useEffect(() => { if (audioRef.current) audioRef.current.playbackRate = speed }, [speed])

  const beginPlay = () => {
    setPlayCount((count) => count + 1)
    onPlayStat?.()
  }
  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused && playCount < maxPlays) { segmentEndRef.current = null; audio.play().then(() => { setPlaying(true); if (!locked) beginPlay() }).catch(() => {}) }
    else if (!locked) { audio.pause(); setPlaying(false) }
  }
  const restart = () => {
    if (locked || !audioRef.current || playCount >= maxPlays) return
    audioRef.current.currentTime = 0
    segmentEndRef.current = null
    audioRef.current.play(); setPlaying(true); beginPlay()
  }
  const playSegment = (startRatio = .45, endRatio = .72) => {
    const audio = audioRef.current
    if (!audio || !duration || locked) return
    audio.currentTime = duration * startRatio
    segmentEndRef.current = duration * endRatio
    audio.play(); setPlaying(true); beginPlay()
  }
  const seekRatio = (ratio) => {
    if (locked || !audioRef.current || !duration) return
    audioRef.current.currentTime = Math.max(0, Math.min(duration, duration * ratio))
  }
  useImperativeHandle(ref, () => ({ playSegment, seekRatio, getStats: () => ({ current, duration, playCount }) }), [current, duration, playCount, locked])
  const format = (value) => `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, '0')}`
  const handleTime = (event) => {
    const value = event.currentTarget.currentTime
    setCurrent(value)
    if (segmentEndRef.current && value >= segmentEndRef.current) {
      event.currentTarget.pause()
      segmentEndRef.current = null
    }
  }
  const handlePlay = () => {
    setPlaying(true)
    if (locked && !autoStartedRef.current) {
      autoStartedRef.current = true
      beginPlay()
    }
  }

  return (
    <div className={`audio-player ${locked ? 'locked' : ''} ${evidenceMode ? 'evidence' : ''}`}>
      <audio ref={audioRef} src={src} preload="metadata" autoPlay={locked} onPlay={handlePlay} onPause={() => setPlaying(false)} onTimeUpdate={handleTime} onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)} onEnded={() => { setPlaying(false); onEnded?.() }} />
      <button className="player-main" onClick={toggle} aria-label={playing ? '일시 정지' : '재생'}>{playing ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}</button>
      <div className="player-track">
        <div className="waveform" aria-hidden="true" onClick={(event) => seekRatio(event.nativeEvent.offsetX / event.currentTarget.clientWidth)}>{Array.from({ length: 42 }, (_, i) => <i key={i} className={(i / 42) <= (current / (duration || 1)) ? 'played' : ''} style={{ height: `${18 + ((i * 17) % 28)}%` }} />)}</div>
        <div className="player-meta"><span>{format(current)}</span><strong>{locked ? <><Lock size={12} /> 실전 1회 재생</> : evidenceMode ? '정답 근거 구간' : <>{playCount}/{maxPlays === Infinity ? '∞' : maxPlays}회 재생</>}</strong><span>{format(duration)}</span></div>
      </div>
      {!locked && <button className="small-control" onClick={restart} disabled={playCount >= maxPlays} title="처음부터"><RotateCcw size={17} /></button>}
      {!locked && <button className="speed-button" onClick={() => { const speeds = [.75, .9, 1, 1.1, 1.25]; setSpeed(speeds[(speeds.indexOf(speed) + 1) % speeds.length]) }}>{speed}×</button>}
    </div>
  )
})

function VisualMaterial({ visual }) {
  if (!visual) return null
  return (
    <section className={`visual-material ${visual.kind}`}>
      <div className="visual-title"><FileText size={15} /><strong>{visual.title}</strong></div>
      {visual.kind === 'bars' ? <div className="visual-bars">{visual.rows.map(([label, value]) => <div key={label}><span>{label}</span><i><b style={{ width: `${Number(value) / 4.1}%` }} /></i><em>{value} g/t</em></div>)}</div>
        : visual.kind === 'map' ? <div className="visual-map">{visual.rows.map(([label, value], index) => <div key={label} className={`map-zone z${index + 1}`}><span>{label}</span><small>{value}</small></div>)}</div>
          : <div className="visual-table">{visual.rows.map(([label, value]) => <div key={label}><strong>{label}</strong><span>{value}</span></div>)}</div>}
    </section>
  )
}

function TranscriptPanel({ question, onSentencePlay, hidden = false }) {
  const [saved, setSaved] = useState([])
  if (hidden) return <div className="script-locked"><EyeOff size={20} /><strong>스크립트 숨김</strong><span>답을 선택한 뒤 공개됩니다.</span></div>
  return (
    <section className="transcript-panel">
      <div className="transcript-head"><div><span className="section-kicker">FULL SCRIPT</span><h3>문장별 스크립트</h3></div><span><Eye size={15} /> 정답 근거 강조</span></div>
      <div className="transcript-body">{question.transcript?.map(([speaker, line], index) => {
        const isEvidence = index === question.evidenceLine || line.toLowerCase().includes(String(question.evidence).toLowerCase())
        return <button key={`${speaker}-${index}`} className={isEvidence ? 'evidence-line' : ''} onClick={() => onSentencePlay(index, question.transcript.length)}><span className={`speaker speaker-${speaker}`}>{speaker}</span><p>{line}</p><Play size={14} /></button>
      })}</div>
      <div className="expression-bank"><span>놓친 표현 저장</span>{question.keywords?.map((word) => <button key={word} className={saved.includes(word) ? 'saved' : ''} onClick={() => setSaved((items) => items.includes(word) ? items.filter((item) => item !== word) : [...items, word])}>{saved.includes(word) ? <Check size={12} /> : '+'} {word}</button>)}</div>
    </section>
  )
}

function FeedbackPanel({ question, selected, onSave, saved, onEvidence, cause, onCauseChange }) {
  const correct = selected === question.answer
  const causes = ['정답 근거를 놓침', '단어를 모름', '발음을 알아듣지 못함', '질문 의도를 잘못 이해함', '선택지의 함정에 속음', '패러프레이징을 이해하지 못함', '집중력이 떨어짐']
  return (
    <section className={`feedback-panel ${correct ? 'correct' : 'wrong'}`}>
      <div className="feedback-head">
        <span className="feedback-icon">{correct ? <CheckCircle2 size={26} /> : <CircleAlert size={26} />}</span>
        <div><span>{correct ? 'NICE LISTENING!' : 'ALMOST THERE'}</span><h3>{correct ? '정답이에요. 소리의 핵심을 잡았어요!' : `정답은 ${question.answer}예요. 함정을 같이 볼까요?`}</h3></div>
        <button className={`save-button ${saved ? 'saved' : ''}`} onClick={onSave}><Bookmark size={18} fill={saved ? 'currentColor' : 'none'} />{saved ? '저장됨' : '오답 노트'}</button>
      </div>
      <div className="evidence-box"><div><span><Volume2 size={16} /> 정답 근거</span><p>“{question.evidence}”</p></div><button onClick={onEvidence}><Repeat2 size={15} /> 근거 구간 듣기</button></div>
      <div className="feedback-columns"><div><span>왜 정답인가요?</span><p>{question.explanation}</p></div><div><span>함정 포인트</span><p>{question.trap}</p></div></div>
      {!correct && <label className="cause-select"><span>내가 틀린 이유</span><select value={cause} onChange={(event) => onCauseChange(event.target.value)}>{causes.map((item) => <option key={item}>{item}</option>)}</select></label>}
      <div className="keyword-row">{question.keywords?.map((word) => <span key={word}># {word}</span>)}</div>
    </section>
  )
}

function PracticeScreenLegacy({ session, config, savedNotes, setSavedNotes, onExit, onFinish }) {
  const { questions, exam } = session
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [checked, setChecked] = useState(false)
  const [speed, setSpeed] = useState(exam ? 1 : config.speed)
  const [startTime] = useState(Date.now())
  const question = questions[index]
  const selected = answers[question.id]
  const showFeedback = !exam && config.feedback === 'instant' && checked

  useEffect(() => { setChecked(false) }, [index])

  const choose = (letter) => {
    if (showFeedback) return
    setAnswers((prev) => ({ ...prev, [question.id]: letter }))
    if (!exam && config.feedback === 'instant') setChecked(true)
  }
  const next = () => {
    if (index === questions.length - 1) {
      onFinish({ answers, questions, elapsed: Math.round((Date.now() - startTime) / 1000), exam })
    } else setIndex((i) => i + 1)
  }
  const previous = () => { if (!exam && index > 0) setIndex((i) => i - 1) }
  const toggleSave = () => {
    setSavedNotes((items) => items.some((item) => item.id === question.id) ? items.filter((item) => item.id !== question.id) : [...items, { id: question.id, cause: selected === question.answer ? '정답 근거 복습' : '정답 근거를 놓침', review: 0, due: '오늘', status: 'urgent' }])
  }
  const hiddenScripts = question.part <= 2 && !showFeedback

  return (
    <div className={`practice-shell ${exam ? 'exam' : ''}`}>
      <header className="practice-header">
        <button className="back-button" onClick={onExit}><ArrowLeft size={19} /><span>{exam ? '시험 종료' : '학습 나가기'}</span></button>
        <div className="practice-progress">
          <div><span>{exam ? `ETS VOL.5 · TEST ${question.test}` : `TEST ${question.test} · ${question.label} · ${question.type}`}</span><strong>{index + 1} / {questions.length}</strong></div>
          <div className="progress-line"><i style={{ width: `${((index + 1) / questions.length) * 100}%` }} /></div>
        </div>
        <div className="practice-status">{exam ? <><Timer size={18} /><strong>44:18</strong></> : <><Volume2 size={18} /><span>{speed}×</span></>}</div>
      </header>
      <main className="question-stage">
        <div className="question-meta"><span className="part-pill">PART {question.part}</span><span>Question {question.id}</span><span>난이도 {question.difficulty}</span>{!exam && <span className="learn-mode"><Sparkles size={13} /> 학습 모드</span>}</div>
        <div className={`question-layout part-${question.part}`}>
          {question.image && <div className="photo-frame"><img src={question.image} alt={`TOEIC Part 1 question ${question.id}`} /><span>Q{question.id}</span></div>}
          <div className="question-workspace">
            {question.part === 2 ? <div className="audio-prompt"><Headphones size={42} /><h2>질문과 응답을 잘 들어보세요.</h2><p>스크립트는 답을 선택한 뒤 확인할 수 있어요.</p></div> : !question.image && <div className="printed-question"><span>Q{question.id}</span><h2>{question.prompt}</h2></div>}
            <AudioPlayer src={question.audio} speed={speed} setSpeed={setSpeed} locked={exam} />
            <div className={`answer-list ${hiddenScripts ? 'letters-only' : ''}`}>
              {question.options.slice(0, question.optionCount).map((option, optionIndex) => {
                const letter = LETTERS[optionIndex]
                const isSelected = selected === letter
                const isAnswer = showFeedback && question.answer === letter
                const isWrong = showFeedback && isSelected && !isAnswer
                return <button key={letter} className={`${isSelected ? 'selected' : ''} ${isAnswer ? 'is-answer' : ''} ${isWrong ? 'is-wrong' : ''}`} onClick={() => choose(letter)}><span>{letter}</span><p>{hiddenScripts ? `선택지 ${letter}` : option}</p>{isAnswer && <CheckCircle2 size={20} />}{isWrong && <X size={20} />}</button>
              })}
            </div>
            {showFeedback && <FeedbackPanel question={question} selected={selected} onSave={toggleSave} saved={savedNotes.some((item) => item.id === question.id)} />}
          </div>
        </div>
      </main>
      <footer className="practice-footer">
        <button className="outline-button" disabled={index === 0 || exam} onClick={previous}><ArrowLeft size={17} /> 이전</button>
        <div className="question-dots">{questions.slice(Math.max(0, index - 3), Math.min(questions.length, index + 4)).map((item) => <span key={item.id} className={`${item.id === question.id ? 'current' : ''} ${answers[item.id] ? 'answered' : ''}`}>{item.id}</span>)}</div>
        <button className="primary-button" onClick={next}>{index === questions.length - 1 ? '결과 보기' : '다음 문제'} <ArrowRight size={17} /></button>
      </footer>
    </div>
  )
}

function PracticeScreen({ session, config, savedNotes, setSavedNotes, onExit, onFinish }) {
  const { questions, exam } = session
  const audioRef = useRef(null)
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [answerMeta, setAnswerMeta] = useState({})
  const [checked, setChecked] = useState(false)
  const [speed, setSpeed] = useState(exam ? 1 : config.speed)
  const [remaining, setRemaining] = useState(45 * 60)
  const [questionStarted, setQuestionStarted] = useState(Date.now())
  const [causes, setCauses] = useState({})
  const [flagged, setFlagged] = useState([])
  const [startTime] = useState(Date.now())
  const question = questions[index]
  const selected = answers[question.id]
  const showFeedback = !exam && config.feedback === 'instant' && checked
  const scriptVisible = !exam && config.script !== 'never' && (config.script === 'always' || showFeedback)
  const hiddenScripts = question.part <= 2 && !scriptVisible

  useEffect(() => {
    setChecked(false)
    setQuestionStarted(Date.now())
  }, [index])

  useEffect(() => {
    if (!exam) return undefined
    const timer = window.setInterval(() => setRemaining((value) => Math.max(0, value - 1)), 1000)
    return () => window.clearInterval(timer)
  }, [exam])

  useEffect(() => {
    if (exam && remaining === 0) finishSession(answerMeta, 'time')
  }, [remaining])

  const markAudioPlay = () => {
    setAnswerMeta((items) => {
      const current = items[question.id] || {}
      return { ...items, [question.id]: { ...current, listened: true, replayCount: (current.replayCount || 0) + 1 } }
    })
  }

  const choose = (letter) => {
    if (showFeedback) return
    const previous = answers[question.id]
    setAnswers((items) => ({ ...items, [question.id]: letter }))
    setAnswerMeta((items) => {
      const current = items[question.id] || {}
      return { ...items, [question.id]: { ...current, selected: letter, changes: (current.changes || 0) + (previous && previous !== letter ? 1 : 0), firstAnsweredAt: current.firstAnsweredAt || Date.now() } }
    })
    if (!exam && config.feedback === 'instant') setChecked(true)
  }

  const captureDuration = () => {
    const duration = Math.max(1, Math.round((Date.now() - questionStarted) / 1000))
    const current = answerMeta[question.id] || {}
    const merged = { ...answerMeta, [question.id]: { ...current, duration: (current.duration || 0) + duration, selected: answers[question.id] || null, missed: !current.listened, unanswered: !answers[question.id] } }
    setAnswerMeta(merged)
    return merged
  }

  const finishSession = (meta = answerMeta, reason = 'complete') => {
    onFinish({ answers, answerMeta: meta, questions, elapsed: Math.round((Date.now() - startTime) / 1000), exam, flagged, reason })
  }

  const next = () => {
    const merged = captureDuration()
    if (index === questions.length - 1) finishSession(merged)
    else setIndex((value) => value + 1)
  }

  const previous = () => {
    if (exam || index === 0) return
    captureDuration()
    setIndex((value) => value - 1)
  }

  const toggleSave = () => {
    const cause = causes[question.id] || (selected === question.answer ? '정답 근거 복습' : '정답 근거를 놓침')
    setSavedNotes((items) => items.some((item) => item.id === question.id)
      ? items.map((item) => item.id === question.id ? { ...item, cause } : item)
      : [...items, { id: question.id, cause, review: 0, due: '오늘', status: 'urgent', lastReviewed: new Date().toISOString() }])
  }

  const playSentence = (sentenceIndex, length) => {
    const start = Math.max(0, sentenceIndex / Math.max(1, length))
    audioRef.current?.playSegment(start, Math.min(1, start + 1 / Math.max(1, length)))
  }

  const formatClock = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`

  return (
    <div className={`practice-shell ${exam ? 'exam' : ''}`}>
      <header className="practice-header">
        <button className="back-button" onClick={onExit}><ArrowLeft size={19} /><span>{exam ? '시험 종료' : '학습 나가기'}</span></button>
        <div className="practice-progress">
          <div><span>{exam ? `ETS VOL.5 · TEST ${question.test}` : `${question.label} · ${question.type}`}</span><strong>{index + 1} / {questions.length}</strong></div>
          <div className="progress-line"><i style={{ width: `${((index + 1) / questions.length) * 100}%` }} /></div>
        </div>
        <div className={`practice-status ${exam && remaining < 300 ? 'danger' : ''}`}>{exam ? <><Timer size={18} /><strong>{formatClock(remaining)}</strong></> : <><Volume2 size={18} /><span>{speed}×</span></>}</div>
      </header>
      <main className="question-stage">
        <div className="question-meta"><span className="part-pill">PART {question.part}</span><span>TEST {question.test} · Question {question.number}</span><span>난이도 {question.difficulty}</span>{!exam && <span className="learn-mode">{session.randomized ? <Shuffle size={13} /> : <ListChecks size={13} />} {session.randomized ? '랜덤 순서' : '기본 순서'}</span>}<button className={`flag-button ${flagged.includes(question.id) ? 'active' : ''}`} onClick={() => setFlagged((items) => items.includes(question.id) ? items.filter((id) => id !== question.id) : [...items, question.id])}><Flag size={14} fill={flagged.includes(question.id) ? 'currentColor' : 'none'} /> 검토</button></div>
        <div className={`question-layout part-${question.part}`}>
          {(question.image || question.visual || question.graphic) && <div>{question.image && <div className="photo-frame"><img src={question.image} alt={`TOEIC Part 1 Test ${question.test} question ${question.number}`} /><span>T{question.test} · Q{question.number}</span></div>}{question.graphic && <div className="visual-graphic"><div><FileText size={15} /><strong>TEST {question.test} · 시각 자료</strong></div><img src={question.graphic} alt={`TEST ${question.test} question ${question.number} graphic`} /></div>}<VisualMaterial visual={question.visual} /></div>}
          <div className="question-workspace">
            {question.part === 2 ? <div className="audio-prompt"><Headphones size={42} /><h2>질문과 응답을 잘 들어보세요.</h2><p>스크립트는 답을 선택한 뒤 확인할 수 있어요.</p></div> : !question.image && <div className="printed-question"><span>TEST {question.test} · Q{question.number}</span><h2>{question.prompt}</h2>{question.requiresGraphic && <p className="graphic-notice"><FileText size={15} /> 시각 자료 연계 문항</p>}</div>}
            <AudioPlayer ref={audioRef} src={question.audio} speed={speed} setSpeed={setSpeed} locked={exam} maxPlays={exam ? 1 : Number(config.repeat) || Infinity} onPlayStat={markAudioPlay} onEnded={() => { if (exam && config.autoNext && question.part <= 2) next() }} />
            <div className={`answer-list ${hiddenScripts ? 'letters-only' : ''}`}>
              {question.options.slice(0, question.optionCount).map((option, optionIndex) => {
                const letter = LETTERS[optionIndex]
                const isSelected = selected === letter
                const isAnswer = showFeedback && question.answer === letter
                const isWrong = showFeedback && isSelected && !isAnswer
                return <button key={letter} className={`${isSelected ? 'selected' : ''} ${isAnswer ? 'is-answer' : ''} ${isWrong ? 'is-wrong' : ''}`} onClick={() => choose(letter)}><span>{letter}</span><p>{hiddenScripts ? `선택지 ${letter}` : option}</p>{isAnswer && <CheckCircle2 size={20} />}{isWrong && <X size={20} />}</button>
              })}
            </div>
            {showFeedback && <FeedbackPanel question={question} selected={selected} onSave={toggleSave} saved={savedNotes.some((item) => item.id === question.id)} onEvidence={() => audioRef.current?.playSegment(...question.evidenceRange)} cause={causes[question.id] || '정답 근거를 놓침'} onCauseChange={(cause) => setCauses((items) => ({ ...items, [question.id]: cause }))} />}
            {scriptVisible && <TranscriptPanel question={question} onSentencePlay={playSentence} />}
          </div>
        </div>
      </main>
      <footer className="practice-footer">
        <button className="outline-button" disabled={index === 0 || exam} onClick={previous}><ArrowLeft size={17} /> 이전</button>
        <div className="question-dots">{questions.slice(Math.max(0, index - 3), Math.min(questions.length, index + 4)).map((item) => <span key={item.id} className={`${item.id === question.id ? 'current' : ''} ${answers[item.id] ? 'answered' : ''} ${flagged.includes(item.id) ? 'flagged' : ''}`}>{item.number}</span>)}</div>
        <div className="footer-next"><span>{!selected ? '미응답으로 넘어갈 수 있어요' : `선택 ${selected}`}</span><button className="primary-button" onClick={next}>{index === questions.length - 1 ? '결과 보기' : '다음 문제'} <ArrowRight size={17} /></button></div>
      </footer>
    </div>
  )
}

function ResultScreen({ result, onHome, onReview }) {
  const [reviewId, setReviewId] = useState(null)
  const [reviewSpeed, setReviewSpeed] = useState(1)
  const correct = result.questions.filter((q) => result.answers[q.id] === q.answer).length
  const total = result.questions.length
  const rate = Math.round((correct / total) * 100) || 0
  const unanswered = result.questions.filter((q) => !result.answers[q.id]).length
  const missed = result.questions.filter((q) => result.answerMeta?.[q.id]?.missed).length
  const answerChanges = Object.values(result.answerMeta || {}).reduce((sum, item) => sum + (item.changes || 0), 0)
  const durations = Object.values(result.answerMeta || {}).map((item) => item.duration || 0).filter(Boolean)
  const averageTime = durations.length ? Math.round(durations.reduce((sum, value) => sum + value, 0) / durations.length) : 0
  const estimatedCenter = Math.max(5, Math.min(495, Math.round((rate * 4.9 + 5) / 5) * 5))
  const estimatedRange = `${Math.max(5, estimatedCenter - 15)}–${Math.min(495, estimatedCenter + 15)}`
  const partRates = partMeta.map((p) => {
    const qs = result.questions.filter((q) => q.part === p.part)
    const hits = qs.filter((q) => result.answers[q.id] === q.answer).length
    return { ...p, value: qs.length ? Math.round(hits / qs.length * 100) : 0, attempted: qs.length }
  }).filter((p) => p.attempted)
  const typeRates = Object.values(result.questions.reduce((groups, question) => {
    const key = question.type
    const group = groups[key] || { type: key, total: 0, correct: 0 }
    group.total += 1
    group.correct += result.answers[question.id] === question.answer ? 1 : 0
    groups[key] = group
    return groups
  }, {})).map((group) => ({ ...group, value: Math.round(group.correct / group.total * 100) })).sort((a, b) => a.value - b.value)
  const reviewQuestion = reviewId ? result.questions.find((question) => question.id === reviewId) : null
  return (
    <div className="result-screen">
      <div className="result-top"><button className="back-button" onClick={onHome}><ArrowLeft size={19} /> 홈으로</button><Logo /><span /></div>
      <main>
        <section className="result-hero"><span className="pill"><Trophy size={15} /> SESSION COMPLETE</span><h1>{result.reason === 'time' ? '45분이 끝났어요. 끝까지 잘 해냈습니다.' : '귀가 한 단계 더 선명해졌어요.'}</h1><p>{result.exam ? `예상 LC ${estimatedRange}점` : '집중 학습'} 결과를 분석했어요.</p><div className="score-orbit"><Ring value={rate} color="#ff6b35" size={190} /><div className="spark s1">✦</div><div className="spark s2">✦</div></div><div className="score-summary"><div><strong>{correct}</strong><span>정답</span></div><i /><div><strong>{total - correct - unanswered}</strong><span>오답</span></div><i /><div><strong>{unanswered}</strong><span>미응답</span></div><i /><div><strong>{Math.floor(result.elapsed / 60)}:{String(result.elapsed % 60).padStart(2, '0')}</strong><span>학습 시간</span></div></div></section>
        <section className="result-grid"><div className="analysis-card"><span className="section-kicker">PART ANALYSIS</span><h3>파트별 정답률</h3><div className="part-results">{partRates.map((p) => <div key={p.part}><span style={{ background: p.accent }}>P{p.part}</span><div><strong>{p.title}</strong><small>{p.attempted}문제</small></div><div className="result-bar"><i style={{ width: `${p.value}%`, background: p.accent }} /></div><em>{p.value}%</em></div>)}</div></div><div className="recommend-card"><span className="section-kicker">NEXT STEP</span><h3>이어서 하면 좋아요</h3><div className="recommend-main"><Lightbulb size={22} /><div><strong>{typeRates[0]?.type || '간접 응답'} 집중 복습</strong><p>가장 낮은 정답률 {typeRates[0]?.value ?? 0}% 유형을 근거 구간 중심으로 다시 들어요.</p></div></div><button className="primary-button" onClick={onReview}>추천 복습 시작 <ArrowRight size={17} /></button></div></section>
        <section className="result-diagnostics"><div><Volume2 size={18} /><span>듣지 못하고 넘김</span><strong>{missed}문제</strong></div><div><RotateCcw size={18} /><span>정답 변경</span><strong>{answerChanges}회</strong></div><div><Clock3 size={18} /><span>평균 응답 시간</span><strong>{averageTime}초</strong></div><div><Flag size={18} /><span>검토 표시</span><strong>{result.flagged?.length || 0}문제</strong></div></section>
        <section className="type-analysis analysis-card"><div className="card-title-row"><div><span className="section-kicker">TYPE ANALYSIS</span><h3>세부 유형별 정답률</h3></div><span>취약 순</span></div><div className="type-results">{typeRates.slice(0, 8).map((item) => <div key={item.type}><span>{item.type}</span><div><i style={{ width: `${item.value}%` }} /></div><strong>{item.value}%</strong><small>{item.correct}/{item.total}</small></div>)}</div></section>
        <section className="answer-map"><div className="card-title-row"><div><span className="section-kicker">ANSWER MAP</span><h3>문제별 결과</h3></div><span className="legend"><i className="good" /> 정답 <i className="bad" /> 오답 <i /> 미응답</span></div><div className="answer-grid">{result.questions.map((q) => { const a = result.answers[q.id]; return <button key={q.id} title={`TEST ${q.test} · Q${q.number}`} onClick={() => setReviewId(q.id)} className={`${a ? (a === q.answer ? 'good' : 'bad') : ''} ${reviewId === q.id ? 'active' : ''}`}>{q.number}</button> })}</div></section>
        {reviewQuestion && <section className="result-review"><div className="card-title-row"><div><span className="section-kicker">QUESTION REVIEW</span><h3>TEST {reviewQuestion.test} · Q{reviewQuestion.number} 해설</h3></div><button className="icon-button" onClick={() => setReviewId(null)}><X size={18} /></button></div><div className="review-answer-line"><span>내 답 {result.answers[reviewQuestion.id] || '미응답'}</span><strong>정답 {reviewQuestion.answer}</strong><p>{reviewQuestion.prompt || reviewQuestion.evidence}</p></div><AudioPlayer src={reviewQuestion.audio} speed={reviewSpeed} setSpeed={setReviewSpeed} locked={false} /><FeedbackPanel question={reviewQuestion} selected={result.answers[reviewQuestion.id]} saved={false} onSave={() => {}} onEvidence={() => {}} cause="정답 근거를 놓침" onCauseChange={() => {}} /><TranscriptPanel question={reviewQuestion} onSentencePlay={() => {}} /></section>}
      </main>
    </div>
  )
}

function NotesScreen({ notes, setNotes, onPractice }) {
  const [filter, setFilter] = useState('전체')
  const causes = ['음성을 제대로 듣지 못함', '단어를 모름', '발음을 알아듣지 못함', '질문 의도를 잘못 이해함', '정답 근거를 놓침', '선택지의 함정에 속음', '패러프레이징을 이해하지 못함', '집중력이 떨어짐', '시간이 부족함']
  const shown = notes.filter((note) => filter === '전체' || `Part ${lcQuestions[note.id - 1].part}` === filter)
  return (
    <div className="screen notes-screen">
      <section className="page-intro row"><div><span className="section-kicker">REVIEW QUEUE</span><h2>놓친 소리를 다시 내 것으로</h2><p>복습할수록 우선순위가 자동으로 조정됩니다.</p></div><button className="primary-button" onClick={() => onPractice(notes.map((n) => n.id))}><RotateCcw size={17} /> 오늘 복습 {notes.filter((n) => n.due === '오늘').length}문제</button></section>
      <div className="filter-tabs">{['전체', 'Part 1', 'Part 2', 'Part 3', 'Part 4'].map((item) => <button key={item} className={filter === item ? 'active' : ''} onClick={() => setFilter(item)}>{item}</button>)}</div>
      <section className="note-summary"><div><span className="summary-icon coral"><CircleAlert size={20} /></span><p>오늘 복습<strong>{notes.filter((n) => n.due === '오늘').length}문제</strong></p></div><div><span className="summary-icon mint"><CheckCircle2 size={20} /></span><p>이번 주 졸업<strong>8문제</strong></p></div><div><span className="summary-icon lilac"><Activity size={20} /></span><p>가장 많은 원인<strong>간접 응답</strong></p></div></section>
      <div className="note-list">
        {shown.map((note) => { const q = lcQuestions[note.id - 1]; return <article key={note.id} className="note-card"><div className="note-index"><span>T{q.test} · Q{q.number}</span><small>PART {q.part}</small></div>{q.image && <img src={q.image} alt="오답 문제 사진" />}<div className="note-content"><div className="tag-row"><span>{q.type}</span><span>난이도 {q.difficulty}</span><span>{note.replayCount || 0}회 다시 들음</span></div><h3>{q.prompt || q.evidence}</h3><div className="note-answer"><span>내 답 {note.userAnswer || '기록 없음'}</span><span className="correct-answer">정답 {q.answer}</span><p>{q.evidence}</p></div><label className="cause"><CircleAlert size={15} /><strong>오답 원인</strong><select value={note.cause} onChange={(event) => setNotes(notes.map((item) => item.id === note.id ? { ...item, cause: event.target.value } : item))}>{causes.map((cause) => <option key={cause}>{cause}</option>)}</select></label><div className="note-stats"><span><Clock3 size={13} /> {note.duration || 0}초</span><span><RotateCcw size={13} /> 복습 성공 {note.review || 0}회</span><span><Bookmark size={13} /> {note.lastReviewed ? new Date(note.lastReviewed).toLocaleDateString('ko-KR') : '아직 복습 전'}</span></div></div><div className="note-side"><span className={`due ${note.status}`}>{note.due} 복습</span><div className="review-dots">{[0, 1, 2, 3].map((n) => <i key={n} className={n < note.review ? 'done' : ''} />)}</div><button className="outline-button" onClick={() => onPractice([q.id])}>다시 풀기 <ChevronRight size={16} /></button><button className="remove-note" onClick={() => setNotes(notes.filter((n) => n.id !== note.id))}>노트에서 제거</button></div></article> })}
        {!shown.length && <div className="empty-state"><CheckCircle2 size={38} /><h3>이 파트의 오답이 없어요.</h3><p>지금처럼 정확하게 들어 보세요!</p></div>}
      </div>
    </div>
  )
}

function ReviewLab({ onPractice }) {
  const [mode, setMode] = useState('dictation')
  const [text, setText] = useState('')
  const [checked, setChecked] = useState(false)
  const [recording, setRecording] = useState(false)
  const [recordingUrl, setRecordingUrl] = useState('')
  const [recordSeconds, setRecordSeconds] = useState(0)
  const [recordError, setRecordError] = useState('')
  const [ordered, setOrdered] = useState([])
  const recorderRef = useRef(null)
  const chunksRef = useRef([])
  const labAudioRef = useRef(null)
  const question = lcQuestions[12]
  const answer = 'What time can I pick up my glasses?'
  const normalized = (value) => value.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim()
  const accuracy = checked ? Math.round(normalized(text).split(' ').filter((word) => normalized(answer).split(' ').includes(word)).length / normalized(answer).split(' ').length * 100) : 0
  const orderWords = ['glasses?', 'pick', 'can', 'What', 'my', 'time', 'up', 'I']

  useEffect(() => {
    if (!recording) return undefined
    const timer = window.setInterval(() => setRecordSeconds((value) => value + 1), 1000)
    return () => window.clearInterval(timer)
  }, [recording])

  const toggleRecording = async () => {
    if (recording) { recorderRef.current?.stop(); return }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = (event) => chunksRef.current.push(event.data)
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType })
        if (recordingUrl) URL.revokeObjectURL(recordingUrl)
        setRecordingUrl(URL.createObjectURL(blob)); setRecording(false)
        stream.getTracks().forEach((track) => track.stop())
      }
      recorderRef.current = recorder
      setRecordSeconds(0); setRecordError(''); setRecording(true); recorder.start()
    } catch {
      setRecordError('마이크 권한을 허용하면 내 발음을 녹음할 수 있어요.')
    }
  }

  const speak = (phrase) => {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(phrase)
    utterance.lang = 'en-US'; utterance.rate = .85
    window.speechSynthesis.speak(utterance)
  }

  return (
    <div className="screen lab-screen">
      <section className="page-intro"><span className="section-kicker">LISTENING LAB</span><h2>문제를 넘어, 소리를 훈련해요</h2><p>받아쓰기와 쉐도잉으로 놓치는 발음의 패턴을 찾습니다.</p></section>
      <div className="lab-tabs"><button className={mode === 'dictation' ? 'active' : ''} onClick={() => { setMode('dictation'); setChecked(false) }}><MessageSquareText size={19} /> 받아쓰기</button><button className={mode === 'cloze' ? 'active' : ''} onClick={() => { setMode('cloze'); setText('') }}><ListChecks size={19} /> 빈칸 채우기</button><button className={mode === 'order' ? 'active' : ''} onClick={() => { setMode('order'); setOrdered([]) }}><Shuffle size={19} /> 문장 배열</button><button className={mode === 'match' ? 'active' : ''} onClick={() => setMode('match')}><CheckCircle2 size={19} /> 일치 문장</button><button className={mode === 'shadowing' ? 'active' : ''} onClick={() => setMode('shadowing')}><Mic2 size={19} /> 쉐도잉</button><button className={mode === 'script' ? 'active' : ''} onClick={() => setMode('script')}><BookOpen size={19} /> 스크립트</button></div>
      <section className="lab-workspace">
        <div className="lab-left"><div className="lab-question-meta"><span>PART 2</span><strong>간접 응답 · Q13</strong><em>2 / 5</em></div><div className="lab-listen"><Headphones size={48} /><h3>{mode === 'dictation' ? '들리는 문장을 그대로 적어 보세요.' : mode === 'shadowing' ? '음성을 듣고 바로 따라 말해 보세요.' : mode === 'script' ? '표현을 누르면 문장 단위로 다시 들을 수 있어요.' : '소리와 문장 구조를 연결해 보세요.'}</h3><p>연음과 축약을 놓쳐도 괜찮아요. 몇 번이고 다시 들을 수 있습니다.</p></div><AudioPlayer ref={labAudioRef} src={question.audio} speed={.9} setSpeed={() => {}} />
          {mode === 'dictation' && <div className="dictation-area"><textarea value={text} onChange={(e) => { setText(e.target.value); setChecked(false) }} placeholder="What time can I..." /><div><span>{checked ? `단어 일치도 ${accuracy}%` : `${text.length}자 입력`}</span><button className="primary-button" onClick={() => setChecked(true)}>정답 확인 <Check size={16} /></button></div>{checked && <div className={`dictation-result ${accuracy === 100 ? 'perfect' : ''}`}><strong>{accuracy === 100 ? '완벽해요!' : '놓친 부분을 비교해 보세요.'}</strong><p>{answer}</p><button onClick={() => setText(answer)}>정답 옮겨 쓰기</button></div>}</div>}
          {mode === 'cloze' && <div className="cloze-area"><p>What time can I <input value={text} onChange={(event) => setText(event.target.value)} placeholder="두 단어" /> my glasses?</p><button className="primary-button" onClick={() => setChecked(true)}>확인하기</button>{checked && <span className={normalized(text) === 'pick up' ? 'good' : 'bad'}>{normalized(text) === 'pick up' ? '정답입니다: pick up' : '다시 들어 보세요: pick up'}</span>}</div>}
          {mode === 'order' && <div className="order-area"><div className="ordered-line">{ordered.length ? ordered.map((word, index) => <button key={`${word}-${index}`} onClick={() => setOrdered((items) => items.filter((_, i) => i !== index))}>{word}</button>) : <span>단어를 순서대로 눌러 문장을 만드세요.</span>}</div><div className="word-bank">{orderWords.map((word) => <button key={word} disabled={ordered.includes(word)} onClick={() => setOrdered((items) => [...items, word])}>{word}</button>)}</div><div><button className="outline-button" onClick={() => setOrdered([])}><RotateCcw size={15} /> 초기화</button><button className="primary-button" onClick={() => setChecked(true)}>배열 확인</button></div>{checked && <p className={ordered.join(' ') === answer ? 'good' : 'bad'}>{ordered.join(' ') === answer ? '정확한 문장이에요.' : answer}</p>}</div>}
          {mode === 'match' && <div className="match-area">{['What time can I pick up my glasses?', 'What time can I pack up the classes?', 'When can I pick out my glass?'].map((line, index) => <button key={line} onClick={() => { setText(String(index)); setChecked(true) }} className={checked && text === String(index) ? (index === 0 ? 'good' : 'bad') : ''}><span>{LETTERS[index]}</span>{line}{checked && index === 0 && <Check size={17} />}</button>)}</div>}
          {mode === 'shadowing' && <><div className={`record-area ${recording ? 'recording' : ''}`}><button onClick={toggleRecording}>{recording ? <Pause size={28} /> : <Mic2 size={28} />}</button><div><strong>{recording ? `녹음 중 · ${recordSeconds}초` : '눌러서 녹음'}</strong><span>원음과 내 발음을 녹음해 비교해요.</span></div></div>{recordError && <p className="record-error">{recordError}</p>}{recordingUrl && <div className="record-playback"><span>내 쉐도잉</span><audio src={recordingUrl} controls /><button onClick={() => { URL.revokeObjectURL(recordingUrl); setRecordingUrl('') }}><X size={15} /></button></div>}</>}
          {mode === 'script' && <TranscriptPanel question={question} onSentencePlay={(index, length) => labAudioRef.current?.playSegment(index / length, Math.min(1, (index + 1) / length))} />}
        </div>
        <aside className="lab-insight"><span className="section-kicker">SOUND NOTE</span><h3>오늘의 소리 포인트</h3><div className="sound-card"><span>/pɪk‿ʌp/</span><strong>pick up</strong><p>자음과 모음이 이어져 ‘피컵’처럼 들려요.</p><button onClick={() => speak('pick up')}><Volume2 size={16} /> 발음 듣기</button></div><div className="sound-card"><span>/kləʊzət/</span><strong>close at</strong><p>두 단어가 붙어 ‘클로우젯’처럼 연결됩니다.</p><button onClick={() => speak('close at')}><Volume2 size={16} /> 발음 듣기</button></div><button className="outline-button full" onClick={() => onPractice([13, 14, 15, 16, 17])}>유사 표현 5문제 <ArrowRight size={16} /></button></aside>
      </section>
    </div>
  )
}

function StatsScreen({ history = [] }) {
  const totalQuestions = history.reduce((sum, item) => sum + item.total, 0)
  const totalCorrect = history.reduce((sum, item) => sum + item.correct, 0)
  const accuracy = totalQuestions ? Math.round(totalCorrect / totalQuestions * 100) : 82
  const totalSeconds = history.reduce((sum, item) => sum + item.elapsed, 0)
  const averageSeconds = totalQuestions ? Math.round(totalSeconds / totalQuestions * 10) / 10 : 8.4
  const estimate = Math.max(5, Math.min(495, Math.round((accuracy * 4.9 + 5) / 5) * 5))
  const chartData = history.length ? history.slice(0, 7).reverse().map((item, index) => ({ day: `${index + 1}회`, value: item.rate, minutes: Math.round(item.elapsed / 60) })) : weeklyData
  const calculatedParts = partMeta.map((part) => {
    const stats = history.reduce((total, item) => {
      const current = item.partStats?.[part.part]
      return current ? { total: total.total + current.total, correct: total.correct + current.correct } : total
    }, { total: 0, correct: 0 })
    return { p: part.part, v: stats.total ? Math.round(stats.correct / stats.total * 100) : [91, 74, 83, 79][part.part - 1], c: part.accent }
  })
  return (
    <div className="screen stats-screen">
      <section className="page-intro row"><div><span className="section-kicker">YOUR LISTENING DATA</span><h2>감이 아니라, 기록으로 성장해요</h2><p>최근 30일 학습 데이터를 분석했습니다.</p></div><div className="date-select">최근 30일 <ChevronDown size={16} /></div></section>
      <section className="stat-cards"><div><span><Gauge size={20} /></span><p>전체 정답률<strong>{accuracy}%</strong><small>{history.length ? `${history.length}개 세션 누적` : '데모 데이터'}</small></p></div><div><span><Headphones size={20} /></span><p>학습한 문제<strong>{totalQuestions || 486}</strong><small>{history.length ? `총 ${history.length}회 학습` : '이번 달 132문제'}</small></p></div><div><span><Clock3 size={20} /></span><p>평균 응답 시간<strong>{averageSeconds}초</strong><small>문제당 응답 시간</small></p></div><div><span><Star size={20} /></span><p>예상 LC 점수<strong>{Math.max(5, estimate - 15)}–{Math.min(495, estimate + 15)}</strong><small>정답률 기반 추정</small></p></div></section>
      <section className="chart-grid"><div className="chart-card trend-chart"><div className="card-title-row"><div><span className="section-kicker">ACCURACY TREND</span><h3>최근 세션 정답률</h3></div><span className="trend-up"><TrendingUp size={12} /> {history.length}회</span></div><div className="bar-chart">{chartData.map((item) => <div key={`${item.day}-${item.value}`}><em>{item.value}%</em><span><i style={{ height: `${item.value}%` }} /></span><small>{item.day}</small></div>)}</div></div><div className="chart-card radar-card"><span className="section-kicker">PART BALANCE</span><h3>파트별 균형</h3><div className="part-rings">{calculatedParts.map((item) => <div key={item.p}><Ring value={item.v} color={item.c} size={82} /><span>Part {item.p}</span></div>)}</div><div className="insight-line"><Lightbulb size={17} /><p><strong>Part {calculatedParts.slice().sort((a, b) => a.v - b.v)[0].p}가 가장 큰 성장 기회예요.</strong><br />낮은 정답률 유형부터 복습해 보세요.</p></div></div></section>
      <section className="cause-chart chart-card"><div className="card-title-row"><div><span className="section-kicker">ERROR CAUSES</span><h3>왜 틀렸는지 알아야 다음에 들려요</h3></div><button className="text-button">전체 분석 <ChevronRight size={15} /></button></div><div className="cause-bars">{[['정답 근거를 놓침', 31, '#ff6b35'], ['패러프레이징 미인지', 24, '#5267d7'], ['질문 의도 오해', 19, '#2e7d6f'], ['유사 발음 함정', 15, '#9a5bc4'], ['집중력 저하', 11, '#b4b1a7']].map(([label, value, color]) => <div key={label}><span>{label}</span><div><i style={{ width: `${value * 2.8}%`, background: color }} /></div><strong>{value}%</strong></div>)}</div></section>
    </div>
  )
}

function SettingsScreen({ config, setConfig }) {
  return (
    <div className="screen settings-screen">
      <section className="page-intro"><span className="section-kicker">PREFERENCES</span><h2>나에게 맞는 듣기 환경</h2><p>학습 모드의 기본 재생과 피드백 방식을 설정합니다.</p></section>
      <section className="settings-card">
        <div className="setting-row"><div><strong>기본 재생 속도</strong><p>학습 모드에서 처음 재생되는 속도입니다.</p></div><div className="segmented">{[.75, .9, 1, 1.1, 1.25].map((value) => <button key={value} className={config.speed === value ? 'active' : ''} onClick={() => setConfig({ ...config, speed: value })}>{value}×</button>)}</div></div>
        <div className="setting-row"><div><strong>음성 재생 횟수</strong><p>문제당 다시 들을 수 있는 최대 횟수입니다.</p></div><div className="segmented">{[1, 2, 3, 99].map((value) => <button key={value} className={config.repeat === value ? 'active' : ''} onClick={() => setConfig({ ...config, repeat: value })}>{value === 99 ? '무제한' : `${value}회`}</button>)}</div></div>
        <div className="setting-row"><div><strong>채점 시점</strong><p>답을 선택한 직후 또는 세션 종료 후 확인합니다.</p></div><div className="segmented"><button className={config.feedback === 'instant' ? 'active' : ''} onClick={() => setConfig({ ...config, feedback: 'instant' })}>즉시 피드백</button><button className={config.feedback === 'end' ? 'active' : ''} onClick={() => setConfig({ ...config, feedback: 'end' })}>종료 후 채점</button></div></div>
        <div className="setting-row"><div><strong>스크립트 공개</strong><p>Part 2는 답하기 전 기본적으로 숨겨집니다.</p></div><div className="segmented"><button className={config.script === 'after' ? 'active' : ''} onClick={() => setConfig({ ...config, script: 'after' })}>답한 뒤</button><button className={config.script === 'always' ? 'active' : ''} onClick={() => setConfig({ ...config, script: 'always' })}>항상 표시</button><button className={config.script === 'never' ? 'active' : ''} onClick={() => setConfig({ ...config, script: 'never' })}>항상 숨김</button></div></div>
        <div className="setting-row"><div><strong>기본 문제 순서</strong><p>학습 문제를 매 세션 새롭게 섞고 최근 60문항의 중복을 줄입니다.</p></div><div className="segmented"><button className={config.shuffle !== false ? 'active' : ''} onClick={() => setConfig({ ...config, shuffle: true })}>랜덤으로 섞기</button><button className={config.shuffle === false ? 'active' : ''} onClick={() => setConfig({ ...config, shuffle: false })}>기본 순서</button></div></div>
        <div className="setting-row"><div><strong>목표 LC 점수</strong><p>예상 점수와 추천 학습량 계산에 사용합니다.</p></div><label className="score-input"><input type="number" min="5" max="495" step="5" value={config.targetScore} onChange={(event) => setConfig({ ...config, targetScore: Math.min(495, Math.max(5, Number(event.target.value))) })} /><span>점</span></label></div>
      </section>
      <section className="data-source-card"><div className="data-source-icon"><BookOpen size={24} /></div><div><span className="section-kicker">CONNECTED MATERIALS</span><h3>ETS 토익 정기시험 기출문제집 5 · TEST 1–10</h3><p>실제 음원 540개 · 공식 정답 1,000개 · Part 1 사진 60장 · 인쇄 문항 연결</p></div><span className="connected"><Check size={14} /> 연결됨</span></section>
    </div>
  )
}

export default function App() {
  const [page, setPage] = useState('home')
  const [menuOpen, setMenuOpen] = useState(false)
  const [config, setConfig] = useStoredState('listenup-config', defaultConfig)
  const [notes, setNotes] = useStoredState('listenup-notes', initialWrongNotes)
  const [history, setHistory] = useStoredState('listenup-history', [])
  const [recentQuestions, setRecentQuestions] = useStoredState('listenup-recent-questions', [])
  const [session, setSession] = useState(null)
  const [result, setResult] = useState(null)

  useEffect(() => {
    if (config.test == null || config.shuffle == null) setConfig({ ...defaultConfig, ...config, test: config.test ?? 'all', shuffle: config.shuffle ?? true })
  }, [config, setConfig])

  const titleMap = { home: '오늘의 리스닝', practice: '문제 풀기', notes: '오답 노트', review: '리스닝 랩', stats: '학습 통계', settings: '설정' }

  const startPractice = (options = {}) => {
    const nextConfig = { ...config, ...options }
    const configuredTest = options.test ?? config.test ?? 'all'
    const examTest = configuredTest === 'all' ? 1 : Number(configuredTest)
    let randomized = false
    let questions
    if (options.ids) questions = options.ids.map((id) => lcQuestions[id - 1]).filter(Boolean)
    else if (options.exam) questions = lcQuestions.filter((question) => question.test === examTest)
    else {
      const part = options.part || config.part
      const difficulty = options.difficulty || config.difficulty
      const type = options.type || config.type
      let pool = lcQuestions.filter((question) => question.part === part && (configuredTest === 'all' || question.test === Number(configuredTest)))
      if (difficulty && difficulty !== '전체') pool = pool.filter((question) => question.difficulty === difficulty)
      if (type && type !== '전체 유형') pool = pool.filter((question) => question.type === type)
      if (!pool.length) pool = lcQuestions.filter((question) => question.part === part && (configuredTest === 'all' || question.test === Number(configuredTest)))
      randomized = Boolean(options.random || (options.shuffle ?? config.shuffle ?? true))
      if (randomized) {
        const fresh = shuffleQuestions(pool.filter((question) => !recentQuestions.includes(question.id)))
        const seen = shuffleQuestions(pool.filter((question) => recentQuestions.includes(question.id)))
        questions = [...fresh, ...seen].slice(0, options.count || 20)
      } else questions = pool.slice(0, Math.min(options.count || config.count, pool.length))
    }
    if (!options.exam) setRecentQuestions((items) => [...questions.map((question) => question.id), ...items.filter((id) => !questions.some((question) => question.id === id))].slice(0, 60))
    setSession({ questions, exam: Boolean(options.exam), randomized, test: options.exam ? examTest : configuredTest, config: { ...nextConfig, shuffle: randomized } })
    setResult(null)
  }

  const startIds = (ids) => startPractice({ ids })
  const navigate = (next) => { setPage(next); setSession(null); setResult(null) }

  if (result) return <ResultScreen result={result} onHome={() => navigate('home')} onReview={() => { setResult(null); setPage('review') }} />
  const finishPractice = (data) => {
    const correct = data.questions.filter((question) => data.answers[question.id] === question.answer).length
    const partStats = partMeta.reduce((stats, part) => {
      const questions = data.questions.filter((question) => question.part === part.part)
      if (questions.length) stats[part.part] = { total: questions.length, correct: questions.filter((question) => data.answers[question.id] === question.answer).length }
      return stats
    }, {})
    const record = { id: Date.now(), date: new Date().toISOString(), total: data.questions.length, correct, rate: Math.round(correct / data.questions.length * 100) || 0, elapsed: data.elapsed, exam: data.exam, parts: [...new Set(data.questions.map((question) => question.part))], partStats }
    setHistory((items) => [record, ...items].slice(0, 120))
    setNotes((items) => {
      const byId = new Map(items.map((item) => [item.id, item]))
      data.questions.forEach((question) => {
        const isCorrect = data.answers[question.id] === question.answer
        const existing = byId.get(question.id)
        if (!isCorrect) byId.set(question.id, { ...(existing || {}), id: question.id, cause: existing?.cause || (data.answerMeta?.[question.id]?.missed ? '음성을 제대로 듣지 못함' : '정답 근거를 놓침'), review: existing?.review || 0, due: '오늘', status: 'urgent', userAnswer: data.answers[question.id] || '미응답', duration: data.answerMeta?.[question.id]?.duration || 0, replayCount: data.answerMeta?.[question.id]?.replayCount || 0, lastReviewed: new Date().toISOString() })
        else if (existing) {
          const review = Math.min(4, (existing.review || 0) + 1)
          byId.set(question.id, { ...existing, review, due: review >= 3 ? '7일 후' : review === 2 ? '3일 후' : '내일', status: review >= 3 ? 'later' : 'soon', lastReviewed: new Date().toISOString() })
        }
      })
      return [...byId.values()]
    })
    setResult(data)
    setSession(null)
  }

  if (session) return <PracticeScreen session={session} config={session.config} savedNotes={notes} setSavedNotes={setNotes} onExit={() => setSession(null)} onFinish={finishPractice} />

  return (
    <div className="app-shell">
      {menuOpen && <div className="sidebar-scrim" onClick={() => setMenuOpen(false)} />}
      <Sidebar page={page} onNavigate={navigate} open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="app-main">
        <Header title={titleMap[page]} onMenu={() => setMenuOpen(true)} onNavigate={navigate} />
        {page === 'home' && <HomeScreen startPractice={startPractice} onNavigate={navigate} setConfig={setConfig} />}
        {page === 'practice' && <PracticeLanding startPractice={startPractice} config={config} setConfig={setConfig} />}
        {page === 'notes' && <NotesScreen notes={notes} setNotes={setNotes} onPractice={startIds} />}
        {page === 'review' && <ReviewLab onPractice={startIds} />}
        {page === 'stats' && <StatsScreen history={history} />}
        {page === 'settings' && <SettingsScreen config={config} setConfig={setConfig} />}
      </div>
    </div>
  )
}
