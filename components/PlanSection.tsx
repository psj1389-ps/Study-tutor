
import React from 'react';
import { StudyDay } from '../types';

interface PlanSectionProps {
  plan: StudyDay[];
}

const PlanSection: React.FC<PlanSectionProps> = ({ plan }) => {
  return (
    <div>
      <h3 className="text-2xl font-bold text-slate-800 mb-6">Your 10-Day Mastery Plan</h3>
      <div className="relative border-l-2 border-blue-200 pl-6 space-y-8">
        {plan.map((day) => (
          <div key={day.day} className="relative">
            <div className="absolute -left-[34px] top-1 w-4 h-4 bg-blue-500 rounded-full border-4 border-white"></div>
            <h4 className="font-bold text-blue-600">Day {day.day}: {day.goal}</h4>
            <ul className="mt-2 list-disc list-inside text-slate-600 space-y-1">
              {day.tasks.map((task, index) => (
                <li key={index}>{task}</li>
              ))}
            </ul>
          </div>
        ))}
         <div className="absolute -left-[34px] top-1 w-4 h-4 bg-blue-500 rounded-full border-4 border-white opacity-0"></div>
      </div>
    </div>
  );
};

export default PlanSection;
