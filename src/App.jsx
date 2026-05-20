import { useState } from "react";
import { allQuestions } from "./questions";

export default function App() {
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);

  const goBackToMenu = () => {
    setSelectedChapter(null);
    setCurrentQuestion(0);
    setScore(0);
    setSelected("");
    setShowAnswer(false);
  };

  if (!selectedChapter) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-3xl backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-6 text-white">

          <h1 className="text-4xl font-bold text-center mb-6">
            Hydrology Quiz
          </h1>

          <div className="grid grid-cols-3 gap-4">

            <button
              onClick={() => setSelectedChapter("chapter1")}
              className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl text-left transition-all duration-300"
            >
              <div className="text-3xl mb-2">🌍</div>
              <div className="text-sm text-gray-300">Chapter 1</div>
              <div className="text-xl font-bold">
                Hydrologic Principles
              </div>
            </button>

            <button
              onClick={() => setSelectedChapter("chapter2")}
              className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl text-left transition-all duration-300"
            >
              <div className="text-3xl mb-2">📊</div>
              <div className="text-sm text-gray-300">Chapter 2</div>
              <div className="text-xl font-bold">
                Hydrologic Analysis
              </div>
            </button>

            <button
              onClick={() => setSelectedChapter("chapter3")}
              className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl text-left transition-all duration-300"
            >
              <div className="text-3xl mb-2">📈</div>
              <div className="text-sm text-gray-300">Chapter 3</div>
              <div className="text-xl font-bold">
                Frequency Analysis
              </div>
            </button>

            <button
              onClick={() => setSelectedChapter("chapter4")}
              className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl text-left transition-all duration-300"
            >
              <div className="text-3xl mb-2">🌊</div>
              <div className="text-sm text-gray-300">Chapter 4</div>
              <div className="text-xl font-bold">
                Flood Routing
              </div>
            </button>

            <button
              onClick={() => setSelectedChapter("chapter5")}
              className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl text-left transition-all duration-300"
            >
              <div className="text-3xl mb-2">🖥️</div>
              <div className="text-sm text-gray-300">Chapter 5</div>
              <div className="text-xl font-bold">
                Simulation Models
              </div>
            </button>

            <button
              onClick={() => setSelectedChapter("chapter6")}
              className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl text-left transition-all duration-300"
            >
              <div className="text-3xl mb-2">🏙️</div>
              <div className="text-sm text-gray-300">Chapter 6</div>
              <div className="text-xl font-bold">
                Urban Hydrology
              </div>
            </button>

            <button
              onClick={() => setSelectedChapter("chapter7")}
              className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl text-left transition-all duration-300"
            >
              <div className="text-3xl mb-2">💧</div>
              <div className="text-sm text-gray-300">Chapter 7</div>
              <div className="text-xl font-bold">
                Ground Water Hydrology
              </div>
            </button>

            <button
              onClick={() => setSelectedChapter("chapter8")}
              className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl text-left transition-all duration-300"
            >
              <div className="text-3xl mb-2">🗺️</div>
              <div className="text-sm text-gray-300">Chapter 8</div>
              <div className="text-xl font-bold">
                GIS & Spatial Info
              </div>
            </button>

            <button
              onClick={() => setSelectedChapter("chapter9")}
              className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl text-left transition-all duration-300"
            >
              <div className="text-3xl mb-2">📡</div>
              <div className="text-sm text-gray-300">Chapter 9</div>
              <div className="text-xl font-bold">
                Radar Rainfall
              </div>
            </button>

          </div>

          <div className="mt-5">
            <button
              className="w-full bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 p-4 rounded-2xl text-left transition-all duration-300"
            >
              <div className="text-lg text-red-200">
                🔥 Special Section
              </div>

              <div className="text-2xl font-bold">
                Past Year Questions
              </div>
            </button>
          </div>

        </div>
      </div>
    );
  }

  const questions = allQuestions[selectedChapter];
  const question = questions[currentQuestion];

  const handleAnswer = (option) => {
    if (showAnswer) return;

    setSelected(option);
    setShowAnswer(true);

    if (option === question.answer) {
      setScore(score + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelected("");
      setShowAnswer(false);
    } else {
      alert(`Quiz Finished! Final Score: ${score}/${questions.length}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 text-white">

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold">
            {selectedChapter.toUpperCase()}
          </h1>

          <div className="flex gap-3 items-center">
            <button
              onClick={goBackToMenu}
              className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm"
            >
              ← Back
            </button>

            <div className="bg-white/10 px-4 py-2 rounded-xl text-lg font-semibold">
              Score: {score}
            </div>
          </div>
        </div>

        <div className="mb-4 text-gray-300 text-lg">
          Question {currentQuestion + 1} of {questions.length}
        </div>

        <h2 className="text-3xl font-semibold mb-8 leading-relaxed">
          {question.question}
        </h2>

        <div className="space-y-4">
          {question.options.map((option) => {
            let buttonStyle =
              "bg-white/10 hover:bg-white/20 border border-white/10";

            if (showAnswer) {
              if (option === question.answer) {
                buttonStyle =
                  "bg-green-500 text-white border-green-400";
              } else if (option === selected) {
                buttonStyle =
                  "bg-red-500 text-white border-red-400";
              } else {
                buttonStyle =
                  "bg-white/5 text-gray-300";
              }
            }

            return (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                className={`w-full p-5 rounded-2xl text-left text-lg transition-all duration-300 transform hover:scale-[1.02] ${buttonStyle}`}
              >
                {option}
              </button>
            );
          })}
        </div>

        {showAnswer && (
          <div className="mt-8 flex justify-end">
            <button
              onClick={nextQuestion}
              className="bg-purple-600 hover:bg-purple-500 px-8 py-4 rounded-2xl text-lg font-bold transition-all duration-300 hover:scale-105"
            >
              Next Question →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}