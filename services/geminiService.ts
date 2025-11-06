
import { GoogleGenAI, Type, GenerateContentParameters } from "@google/genai";
import { Subject, StudyGuide, UploadedFile, Quiz } from '../types';

const studyGuideSchema = {
    type: Type.OBJECT,
    properties: {
        summary: { type: Type.STRING, description: "A concise summary of the key concepts from the provided material." },
        studyPlan: {
            type: Type.ARRAY,
            description: "A 10-day study plan to master the material.",
            items: {
                type: Type.OBJECT,
                properties: {
                    day: { type: Type.INTEGER },
                    goal: { type: Type.STRING, description: "The main learning objective for the day." },
                    tasks: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific tasks for the day." }
                },
                required: ['day', 'goal', 'tasks']
            }
        },
        multipleChoiceQuestions: {
            type: Type.ARRAY,
            description: "A list of multiple-choice questions.",
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING },
                    context: { type: Type.STRING, description: "An optional short passage from the source material that is relevant to this question. Only include this if the question directly refers to a specific part of the text." },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    answer: { type: Type.STRING },
                    examProbability: { type: Type.STRING, description: "Estimated probability of appearing on an exam. Must be 'High', 'Medium', or 'Low'." },
                    chainOfThoughtExplanation: {
                        type: Type.OBJECT,
                        properties: {
                            step1: { type: Type.STRING, description: "Analyze & Identify: What is the question asking and what concepts are needed?" },
                            step2: { type: Type.STRING, description: "Step-by-Step Solution: A detailed walkthrough to the correct answer." },
                            step3: { type: Type.STRING, description: "Review & Apply: Summarize the key principle and its applications." }
                        },
                        required: ['step1', 'step2', 'step3']
                    }
                },
                required: ['question', 'options', 'answer', 'examProbability', 'chainOfThoughtExplanation']
            }
        },
        shortAnswerQuestions: {
            type: Type.ARRAY,
            description: "A list of short-answer or essay questions.",
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING },
                    context: { type: Type.STRING, description: "An optional short passage from the source material that is relevant to this question. Only include this if the question directly refers to a specific part of the text." },
                    answer: { type: Type.STRING },
                    examProbability: { type: Type.STRING, description: "Estimated probability of appearing on an exam. Must be 'High', 'Medium', or 'Low'." },
                    chainOfThoughtExplanation: {
                        type: Type.OBJECT,
                        properties: {
                            step1: { type: Type.STRING, description: "Analyze & Identify: What is the question asking and what concepts are needed?" },
                            step2: { type: Type.STRING, description: "Step-by-Step Solution: A detailed walkthrough to the correct answer." },
                            step3: { type: Type.STRING, description: "Review & Apply: Summarize the key principle and its applications." }
                        },
                        required: ['step1', 'step2', 'step3']
                    }
                },
                required: ['question', 'answer', 'examProbability', 'chainOfThoughtExplanation']
            }
        }
    },
    required: ['summary', 'studyPlan', 'multipleChoiceQuestions', 'shortAnswerQuestions']
};

const quizSchema = {
    type: Type.OBJECT,
    properties: {
        multipleChoiceQuestions: studyGuideSchema.properties.multipleChoiceQuestions,
        shortAnswerQuestions: studyGuideSchema.properties.shortAnswerQuestions
    },
    required: ['multipleChoiceQuestions', 'shortAnswerQuestions']
};


const generatePrompt = (subject: Subject, fileCount: number, prioritizeExamQuestions: boolean): string => {
  const materialSource = fileCount > 0
    ? `the provided ${fileCount} file(s) (which could be PDFs, images of textbook pages, etc.)`
    : "the provided text content";

  const quizInstruction = prioritizeExamQuestions
    ? "For the quiz questions, you MUST prioritize generating questions that have a high probability of appearing on a real school exam. For EACH question, you must provide its estimated `examProbability` ('High', 'Medium', or 'Low'). The list of questions should be sorted with 'High' probability questions first."
    : "For the quiz questions, generate a diverse set covering the entire breadth of the provided material. For EACH question, you must provide its estimated `examProbability` ('High', 'Medium', or 'Low').";


  return `
You are an expert AI tutor named Study-GPT, specializing in helping Korean high school students advance from a 2-3 grade level to a 1. Your task is to analyze ${materialSource} for a specific subject and generate a comprehensive, personalized study guide.

The user is a first-year high school student. All explanations must be clear, encouraging, and easy to understand.

Subject: ${subject}

Based on the provided material, generate a JSON object that adheres to the specified schema.

**Subject-Specific Instructions:**
- If the subject is **Math**: Focus on creating a large number of practice problems for the concepts presented. The summary should highlight key formulas and problem-solving strategies. The 10-day plan should emphasize daily problem-solving practice.
- If the subject is **English**: Focus on vocabulary, grammar, sentence structure, and reading comprehension. Generate questions related to finding the main idea, inference, sentence insertion, and ordering. The summary should list key vocabulary and grammatical points.
- If the subject is **Korean**: For literature, focus on themes, characters, and literary devices. For non-fiction, focus on the main argument, structure, and evidence. For grammar, explain the rules and provide examples from the text.

**Quiz Generation Instructions:**
${quizInstruction}

**Output Generation Rules:**
1.  **Summary:** Create a concise summary of the key concepts from the material.
2.  **10-Day Plan:** Design a balanced 10-day study plan to master the material. Each day should have a clear goal.
3.  **Questions:** Generate at least 3 multiple-choice and 2 short-answer questions based on the quiz instructions above. For EACH question, if it refers to a specific part of the source material (like a text passage or a specific problem statement), you MUST include that relevant text in the 'context' field. If the question is general, omit the 'context' field.
4.  **Chain-of-Thought Explanations:** For EVERY question, provide a detailed 3-step Chain-of-Thought explanation.
    - **Step 1 (Analyze & Identify):** Clearly state what the question is asking and which core concepts are needed to solve it. Use Korean for explanations.
    - **Step 2 (Step-by-Step Solution):** Provide a logical, step-by-step walkthrough to the correct answer. Use Korean for explanations.
    - **Step 3 (Review & Apply):** Summarize the main takeaway or principle learned from the problem and suggest how to apply it to similar problems. Use Korean for explanations.
`;
};

