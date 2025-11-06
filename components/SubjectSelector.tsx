
import React from 'react';
import { Subject } from '../types';

interface SubjectSelectorProps {
  selectedSubject: Subject | null;
  onSelectSubject: (subject: Subject) => void;
}

const subjects = [
  { id: Subject.KOREAN, name: '국어', icon: '📖' },
  { id: Subject.ENGLISH, name: 'English', icon: '🔤' },
  { id: Subject.MATH, name: '수학', icon: '📐' },
];

const SubjectSelector: React.FC<SubjectSelectorProps> = ({ selectedSubject, onSelectSubject }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-6">
      <h3 className="text-lg font-semibold mb-4 text-slate-700">1. Select a Subject</h3>
      <div className="grid grid-cols-3 gap-4">
        {subjects.map((subject) => (
          <button
            key={subject.id}
            onClick={() => onSelectSubject(subject.id)}
            className={`p-4 rounded-lg text-center font-semibold border-2 transition-all duration-200 ease-in-out transform hover:-translate-y-1
              ${selectedSubject === subject.id
                ? 'bg-blue-600 text-white border-blue-700 shadow-lg'
                : 'bg-slate-50 hover:bg-blue-100 border-slate-200 text-slate-700'
              }`}
          >
            <span className="text-2xl block mb-1">{subject.icon}</span>
            <span>{subject.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SubjectSelector;
