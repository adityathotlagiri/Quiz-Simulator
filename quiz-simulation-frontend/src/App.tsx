import { Toaster } from 'react-hot-toast'
import './App.css'
import QuizManagement from './pages/teacher/QuizManagement'
import StudentQuizList from './pages/student/StudentQuizList'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AttemptScreen from './pages/student/AttemptScreen'
import ResultScreen from "./pages/student/ResultScreen";
import PerformanceDashboard from './pages/student/PerformanceDashboard'
import NavBar from './components/NavBar'
import AttemptHistory from './pages/student/AttemptHistory'
import ChatWidget from './components/chat/ChatWidget'

function App() {

  return (
    <>
      <BrowserRouter>
      <Toaster position="top-right" />
      <ChatWidget />
      <NavBar />
      <Routes>
        <Route path="/teacher/quizzes" element={<QuizManagement />} ></Route>
        <Route path="/student/quizzes" element={<StudentQuizList />} />
        <Route path="/student/attempt/:attemptId" element={<AttemptScreen />} />
        <Route path="/student/result/:attemptId" element={<ResultScreen />} />
        <Route path="/student/performance" element={<PerformanceDashboard />} />
        <Route path="/student/history/:quizId" element={<AttemptHistory />} />
      </Routes>
    </BrowserRouter>

    </>
  )
}

export default App
