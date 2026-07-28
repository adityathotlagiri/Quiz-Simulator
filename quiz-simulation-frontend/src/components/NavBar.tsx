import { Link, useLocation } from "react-router-dom";
import { GraduationCap, LayoutDashboard, BookOpen, BarChart3 } from "lucide-react";

export default function NavBar() {
  const { pathname } = useLocation();

  const linkClass = (path: string) =>
    `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      pathname.startsWith(path)
        ? "bg-indigo-50 text-indigo-700"
        : "text-slate-500 hover:bg-slate-100"
    }`;

  return (
    <div className="border-b border-slate-200 bg-white px-8 py-3 flex items-center gap-2">
      <GraduationCap size={20} className="text-indigo-600 mr-3" />
      <Link to="/teacher/quizzes" className={linkClass("/teacher")}>
        <LayoutDashboard size={15} />
        Teacher
      </Link>
      <Link to="/student/quizzes" className={linkClass("/student/quizzes")}>
        <BookOpen size={15} />
        Student
      </Link>
      <Link to="/student/performance" className={linkClass("/student/performance")}>
        <BarChart3 size={15} />
        Performance
      </Link>
    </div>
  );
}