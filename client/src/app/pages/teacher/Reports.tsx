import { useState } from "react";
import { Trophy, Target, Flame, Medal, Crown, Award, TrendingUp, Eye, AlertTriangle } from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export function Reports() {
  const [selectedClass, setSelectedClass] = useState("Class 10A");

  const classes = ["Class 10A", "Class 10B", "Class 11A", "Class 11B", "Class 12A", "Class 12B"];

  // Mock data for Exercise Completion Rankings
  const exerciseCompletionRankings = [
    { rank: 1, name: "Emma Wilson", avatar: "EW", completed: 156, total: 160, percentage: 97.5 },
    { rank: 2, name: "James Chen", avatar: "JC", completed: 152, total: 160, percentage: 95.0 },
    { rank: 3, name: "Sarah Johnson", avatar: "SJ", completed: 148, total: 160, percentage: 92.5 },
    { rank: 4, name: "Michael Brown", avatar: "MB", completed: 145, total: 160, percentage: 90.6 },
    { rank: 5, name: "Olivia Davis", avatar: "OD", completed: 142, total: 160, percentage: 88.8 },
    { rank: 6, name: "Daniel Martinez", avatar: "DM", completed: 138, total: 160, percentage: 86.3 },
    { rank: 7, name: "Sophia Anderson", avatar: "SA", completed: 135, total: 160, percentage: 84.4 },
    { rank: 8, name: "Liam Taylor", avatar: "LT", completed: 131, total: 160, percentage: 81.9 },
    { rank: 9, name: "Ava Thomas", avatar: "AT", completed: 128, total: 160, percentage: 80.0 },
    { rank: 10, name: "Noah Garcia", avatar: "NG", completed: 124, total: 160, percentage: 77.5 },
  ];

  // Mock data for Exercise Score Rankings
  const exerciseScoreRankings = [
    { rank: 1, name: "James Chen", avatar: "JC", avgScore: 96.8, exercises: 152, totalPoints: 14713 },
    { rank: 2, name: "Emma Wilson", avatar: "EW", avgScore: 95.2, exercises: 156, totalPoints: 14851 },
    { rank: 3, name: "Sarah Johnson", avatar: "SJ", avgScore: 93.5, exercises: 148, totalPoints: 13838 },
    { rank: 4, name: "Olivia Davis", avatar: "OD", avgScore: 92.1, exercises: 142, totalPoints: 13078 },
    { rank: 5, name: "Michael Brown", avatar: "MB", avgScore: 90.8, exercises: 145, totalPoints: 13166 },
    { rank: 6, name: "Sophia Anderson", avatar: "SA", avgScore: 89.6, exercises: 135, totalPoints: 12096 },
    { rank: 7, name: "Daniel Martinez", avatar: "DM", avgScore: 88.3, exercises: 138, totalPoints: 12185 },
    { rank: 8, name: "Ava Thomas", avatar: "AT", avgScore: 86.9, exercises: 128, totalPoints: 11123 },
    { rank: 9, name: "Liam Taylor", avatar: "LT", avgScore: 85.2, exercises: 131, totalPoints: 11161 },
    { rank: 10, name: "Noah Garcia", avatar: "NG", avgScore: 83.7, exercises: 124, totalPoints: 10379 },
  ];

  // Mock data for Study Streak Rankings
  const studyStreakRankings = [
    { rank: 1, name: "Sophia Anderson", avatar: "SA", currentStreak: 127, longestStreak: 145, totalDays: 312 },
    { rank: 2, name: "Emma Wilson", avatar: "EW", currentStreak: 118, longestStreak: 128, totalDays: 298 },
    { rank: 3, name: "Olivia Davis", avatar: "OD", currentStreak: 104, longestStreak: 118, totalDays: 285 },
    { rank: 4, name: "James Chen", avatar: "JC", currentStreak: 98, longestStreak: 112, totalDays: 276 },
    { rank: 5, name: "Ava Thomas", avatar: "AT", currentStreak: 92, longestStreak: 105, totalDays: 268 },
    { rank: 6, name: "Sarah Johnson", avatar: "SJ", currentStreak: 87, longestStreak: 98, totalDays: 251 },
    { rank: 7, name: "Daniel Martinez", avatar: "DM", currentStreak: 81, longestStreak: 92, totalDays: 243 },
    { rank: 8, name: "Michael Brown", avatar: "MB", currentStreak: 76, longestStreak: 88, totalDays: 235 },
    { rank: 9, name: "Liam Taylor", avatar: "LT", currentStreak: 68, longestStreak: 78, totalDays: 219 },
    { rank: 10, name: "Noah Garcia", avatar: "NG", currentStreak: 62, longestStreak: 71, totalDays: 207 },
  ];

  const getRankColor = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-br from-yellow-400 to-yellow-600 text-white";
    if (rank === 2) return "bg-gradient-to-br from-gray-300 to-gray-500 text-white";
    if (rank === 3) return "bg-gradient-to-br from-orange-400 to-orange-600 text-white";
    return "bg-gray-100 text-gray-700";
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-4 h-4" />;
    if (rank === 2) return <Medal className="w-4 h-4" />;
    if (rank === 3) return <Award className="w-4 h-4" />;
    return null;
  };

  // Skill Analytics Radar Chart Data
  const skillData = [
    { skill: "Vocabulary", score: 85, fullMark: 100 },
    { skill: "Speaking", score: 78, fullMark: 100 },
    { skill: "Grammar", score: 92, fullMark: 100 },
    { skill: "Reading", score: 88, fullMark: 100 },
    { skill: "Writing", score: 75, fullMark: 100 },
    { skill: "Attendance", score: 94, fullMark: 100 },
  ];

  // Class Comparison Bar Chart Data
  const classComparisonData = [
    { class: "Class 10A", vocabulary: 85, speaking: 78, grammar: 92, attendance: 94 },
    { class: "Class 10B", vocabulary: 82, speaking: 75, grammar: 88, attendance: 89 },
    { class: "Class 11A", vocabulary: 88, speaking: 82, grammar: 90, attendance: 92 },
  ];

  // Top Students Leaderboard
  const topStudents = [
    { rank: 1, name: "Emma Wilson", class: "Class 10A", points: 2456, avatar: "EW" },
    { rank: 2, name: "James Chen", class: "Class 10A", points: 2398, avatar: "JC" },
    { rank: 3, name: "Sarah Johnson", class: "Class 10B", points: 2287, avatar: "SJ" },
    { rank: 4, name: "Michael Brown", class: "Class 11A", points: 2156, avatar: "MB" },
    { rank: 5, name: "Olivia Davis", class: "Class 10A", points: 2098, avatar: "OD" },
  ];

  // Students to Watch
  const studentsToWatch = [
    {
      name: "Daniel Martinez",
      class: "Class 10B",
      issue: "Homework completion below 50%",
      severity: "high",
      avatar: "DM",
    },
    {
      name: "Sophia Anderson",
      class: "Class 11A",
      issue: "3 consecutive absences",
      severity: "high",
      avatar: "SA",
    },
    {
      name: "Liam Taylor",
      class: "Class 10A",
      issue: "Speaking score declining",
      severity: "medium",
      avatar: "LT",
    },
    {
      name: "Ava Thomas",
      class: "Class 10B",
      issue: "Needs additional support",
      severity: "medium",
      avatar: "AT",
    },
  ];

  const getSeverityColor = (severity: string) => {
    if (severity === "high") return "bg-red-50 text-red-700 border-red-200";
    if (severity === "medium") return "bg-orange-50 text-orange-700 border-orange-200";
    return "bg-yellow-50 text-yellow-700 border-yellow-200";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Weekly Student Rankings</h1>
          <p className="text-gray-500 mt-1">Top 10 students performance by class</p>
        </div>
        <div>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A73E8] focus:border-transparent"
          >
            {classes.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Exercise Completion Ranking */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-[#1A73E8] to-[#1557B0] p-6">
          <div className="flex items-center gap-3 text-white">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Exercise Completion Ranking</h2>
              <p className="text-sm text-white/90">Students ranked by completed exercises</p>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completed</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completion Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {exerciseCompletionRankings.map((student) => (
                <tr key={student.rank} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className={`w-10 h-10 ${getRankColor(student.rank)} rounded-lg flex items-center justify-center font-bold text-sm`}>
                      {getRankIcon(student.rank) || student.rank}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#1A73E8] rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {student.avatar}
                      </div>
                      <span className="font-medium text-gray-900">{student.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-green-600">{student.completed}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{student.total}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.percentage}%</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                          style={{ width: `${student.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Exercise Score Ranking */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-6">
          <div className="flex items-center gap-3 text-white">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Exercise Score Ranking</h2>
              <p className="text-sm text-white/90">Students ranked by average exercise scores</p>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exercises</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Points</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {exerciseScoreRankings.map((student) => (
                <tr key={student.rank} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className={`w-10 h-10 ${getRankColor(student.rank)} rounded-lg flex items-center justify-center font-bold text-sm`}>
                      {getRankIcon(student.rank) || student.rank}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {student.avatar}
                      </div>
                      <span className="font-medium text-gray-900">{student.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-purple-600">{student.avgScore}%</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{student.exercises}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.totalPoints.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full"
                          style={{ width: `${student.avgScore}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Study Streak Ranking */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-red-600 p-6">
          <div className="flex items-center gap-3 text-white">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Study Streak Ranking</h2>
              <p className="text-sm text-white/90">Students ranked by current study streak</p>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Streak</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Longest Streak</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Days</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {studyStreakRankings.map((student) => (
                <tr key={student.rank} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className={`w-10 h-10 ${getRankColor(student.rank)} rounded-lg flex items-center justify-center font-bold text-sm`}>
                      {getRankIcon(student.rank) || student.rank}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {student.avatar}
                      </div>
                      <span className="font-medium text-gray-900">{student.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Flame className="w-5 h-5 text-orange-500" />
                      <span className="text-sm font-semibold text-orange-600">{student.currentStreak} days</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{student.longestStreak} days</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.totalDays} days</td>
                  <td className="px-6 py-4">
                    {student.currentStreak >= 100 ? (
                      <span className="px-3 py-1 bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 rounded-full text-xs font-medium flex items-center gap-1 w-fit">
                        <Flame className="w-3 h-3" />
                        On Fire!
                      </span>
                    ) : student.currentStreak >= 50 ? (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                        Great!
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        Good
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Skill Analytics Radar Chart */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-[#1A73E8] to-[#1557B0] p-6">
          <div className="flex items-center gap-3 text-white">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Skill Analytics</h2>
              <p className="text-sm text-white/90">Radar chart of skill scores</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="skill" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Radar name="Score" dataKey="score" stroke="#1A73E8" fill="#1A73E8" fillOpacity={0.6} />
              <Radar name="Full Mark" dataKey="fullMark" stroke="#FF5733" fill="#FF5733" fillOpacity={0.6} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Class Comparison Bar Chart */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-6">
          <div className="flex items-center gap-3 text-white">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Class Comparison</h2>
              <p className="text-sm text-white/90">Bar chart of class performance</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={classComparisonData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="class" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="vocabulary" fill="#1A73E8" />
              <Bar dataKey="speaking" fill="#FF5733" />
              <Bar dataKey="grammar" fill="#FFC300" />
              <Bar dataKey="attendance" fill="#33FF57" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Students Leaderboard */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-[#1A73E8] to-[#1557B0] p-6">
          <div className="flex items-center gap-3 text-white">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Top Students Leaderboard</h2>
              <p className="text-sm text-white/90">Top students by points</p>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Points</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avatar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {topStudents.map((student) => (
                <tr key={student.rank} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className={`w-10 h-10 ${getRankColor(student.rank)} rounded-lg flex items-center justify-center font-bold text-sm`}>
                      {getRankIcon(student.rank) || student.rank}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#1A73E8] rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {student.avatar}
                      </div>
                      <span className="font-medium text-gray-900">{student.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{student.class}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.points.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="w-10 h-10 bg-[#1A73E8] rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {student.avatar}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Students to Watch */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-red-600 p-6">
          <div className="flex items-center gap-3 text-white">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Students to Watch</h2>
              <p className="text-sm text-white/90">Students with issues</p>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avatar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {studentsToWatch.map((student) => (
                <tr key={student.name} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {student.avatar}
                      </div>
                      <span className="font-medium text-gray-900">{student.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{student.class}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.issue}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 ${getSeverityColor(student.severity)} rounded-full text-xs font-medium`}>
                      {student.severity.charAt(0).toUpperCase() + student.severity.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {student.avatar}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}