const generateQuizPrompt = (subject: Subject, prioritizeExamQuestions: boolean): string => {
  const quizInstruction = prioritizeExamQuestions
    ? "You MUST prioritize generating questions that have a high probability of appearing on a real school exam. For EACH question, you must provide its estimated `examProbability` ('High', 'Medium', or 'Low'). The list of questions should be sorted with 'High' probability questions first."
    : "Generate a diverse set covering the entire breadth of the provided material. For EACH question, you must provide its estimated `examProbability` ('High', 'Medium', or 'Low').";

  return `
You are an expert AI tutor, Study-GPT. Your task is to generate a new set of practice questions based on the provided study material for a high school student.

Subject: ${subject}

Based on the provided material, generate a new JSON object containing only practice questions that adheres to the specified schema.

**Quiz Generation Instructions:**
${quizInstruction}

**Output Generation Rules:**
1.  Generate at least 3 new multiple-choice and 2 new short-answer questions.
2.  For EACH question, if it refers to a specific part of the source material (like a text passage), you MUST include that relevant text in the 'context' field.
3.  For EVERY question, provide a detailed 3-step Chain-of-Thought explanation in Korean.
`;
};


export const generateStudyGuide = async (subject: Subject, content: { text?: string; files?: UploadedFile[] }, prioritizeExamQuestions: boolean): Promise<StudyGuide> => {
    // Fix: Use process.env.API_KEY as per the guidelines.
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        // Fix: Update error message to refer to API_KEY.
        throw new Error("API_KEY environment variable not set.");
    }
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = generatePrompt(subject, content.files?.length || 0, prioritizeExamQuestions);
    
    const contents: GenerateContentParameters['contents'] = { parts: [] };

    if (content.files && content.files.length > 0) {
        contents.parts.push({ text: prompt });
        for (const file of content.files) {
             contents.parts.push({
                inlineData: {
                    mimeType: file.mimeType,
                    data: file.data,
                },
            });
        }
    } else if (content.text) {
        const fullPrompt = prompt + `
Material Content:
---
${content.text}
---
`;
        contents.parts.push({ text: fullPrompt });
    } else {
        throw new Error("No content provided to generate study guide.");
    }
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents,
        config: {
            responseMimeType: "application/json",
            responseSchema: studyGuideSchema,
        },
    });

    const jsonString = response.text;
    try {
        const parsedJson = JSON.parse(jsonString);
        return parsedJson as StudyGuide;
    } catch (e) {
        console.error("Failed to parse JSON response:", jsonString);
        throw new Error("The AI returned an invalid format. Please try again.");
    }
};

export const regenerateQuiz = async (subject: Subject, content: { text?: string; files?: UploadedFile[] }, prioritizeExamQuestions: boolean): Promise<Quiz> => {
    // Fix: Use process.env.API_KEY as per the guidelines.
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        // Fix: Update error message to refer to API_KEY.
        throw new Error("API_KEY environment variable not set.");
    }
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = generateQuizPrompt(subject, prioritizeExamQuestions);
    
    const contents: GenerateContentParameters['contents'] = { parts: [] };

    if (content.files && content.files.length > 0) {
        contents.parts.push({ text: prompt });
        for (const file of content.files) {
             contents.parts.push({
                inlineData: {
                    mimeType: file.mimeType,
                    data: file.data,
                },
            });
        }
    } else if (content.text) {
        const fullPrompt = prompt + `
Material Content:
---
${content.text}
---
`;
        contents.parts.push({ text: fullPrompt });
    } else {
        throw new Error("No content provided to regenerate quiz.");
    }
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents,
        config: {
            responseMimeType: "application/json",
            responseSchema: quizSchema,
        },
    });

    const jsonString = response.text;
    try {
        const parsedJson = JSON.parse(jsonString);
        return parsedJson as Quiz;
    } catch (e) {
        console.error("Failed to parse JSON response for quiz regeneration:", jsonString);
        throw new Error("The AI returned an invalid format for the new quiz. Please try again.");
    }
};
